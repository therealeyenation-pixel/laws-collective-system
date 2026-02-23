/**
 * Universal Game Save Engine
 * L.A.W.S. Quest - Commercial Game Product
 * Owned by The L.A.W.S. Collective, LLC
 * 
 * Core engine for pause and auto-save functionality
 */

import {
  GameId,
  GameInfo,
  GAME_INFO,
  PauseState,
  PauseReason,
  PauseOptions,
  DEFAULT_PAUSE_OPTIONS,
  AutoSaveConfig,
  DEFAULT_AUTO_SAVE_CONFIG,
  AutoSaveState,
  AutoSaveTrigger,
  GameSaveMetadata,
  GameSaveData,
  GameSession,
  GameSaveEvent,
  GameSaveEventHandler,
} from "./types";

// ============================================
// CHECKSUM UTILITIES
// ============================================

/**
 * Generate a simple checksum for save data integrity
 */
export function generateChecksum(data: unknown): string {
  const str = JSON.stringify(data);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16).padStart(8, "0");
}

/**
 * Validate checksum matches data
 */
export function validateChecksum(data: unknown, checksum: string): boolean {
  return generateChecksum(data) === checksum;
}

// ============================================
// LOCAL STORAGE KEYS
// ============================================

const STORAGE_PREFIX = "laws_game_save_";
const getStorageKey = (gameId: GameId, slot: number) => `${STORAGE_PREFIX}${gameId}_slot_${slot}`;
const getMetadataKey = (gameId: GameId) => `${STORAGE_PREFIX}${gameId}_metadata`;
const getAutoSaveConfigKey = (gameId: GameId) => `${STORAGE_PREFIX}${gameId}_autosave_config`;
const getSessionKey = (gameId: GameId) => `${STORAGE_PREFIX}${gameId}_session`;

// ============================================
// PAUSE MANAGER
// ============================================

export class PauseManager {
  private state: PauseState;
  private options: PauseOptions;
  private pauseListeners: Set<(state: PauseState) => void> = new Set();
  private resumeListeners: Set<(state: PauseState) => void> = new Set();
  private onAutoSave?: () => Promise<void>;

  constructor(options: Partial<PauseOptions> = {}) {
    this.options = { ...DEFAULT_PAUSE_OPTIONS, ...options };
    this.state = {
      isPaused: false,
      pausedAt: null,
      pauseReason: null,
      totalPausedTime: 0,
      canResume: true,
    };

    // Listen for window blur/focus
    if (typeof window !== "undefined") {
      window.addEventListener("blur", () => this.handleWindowBlur());
      window.addEventListener("focus", () => this.handleWindowFocus());
      window.addEventListener("keydown", (e) => this.handleKeyDown(e));
    }
  }

  private handleWindowBlur(): void {
    if (!this.state.isPaused && this.options.pauseAnimations) {
      this.pause("window_blur");
    }
  }

  private handleWindowFocus(): void {
    if (this.state.isPaused && this.state.pauseReason === "window_blur") {
      // Don't auto-resume, just mark as resumable
      this.state.canResume = true;
    }
  }

  private handleKeyDown(e: KeyboardEvent): void {
    if (e.key === "Escape" || e.key === "p" || e.key === "P") {
      if (e.key === "Escape" || (e.key.toLowerCase() === "p" && !e.ctrlKey && !e.metaKey)) {
        this.toggle();
      }
    }
  }

  getState(): PauseState {
    return { ...this.state };
  }

  isPaused(): boolean {
    return this.state.isPaused;
  }

  async pause(reason: PauseReason = "user_requested"): Promise<void> {
    if (this.state.isPaused) return;

    this.state = {
      ...this.state,
      isPaused: true,
      pausedAt: Date.now(),
      pauseReason: reason,
      canResume: this.options.allowResume,
    };

    // Trigger auto-save if configured
    if (this.options.autoSaveOnPause && this.onAutoSave) {
      try {
        await this.onAutoSave();
      } catch (error) {
        console.error("Auto-save on pause failed:", error);
      }
    }

    this.notifyPauseListeners();
  }

