/**
 * Video Provider Service
 * Handles integration with Daily.co and prepares for future Microsoft Teams integration
 */

import { getDb } from "../db";
import { videoProviderConfigs } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

// Types for video providers
export interface VideoRoom {
  id: string;
  name: string;
  url: string;
  provider: "daily" | "teams" | "custom";
  createdAt: Date;
  expiresAt?: Date;
  config?: Record<string, any>;
}

export interface VideoRoomConfig {
  name?: string;
  privacy?: "public" | "private";
  maxParticipants?: number;
  enableRecording?: boolean;
  enableWaitingRoom?: boolean;
  expiresInMinutes?: number;
  startAudioOff?: boolean;
  startVideoOff?: boolean;
}

export interface JoinToken {
  token: string;
  roomUrl: string;
  expiresAt: Date;
}

// Daily.co API types
interface DailyRoomResponse {
  id: string;
  name: string;
  api_created: boolean;
  privacy: string;
  url: string;
  created_at: string;
  config: {
    max_participants?: number;
    enable_recording?: string;
    enable_knocking?: boolean;
    exp?: number;
    start_audio_off?: boolean;
    start_video_off?: boolean;
  };
}

interface DailyMeetingTokenResponse {
  token: string;
}

/**
 * Get the configured video provider
 */
export async function getActiveProvider(): Promise<"daily" | "teams" | "custom" | null> {
  const db = await getDb();
  if (!db) return "daily";
  const [config] = await db
    .select()
    .from(videoProviderConfigs)
    .where(eq(videoProviderConfigs.isDefault, true))
    .limit(1);
  
  if (config && config.isEnabled) {
    // Filter out zoom as it's not in the return type
    const provider = config.provider;
    if (provider === "zoom") return "daily";
    return provider as "daily" | "teams" | "custom";
  }
  
  // Default to Daily.co if no config
  return "daily";
}

/**
 * Get provider configuration
 */
export async function getProviderConfig(provider: "daily" | "teams" | "zoom" | "custom") {
  const db = await getDb();
  if (!db) return null;
  const [config] = await db
    .select()
    .from(videoProviderConfigs)
    .where(eq(videoProviderConfigs.provider, provider))
    .limit(1);
  
  return config;
}

/**
 * Daily.co API client
 */
class DailyClient {
  private apiKey: string;
  private baseUrl = "https://api.daily.co/v1";
  
  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }
  
  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        "Authorization": `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Daily.co API error: ${response.status} - ${error}`);
    }
    
    return response.json();
  }
  
  /**
   * Create a new video room
   */
  async createRoom(config: VideoRoomConfig): Promise<DailyRoomResponse> {
    const roomConfig: any = {
      privacy: config.privacy || "private",
    };
    
    if (config.name) {
      roomConfig.name = config.name;
    }
    
    if (config.maxParticipants) {
      roomConfig.properties = {
        ...roomConfig.properties,
        max_participants: config.maxParticipants,
      };
    }
    
    if (config.enableRecording) {
      roomConfig.properties = {
        ...roomConfig.properties,
        enable_recording: "cloud",
      };
    }
    
    if (config.enableWaitingRoom) {
      roomConfig.properties = {
        ...roomConfig.properties,
        enable_knocking: true,
      };
    }
    
    if (config.expiresInMinutes) {
      const expiresAt = Math.floor(Date.now() / 1000) + (config.expiresInMinutes * 60);
      roomConfig.properties = {
        ...roomConfig.properties,
        exp: expiresAt,
      };
    }
    
    if (config.startAudioOff) {
      roomConfig.properties = {
        ...roomConfig.properties,
        start_audio_off: true,
      };
    }
    
    if (config.startVideoOff) {
      roomConfig.properties = {
        ...roomConfig.properties,
        start_video_off: true,
      };
    }
    
    return this.request<DailyRoomResponse>("/rooms", {
      method: "POST",
      body: JSON.stringify(roomConfig),
    });
  }
  
  /**
   * Get room details
   */
  async getRoom(roomName: string): Promise<DailyRoomResponse> {
    return this.request<DailyRoomResponse>(`/rooms/${roomName}`);
  }
  
  /**
   * Delete a room
   */
  async deleteRoom(roomName: string): Promise<void> {
    await this.request(`/rooms/${roomName}`, {
      method: "DELETE",
    });
  }
  
  /**
   * Create a meeting token for a participant
   */
  async createMeetingToken(options: {
    roomName: string;
    userName?: string;
    userId?: string;
    isOwner?: boolean;
    expiresInMinutes?: number;
    enableRecording?: boolean;
    enableScreenShare?: boolean;
  }): Promise<DailyMeetingTokenResponse> {
    const properties: any = {
      room_name: options.roomName,
    };
    
    if (options.userName) {
      properties.user_name = options.userName;
    }
    
    if (options.userId) {
      properties.user_id = options.userId;
    }
    
    if (options.isOwner) {
      properties.is_owner = true;
    }
    
    if (options.expiresInMinutes) {
      properties.exp = Math.floor(Date.now() / 1000) + (options.expiresInMinutes * 60);
    }
    
    if (options.enableRecording !== undefined) {
      properties.enable_recording = options.enableRecording ? "cloud" : false;
    }
    
    if (options.enableScreenShare !== undefined) {
      properties.enable_screenshare = options.enableScreenShare;
    }
    
    return this.request<DailyMeetingTokenResponse>("/meeting-tokens", {
      method: "POST",
      body: JSON.stringify({ properties }),
    });
  }
  
  /**
   * Get room recordings
   */
  async getRoomRecordings(roomName: string): Promise<any[]> {
    const response = await this.request<{ data: any[] }>(`/recordings?room_name=${roomName}`);
    return response.data;
  }
}