  resume(): void {
    if (!this.state.isPaused || !this.state.canResume) return;

    const pausedDuration = this.state.pausedAt ? Date.now() - this.state.pausedAt : 0;

    this.state = {
      ...this.state,
      isPaused: false,
      pausedAt: null,
      pauseReason: null,
      totalPausedTime: this.state.totalPausedTime + pausedDuration,
    };

    this.notifyResumeListeners();
  }

  toggle(): void {
    if (this.state.isPaused) {
      this.resume();
    } else {
      this.pause("user_requested");
    }
  }

  setOptions(options: Partial<PauseOptions>): void {
    this.options = { ...this.options, ...options };
  }

  getOptions(): PauseOptions {
    return { ...this.options };
  }

  setAutoSaveCallback(callback: () => Promise<void>): void {
    this.onAutoSave = callback;
  }

  onPause(callback: (state: PauseState) => void): () => void {
    this.pauseListeners.add(callback);
    return () => this.pauseListeners.delete(callback);
  }

  onResume(callback: (state: PauseState) => void): () => void {
    this.resumeListeners.add(callback);
    return () => this.resumeListeners.delete(callback);
  }

  private notifyPauseListeners(): void {
    this.pauseListeners.forEach((listener) => listener(this.state));
  }

  private notifyResumeListeners(): void {
    this.resumeListeners.forEach((listener) => listener(this.state));
  }

  destroy(): void {
    this.pauseListeners.clear();
    this.resumeListeners.clear();
  }
}

// ============================================
// GAME SAVE ENGINE
// ============================================

export class GameSaveEngine<T> {
  private gameId: GameId;
  private gameInfo: GameInfo;
  private userId: string;
  private autoSaveConfig: AutoSaveConfig;
  private autoSaveState: AutoSaveState;
  private autoSaveInterval: NodeJS.Timeout | null = null;
  private eventListeners: Set<GameSaveEventHandler> = new Set();
  private currentState: T | null = null;
  private getStateCallback: (() => T) | null = null;
  private version: string = "1.0.0";

  constructor(
    gameId: GameId,
    userId: string,
    config: Partial<AutoSaveConfig> = {}
  ) {
    this.gameId = gameId;
    this.gameInfo = GAME_INFO[gameId];
    this.userId = userId;
    this.autoSaveConfig = { ...DEFAULT_AUTO_SAVE_CONFIG, ...config };
    this.autoSaveState = {
      lastAutoSave: null,
      nextAutoSave: null,
      autoSaveCount: 0,
      isSaving: false,
      lastSaveError: null,
    };

    // Load saved config
    this.loadAutoSaveConfig();
  }

  // ============================================
  // STATE MANAGEMENT
  // ============================================

  setStateGetter(callback: () => T): void {
    this.getStateCallback = callback;
  }

  updateState(state: T): void {
    this.currentState = state;
  }

  private getCurrentState(): T {
    if (this.getStateCallback) {
      return this.getStateCallback();
    }
    if (this.currentState) {
      return this.currentState;
    }
    throw new Error("No game state available");
  }

  // ============================================
  // SAVE OPERATIONS
  // ============================================

  async save(
    slot: number,
    state?: T,
    trigger: AutoSaveTrigger = "manual",
    name?: string
  ): Promise<GameSaveData<T>> {
    const gameState = state || this.getCurrentState();
    
    this.emitEvent({ type: "save_started", slot, trigger });
    this.autoSaveState.isSaving = true;

    try {
      const metadata: GameSaveMetadata = {
        saveId: `${this.gameId}_${slot}_${Date.now()}`,
        gameId: this.gameId,
        userId: this.userId,
        slot,
        name: name || `Save ${slot}`,
        description: this.generateSaveDescription(gameState),
        createdAt: Date.now(),
        updatedAt: Date.now(),
        playDuration: this.calculatePlayDuration(),
        isAutoSave: trigger !== "manual",
        trigger,
        version: this.version,
        platform: "web",
      };

      const saveData: GameSaveData<T> = {
        metadata,
        gameState,
        checksum: generateChecksum(gameState),
      };

      // Save to local storage
      const storageKey = getStorageKey(this.gameId, slot);
      localStorage.setItem(storageKey, JSON.stringify(saveData));

      // Update metadata index
      await this.updateMetadataIndex(metadata);

      this.autoSaveState = {
        ...this.autoSaveState,
        lastAutoSave: Date.now(),
        autoSaveCount: this.autoSaveState.autoSaveCount + 1,
        isSaving: false,
        lastSaveError: null,
      };

      this.emitEvent({ type: "save_completed", slot, metadata });
      return saveData;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      this.autoSaveState = {
        ...this.autoSaveState,
        isSaving: false,
        lastSaveError: errorMessage,
      };
      this.emitEvent({ type: "save_failed", slot, error: errorMessage });
      throw error;
    }
  }

  async load(slot: number): Promise<GameSaveData<T> | null> {
    this.emitEvent({ type: "load_started", slot });

    try {
      const storageKey = getStorageKey(this.gameId, slot);
      const data = localStorage.getItem(storageKey);

      if (!data) {
        return null;
      }

      const saveData: GameSaveData<T> = JSON.parse(data);

      // Validate checksum
      if (!validateChecksum(saveData.gameState, saveData.checksum)) {
        throw new Error("Save data corrupted - checksum mismatch");
      }

      // Migrate old saves if needed
      const migratedData = this.migrateSave(saveData);

      this.currentState = migratedData.gameState;
      this.emitEvent({ type: "load_completed", slot, metadata: migratedData.metadata });
      return migratedData;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      this.emitEvent({ type: "load_failed", slot, error: errorMessage });
      throw error;
    }
  }

  async delete(slot: number): Promise<boolean> {
    try {
      const storageKey = getStorageKey(this.gameId, slot);
      localStorage.removeItem(storageKey);
      await this.removeFromMetadataIndex(slot);
      return true;
    } catch (error) {
      console.error("Failed to delete save:", error);
      return false;
    }
  }

  // ============================================
  // SLOT MANAGEMENT
  // ============================================

  async listSaves(): Promise<GameSaveMetadata[]> {
    const metadataKey = getMetadataKey(this.gameId);
    const data = localStorage.getItem(metadataKey);
    
    if (!data) {
      return [];
    }

    try {
      const metadata: GameSaveMetadata[] = JSON.parse(data);
      return metadata.sort((a, b) => b.updatedAt - a.updatedAt);
    } catch {
      return [];
    }
  }

  async getSaveMetadata(slot: number): Promise<GameSaveMetadata | null> {
    const saves = await this.listSaves();
    return saves.find((s) => s.slot === slot) || null;
  }

  async getNextAvailableSlot(): Promise<number> {
    const saves = await this.listSaves();
    const usedSlots = new Set(saves.map((s) => s.slot));
    
    for (let i = 1; i <= this.gameInfo.maxSaveSlots; i++) {
      if (!usedSlots.has(i)) {
        return i;
      }
    }

    // All slots used, return the oldest auto-save slot or slot 1
    const autoSaves = saves.filter((s) => s.isAutoSave).sort((a, b) => a.updatedAt - b.updatedAt);
    return autoSaves.length > 0 ? autoSaves[0].slot : 1;
  }

  private async updateMetadataIndex(metadata: GameSaveMetadata): Promise<void> {
    const saves = await this.listSaves();
    const existingIndex = saves.findIndex((s) => s.slot === metadata.slot);
    
    if (existingIndex >= 0) {
      saves[existingIndex] = metadata;
    } else {
      saves.push(metadata);
    }

    const metadataKey = getMetadataKey(this.gameId);
    localStorage.setItem(metadataKey, JSON.stringify(saves));
  }