/**
 * Video Provider Service - Main interface
 */
export class VideoProviderService {
  private dailyClient: DailyClient | null = null;
  
  /**
   * Initialize Daily.co client
   */
  async initializeDaily(apiKey?: string): Promise<void> {
    if (apiKey) {
      this.dailyClient = new DailyClient(apiKey);
      return;
    }
    
    // Try to get API key from database config
    const config = await getProviderConfig("daily");
    if (config?.apiKey) {
      this.dailyClient = new DailyClient(config.apiKey);
    }
  }
  
  /**
   * Create a video room
   */
  async createRoom(config: VideoRoomConfig): Promise<VideoRoom> {
    const provider = await getActiveProvider();
    
    if (provider === "daily") {
      if (!this.dailyClient) {
        await this.initializeDaily();
      }
      
      if (!this.dailyClient) {
        // Return a mock room for demo/development
        return this.createMockRoom(config);
      }
      
      const room = await this.dailyClient.createRoom(config);
      
      return {
        id: room.id,
        name: room.name,
        url: room.url,
        provider: "daily",
        createdAt: new Date(room.created_at),
        expiresAt: room.config.exp ? new Date(room.config.exp * 1000) : undefined,
        config: room.config,
      };
    }
    
    if (provider === "teams") {
      // Future Microsoft Teams integration
      throw new Error("Microsoft Teams integration not yet implemented. Configure Daily.co or use custom provider.");
    }
    
    // Custom/mock provider for development
    return this.createMockRoom(config);
  }
  
  /**
   * Create a mock room for development/demo
   */
  private createMockRoom(config: VideoRoomConfig): VideoRoom {
    const roomName = config.name || `room-${Date.now()}`;
    return {
      id: `mock-${Date.now()}`,
      name: roomName,
      url: `https://luvonpurpose.daily.co/${roomName}`,
      provider: "custom",
      createdAt: new Date(),
      expiresAt: config.expiresInMinutes 
        ? new Date(Date.now() + config.expiresInMinutes * 60 * 1000)
        : undefined,
      config: {
        maxParticipants: config.maxParticipants,
        enableRecording: config.enableRecording,
        enableWaitingRoom: config.enableWaitingRoom,
      },
    };
  }
  