  private async removeFromMetadataIndex(slot: number): Promise<void> {
    const saves = await this.listSaves();
    const filtered = saves.filter((s) => s.slot !== slot);
    const metadataKey = getMetadataKey(this.gameId);
    localStorage.setItem(metadataKey, JSON.stringify(filtered));
  }

  // ============================================
  // AUTO-SAVE
  // ============================================

  startAutoSave(): void {
    if (!this.autoSaveConfig.enabled || !this.gameInfo.supportsAutoSave) {
      return;
    }

    this.stopAutoSave();

    this.autoSaveInterval = setInterval(async () => {
      await this.triggerAutoSave();
    }, this.autoSaveConfig.intervalMs);

    this.autoSaveState.nextAutoSave = Date.now() + this.autoSaveConfig.intervalMs;
  }

  stopAutoSave(): void {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
      this.autoSaveInterval = null;
    }
    this.autoSaveState.nextAutoSave = null;
  }

  async triggerAutoSave(): Promise<void> {
    if (this.autoSaveState.isSaving) {
      return;
    }

    this.emitEvent({ type: "auto_save_triggered" });

    try {
      // Find or create auto-save slot
      const saves = await this.listSaves();
      const autoSaves = saves.filter((s) => s.isAutoSave);
      
      let slot: number;
      if (autoSaves.length >= this.autoSaveConfig.maxAutoSaves) {
        // Overwrite oldest auto-save
        const oldest = autoSaves.sort((a, b) => a.updatedAt - b.updatedAt)[0];
        slot = oldest.slot;
      } else {
        slot = await this.getNextAvailableSlot();
      }

      await this.save(slot, undefined, "interval", `Auto-save ${new Date().toLocaleTimeString()}`);
      
      this.autoSaveState.nextAutoSave = Date.now() + this.autoSaveConfig.intervalMs;
    } catch (error) {
      console.error("Auto-save failed:", error);
    }
  }

  async saveOnPause(): Promise<void> {
    if (!this.autoSaveConfig.saveOnPause) return;
    
    const slot = await this.getNextAvailableSlot();
    await this.save(slot, undefined, "pause", "Pause save");
  }

  async saveOnExit(): Promise<void> {
    if (!this.autoSaveConfig.saveOnExit) return;
    
    const slot = await this.getNextAvailableSlot();
    await this.save(slot, undefined, "exit", "Exit save");
  }

  // ============================================
  // CONFIGURATION
  // ============================================

  setAutoSaveConfig(config: Partial<AutoSaveConfig>): void {
    this.autoSaveConfig = { ...this.autoSaveConfig, ...config };
    this.saveAutoSaveConfig();
    
    // Restart auto-save with new config
    if (this.autoSaveInterval) {
      this.startAutoSave();
    }
  }

  getAutoSaveConfig(): AutoSaveConfig {
    return { ...this.autoSaveConfig };
  }

  getAutoSaveState(): AutoSaveState {
    return { ...this.autoSaveState };
  }

  private loadAutoSaveConfig(): void {
    const key = getAutoSaveConfigKey(this.gameId);
    const data = localStorage.getItem(key);
    
    if (data) {
      try {
        const config = JSON.parse(data);
        this.autoSaveConfig = { ...this.autoSaveConfig, ...config };
      } catch {
        // Use defaults
      }
    }
  }

  private saveAutoSaveConfig(): void {
    const key = getAutoSaveConfigKey(this.gameId);
    localStorage.setItem(key, JSON.stringify(this.autoSaveConfig));
  }

  // ============================================
  // EVENTS
  // ============================================

  addEventListener(handler: GameSaveEventHandler): () => void {
    this.eventListeners.add(handler);
    return () => this.eventListeners.delete(handler);
  }

  private emitEvent(event: GameSaveEvent): void {
    this.eventListeners.forEach((handler) => handler(event));
  }

  // ============================================
  // UTILITIES
  // ============================================

  private generateSaveDescription(state: T): string {
    // Override in game-specific implementations
    return `Game save - ${new Date().toLocaleString()}`;
  }

  private calculatePlayDuration(): number {
    // This should be tracked by the game session
    return 0;
  }

  private migrateSave(saveData: GameSaveData<T>): GameSaveData<T> {
    // Handle version migrations here
    if (saveData.metadata.version !== this.version) {
      // Perform migration logic
      saveData.metadata.version = this.version;
      saveData.checksum = generateChecksum(saveData.gameState);
    }
    return saveData;
  }

  // ============================================
  // CLEANUP
  // ============================================

  destroy(): void {
    this.stopAutoSave();
    this.eventListeners.clear();
  }
}

// ============================================
// GAME SESSION MANAGER
// ============================================

export class GameSessionManager {
  private session: GameSession | null = null;
  private pauseManager: PauseManager;
  private saveEngine: GameSaveEngine<unknown> | null = null;
  private startTime: number = 0;
  private pausedTime: number = 0;

  constructor(gameId: GameId, userId: string) {
    this.pauseManager = new PauseManager();
    
    this.session = {
      sessionId: `${gameId}_${userId}_${Date.now()}`,
      gameId,
      userId,
      startedAt: Date.now(),
      endedAt: null,
      duration: 0,
      pauseState: this.pauseManager.getState(),
      autoSaveState: {
        lastAutoSave: null,
        nextAutoSave: null,
        autoSaveCount: 0,
        isSaving: false,
        lastSaveError: null,
      },
      currentSaveSlot: null,
      isActive: true,
    };

    this.startTime = Date.now();
  }

  setSaveEngine<T>(engine: GameSaveEngine<T>): void {
    this.saveEngine = engine as GameSaveEngine<unknown>;
    
    // Connect pause manager to save engine
    this.pauseManager.setAutoSaveCallback(async () => {
      if (this.saveEngine) {
        await this.saveEngine.saveOnPause();
      }
    });
  }

  getPauseManager(): PauseManager {
    return this.pauseManager;
  }

  getSession(): GameSession | null {
    if (!this.session) return null;
    
    return {
      ...this.session,
      duration: this.getPlayDuration(),
      pauseState: this.pauseManager.getState(),
      autoSaveState: this.saveEngine?.getAutoSaveState() || this.session.autoSaveState,
    };
  }

  getPlayDuration(): number {
    const totalTime = Date.now() - this.startTime;
    return totalTime - this.pauseManager.getState().totalPausedTime;
  }

  async endSession(): Promise<void> {
    if (!this.session) return;

    // Save on exit
    if (this.saveEngine) {
      await this.saveEngine.saveOnExit();
    }

    this.session = {
      ...this.session,
      endedAt: Date.now(),
      duration: this.getPlayDuration(),
      isActive: false,
    };

    this.pauseManager.destroy();
    this.saveEngine?.destroy();
  }

  setCurrentSaveSlot(slot: number | null): void {
    if (this.session) {
      this.session.currentSaveSlot = slot;
    }
  }
}

// ============================================
// FACTORY FUNCTIONS
// ============================================

export function createGameSaveEngine<T>(
  gameId: GameId,
  userId: string,
  config?: Partial<AutoSaveConfig>
): GameSaveEngine<T> {
  return new GameSaveEngine<T>(gameId, userId, config);
}

export function createGameSession(
  gameId: GameId,
  userId: string
): GameSessionManager {
  return new GameSessionManager(gameId, userId);
}

export function createPauseManager(
  options?: Partial<PauseOptions>
): PauseManager {
  return new PauseManager(options);
}