  /**
   * Get a join token for a participant
   */
  async getJoinToken(options: {
    roomName: string;
    userName: string;
    userId: string;
    isHost: boolean;
    meetingDuration?: number;
  }): Promise<JoinToken> {
    const provider = await getActiveProvider();
    
    if (provider === "daily" && this.dailyClient) {
      const token = await this.dailyClient.createMeetingToken({
        roomName: options.roomName,
        userName: options.userName,
        userId: options.userId,
        isOwner: options.isHost,
        expiresInMinutes: options.meetingDuration || 120,
        enableRecording: options.isHost,
        enableScreenShare: true,
      });
      
      const config = await getProviderConfig("daily");
      const domain = (config?.settings as any)?.domain || "luvonpurpose";
      
      return {
        token: token.token,
        roomUrl: `https://${domain}.daily.co/${options.roomName}?t=${token.token}`,
        expiresAt: new Date(Date.now() + (options.meetingDuration || 120) * 60 * 1000),
      };
    }
    
    // Mock token for development
    return {
      token: `mock-token-${Date.now()}`,
      roomUrl: `https://luvonpurpose.daily.co/${options.roomName}`,
      expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours
    };
  }
  
  /**
   * Delete a room
   */
  async deleteRoom(roomName: string): Promise<void> {
    if (this.dailyClient) {
      await this.dailyClient.deleteRoom(roomName);
    }
  }
  
  /**
   * Get room recordings
   */
  async getRecordings(roomName: string): Promise<any[]> {
    if (this.dailyClient) {
      return this.dailyClient.getRoomRecordings(roomName);
    }
    return [];
  }
}

// Singleton instance
export const videoProvider = new VideoProviderService();

/**
 * Microsoft Teams Integration Preparation
 * This section outlines the structure for future Teams integration
 */
export interface TeamsConfig {
  tenantId: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

export interface TeamsMeeting {
  id: string;
  joinUrl: string;
  subject: string;
  startDateTime: string;
  endDateTime: string;
  participants: {
    organizer: { identity: { user: { id: string; displayName: string } } };
    attendees: Array<{ identity: { user: { id: string; displayName: string } } }>;
  };
}

/**
 * Future Microsoft Teams client (placeholder)
 * Will use Microsoft Graph API when implemented
 */
export class TeamsClient {
  private config: TeamsConfig;
  private accessToken: string | null = null;
  
  constructor(config: TeamsConfig) {
    this.config = config;
  }
  
  /**
   * Get OAuth authorization URL
   */
  getAuthUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      response_type: "code",
      redirect_uri: this.config.redirectUri,
      scope: "OnlineMeetings.ReadWrite Calendars.ReadWrite User.Read",
      state,
    });
    
    return `https://login.microsoftonline.com/${this.config.tenantId}/oauth2/v2.0/authorize?${params}`;
  }
  
  /**
   * Exchange authorization code for tokens
   */
  async exchangeCode(code: string): Promise<{ accessToken: string; refreshToken: string }> {
    // Implementation will use Microsoft Graph API
    throw new Error("Microsoft Teams integration not yet implemented");
  }
  
  /**
   * Create an online meeting
   */
  async createMeeting(options: {
    subject: string;
    startDateTime: Date;
    endDateTime: Date;
    attendees?: string[];
  }): Promise<TeamsMeeting> {
    // Implementation will use Microsoft Graph API
    // POST https://graph.microsoft.com/v1.0/me/onlineMeetings
    throw new Error("Microsoft Teams integration not yet implemented");
  }
  
  /**
   * Get meeting details
   */
  async getMeeting(meetingId: string): Promise<TeamsMeeting> {
    // Implementation will use Microsoft Graph API
    throw new Error("Microsoft Teams integration not yet implemented");
  }
}

/**
 * Helper to check if Teams is configured
 */
export async function isTeamsConfigured(): Promise<boolean> {
  const config = await getProviderConfig("teams");
  return !!(config?.isEnabled && config?.tenantId && config?.apiKey);
}

/**
 * Helper to check if Daily is configured
 */
export async function isDailyConfigured(): Promise<boolean> {
  const config = await getProviderConfig("daily");
  return !!(config?.isEnabled && config?.apiKey);
}
