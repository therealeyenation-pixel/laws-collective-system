import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";

// Types for multiplayer game rooms
interface Player {
  id: string;
  name: string;
  avatarUrl?: string;
  role: "host" | "player";
  status: "active" | "away" | "disconnected";
  joinedAt: number;
  lastActivity: number;
  votes: string[];
  resources: {
    funds: number;
    labor: number;
    materials: number;
  };
}

interface GameRoom {
  id: string;
  name: string;
  hostId: string;
  gameType: "community-builder" | "laws-quest";
  status: "waiting" | "in-progress" | "paused" | "completed";
  maxPlayers: number;
  players: Map<string, Player>;
  gameState: any;
  currentTurn: number;
  currentPhase: string;
  chat: ChatMessage[];
  createdAt: number;
  updatedAt: number;
  settings: {
    turnTimeLimit: number; // seconds, 0 = unlimited
    votingRequired: boolean;
    minPlayersToStart: number;
  };
}

interface ChatMessage {
  id: string;
  playerId: string;
  playerName: string;
  message: string;
  type: "chat" | "system" | "action";
  timestamp: number;
}

interface Vote {
  playerId: string;
  optionId: string;
  timestamp: number;
}

interface VotingSession {
  id: string;
  roomId: string;
  question: string;
  options: { id: string; label: string; description?: string }[];
  votes: Vote[];
  status: "open" | "closed";
  createdAt: number;
  closesAt: number;
  result?: string;
}

// In-memory storage (would be Redis in production)
const gameRooms = new Map<string, GameRoom>();
const playerRooms = new Map<string, string>(); // playerId -> roomId
const votingSessions = new Map<string, VotingSession>();

// Helper functions
function generateRoomId(): string {
  return `room_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
}

function generateMessageId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
}

function generateVoteId(): string {
  return `vote_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
}

function getRoom(roomId: string): GameRoom {
  const room = gameRooms.get(roomId);
  if (!room) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Room not found" });
  }
  return room;
}

function serializeRoom(room: GameRoom) {
  return {
    id: room.id,
    name: room.name,
    hostId: room.hostId,
    gameType: room.gameType,
    status: room.status,
    maxPlayers: room.maxPlayers,
    players: Array.from(room.players.values()),
    playerCount: room.players.size,
    currentTurn: room.currentTurn,
    currentPhase: room.currentPhase,
    chat: room.chat.slice(-50), // Last 50 messages
    createdAt: room.createdAt,
    updatedAt: room.updatedAt,
    settings: room.settings,
  };
}

export const multiplayerRouter = router({
  // Room Management
  createRoom: protectedProcedure
    .input(z.object({
      name: z.string().min(1).max(50),
      gameType: z.enum(["community-builder", "laws-quest"]),
      maxPlayers: z.number().min(2).max(10).default(6),
      settings: z.object({
        turnTimeLimit: z.number().min(0).max(600).default(120),
        votingRequired: z.boolean().default(true),
        minPlayersToStart: z.number().min(2).max(10).default(2),
      }).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const roomId = generateRoomId();
      const playerId = ctx.user.id.toString();
      
      // Check if player is already in a room
      const existingRoomId = playerRooms.get(playerId);
      if (existingRoomId) {
        throw new TRPCError({ 
          code: "BAD_REQUEST", 
          message: "You are already in a room. Leave the current room first." 
        });
      }

      const host: Player = {
        id: playerId,
        name: ctx.user.name || `Player ${playerId}`,
        role: "host",
        status: "active",
        joinedAt: Date.now(),
        lastActivity: Date.now(),
        votes: [],
        resources: {
          funds: 100000,
          labor: 50,
          materials: 100,
        },
      };

      const room: GameRoom = {
        id: roomId,
        name: input.name,
        hostId: playerId,
        gameType: input.gameType,
        status: "waiting",
        maxPlayers: input.maxPlayers,
        players: new Map([[playerId, host]]),
        gameState: null,
        currentTurn: 0,
        currentPhase: "waiting",
        chat: [{
          id: generateMessageId(),
          playerId: "system",
          playerName: "System",
          message: `Room "${input.name}" created. Waiting for players to join...`,
          type: "system",
          timestamp: Date.now(),
        }],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        settings: input.settings || {
          turnTimeLimit: 120,
          votingRequired: true,
          minPlayersToStart: 2,
        },
      };

      gameRooms.set(roomId, room);
      playerRooms.set(playerId, roomId);

      return {
        success: true,
        room: serializeRoom(room),
        message: "Room created successfully",
      };
    }),

  joinRoom: protectedProcedure
    .input(z.object({
      roomId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const room = getRoom(input.roomId);
      const playerId = ctx.user.id.toString();

      // Check if player is already in a room
      const existingRoomId = playerRooms.get(playerId);
      if (existingRoomId && existingRoomId !== input.roomId) {
        throw new TRPCError({ 
          code: "BAD_REQUEST", 
          message: "You are already in another room. Leave that room first." 
        });
      }

      // Check if already in this room
      if (room.players.has(playerId)) {
        // Update status to active
        const player = room.players.get(playerId)!;
        player.status = "active";
        player.lastActivity = Date.now();
        return {
          success: true,
          room: serializeRoom(room),
          message: "Reconnected to room",
        };
      }

      // Check room capacity
      if (room.players.size >= room.maxPlayers) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Room is full" });
      }

      // Check room status
      if (room.status !== "waiting") {
        throw new TRPCError({ 
          code: "BAD_REQUEST", 
          message: "Game is already in progress" 
        });
      }

      const player: Player = {
        id: playerId,
        name: ctx.user.name || `Player ${playerId}`,
        role: "player",
        status: "active",
        joinedAt: Date.now(),
        lastActivity: Date.now(),
        votes: [],
        resources: {
          funds: 100000,
          labor: 50,
          materials: 100,
        },
      };

      room.players.set(playerId, player);
      playerRooms.set(playerId, input.roomId);
      room.updatedAt = Date.now();

      // Add system message
      room.chat.push({
        id: generateMessageId(),
        playerId: "system",
        playerName: "System",
        message: `${player.name} joined the room`,
        type: "system",
        timestamp: Date.now(),
      });

      return {
        success: true,
        room: serializeRoom(room),
        message: "Joined room successfully",
      };
    }),

  leaveRoom: protectedProcedure
    .input(z.object({
      roomId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const room = getRoom(input.roomId);
      const playerId = ctx.user.id.toString();

      if (!room.players.has(playerId)) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "You are not in this room" });
      }

      const player = room.players.get(playerId)!;
      room.players.delete(playerId);
      playerRooms.delete(playerId);
      room.updatedAt = Date.now();

      // Add system message
      room.chat.push({
        id: generateMessageId(),
        playerId: "system",
        playerName: "System",
        message: `${player.name} left the room`,
        type: "system",
        timestamp: Date.now(),
      });

      // If host leaves, transfer host or close room
      if (playerId === room.hostId) {
        const remainingPlayers = Array.from(room.players.values());
        if (remainingPlayers.length > 0) {
          const newHost = remainingPlayers[0];
          newHost.role = "host";
          room.hostId = newHost.id;
          room.chat.push({
            id: generateMessageId(),
            playerId: "system",
            playerName: "System",
            message: `${newHost.name} is now the host`,
            type: "system",
            timestamp: Date.now(),
          });
        } else {
          // Delete empty room
          gameRooms.delete(input.roomId);
        }
      }

      return {
        success: true,
        message: "Left room successfully",
      };
    }),

  getRoom: protectedProcedure
    .input(z.object({
      roomId: z.string(),
    }))
    .query(async ({ input }) => {
      const room = getRoom(input.roomId);
      return serializeRoom(room);
    }),

  listRooms: publicProcedure
    .input(z.object({
      gameType: z.enum(["community-builder", "laws-quest"]).optional(),
      status: z.enum(["waiting", "in-progress", "paused", "completed"]).optional(),
    }))
    .query(async ({ input }) => {
      let rooms = Array.from(gameRooms.values());

      if (input.gameType) {
        rooms = rooms.filter(r => r.gameType === input.gameType);
      }
      if (input.status) {
        rooms = rooms.filter(r => r.status === input.status);
      }

      return rooms.map(room => ({
        id: room.id,
        name: room.name,
        gameType: room.gameType,
        status: room.status,
        playerCount: room.players.size,
        maxPlayers: room.maxPlayers,
        hostName: room.players.get(room.hostId)?.name || "Unknown",
        createdAt: room.createdAt,
      }));
    }),

  // Game Actions
  startGame: protectedProcedure
    .input(z.object({
      roomId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const room = getRoom(input.roomId);
      const playerId = ctx.user.id.toString();

      if (playerId !== room.hostId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Only the host can start the game" });
      }

      if (room.players.size < room.settings.minPlayersToStart) {
        throw new TRPCError({ 
          code: "BAD_REQUEST", 
          message: `Need at least ${room.settings.minPlayersToStart} players to start` 
        });
      }

      room.status = "in-progress";
      room.currentTurn = 1;
      room.currentPhase = "startup";
      room.updatedAt = Date.now();

      // Initialize game state based on game type
      if (room.gameType === "community-builder") {
        room.gameState = {
          communityFunds: 500000,
          population: 100,
          buildings: [],
          services: [],
          quarterlyPriorities: generateQuarterlyPriorities(),
          contracts: generateServiceContracts(),
          events: [],
        };
      }

      room.chat.push({
        id: generateMessageId(),
        playerId: "system",
        playerName: "System",
        message: "Game started! Good luck, community builders!",
        type: "system",
        timestamp: Date.now(),
      });

      return {
        success: true,
        room: serializeRoom(room),
        message: "Game started",
      };
    }),

  // Chat
  sendMessage: protectedProcedure
    .input(z.object({
      roomId: z.string(),
      message: z.string().min(1).max(500),
    }))
    .mutation(async ({ ctx, input }) => {
      const room = getRoom(input.roomId);
      const playerId = ctx.user.id.toString();

      if (!room.players.has(playerId)) {
        throw new TRPCError({ code: "FORBIDDEN", message: "You are not in this room" });
      }

      const player = room.players.get(playerId)!;
      player.lastActivity = Date.now();

      const chatMessage: ChatMessage = {
        id: generateMessageId(),
        playerId,
        playerName: player.name,
        message: input.message,
        type: "chat",
        timestamp: Date.now(),
      };

      room.chat.push(chatMessage);
      room.updatedAt = Date.now();

      // Keep only last 100 messages
      if (room.chat.length > 100) {
        room.chat = room.chat.slice(-100);
      }

      return {
        success: true,
        message: chatMessage,
      };
    }),

  getMessages: protectedProcedure
    .input(z.object({
      roomId: z.string(),
      since: z.number().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const room = getRoom(input.roomId);
      const playerId = ctx.user.id.toString();

      if (!room.players.has(playerId)) {
        throw new TRPCError({ code: "FORBIDDEN", message: "You are not in this room" });
      }

      let messages = room.chat;
      if (input.since) {
        messages = messages.filter(m => m.timestamp > input.since);
      }

      return messages;
    }),

  // Voting
  startVote: protectedProcedure
    .input(z.object({
      roomId: z.string(),
      question: z.string(),
      options: z.array(z.object({
        id: z.string(),
        label: z.string(),
        description: z.string().optional(),
      })).min(2).max(6),
      durationSeconds: z.number().min(30).max(300).default(60),
    }))
    .mutation(async ({ ctx, input }) => {
      const room = getRoom(input.roomId);
      const playerId = ctx.user.id.toString();

      if (playerId !== room.hostId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Only the host can start a vote" });
      }

      const voteId = generateVoteId();
      const votingSession: VotingSession = {
        id: voteId,
        roomId: input.roomId,
        question: input.question,
        options: input.options,
        votes: [],
        status: "open",
        createdAt: Date.now(),
        closesAt: Date.now() + (input.durationSeconds * 1000),
      };

      votingSessions.set(voteId, votingSession);

      room.chat.push({
        id: generateMessageId(),
        playerId: "system",
        playerName: "System",
        message: `Vote started: ${input.question}`,
        type: "system",
        timestamp: Date.now(),
      });

      return {
        success: true,
        vote: votingSession,
      };
    }),

  castVote: protectedProcedure
    .input(z.object({
      voteId: z.string(),
      optionId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const votingSession = votingSessions.get(input.voteId);
      if (!votingSession) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Vote not found" });
      }

      if (votingSession.status !== "open") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Voting is closed" });
      }

      if (Date.now() > votingSession.closesAt) {
        votingSession.status = "closed";
        throw new TRPCError({ code: "BAD_REQUEST", message: "Voting time expired" });
      }

      const playerId = ctx.user.id.toString();
      const room = getRoom(votingSession.roomId);

      if (!room.players.has(playerId)) {
        throw new TRPCError({ code: "FORBIDDEN", message: "You are not in this room" });
      }

      // Check if already voted
      const existingVote = votingSession.votes.find(v => v.playerId === playerId);
      if (existingVote) {
        // Update vote
        existingVote.optionId = input.optionId;
        existingVote.timestamp = Date.now();
      } else {
        votingSession.votes.push({
          playerId,
          optionId: input.optionId,
          timestamp: Date.now(),
        });
      }

      // Check if all players have voted
      if (votingSession.votes.length === room.players.size) {
        votingSession.status = "closed";
        votingSession.result = calculateVoteResult(votingSession);
        
        room.chat.push({
          id: generateMessageId(),
          playerId: "system",
          playerName: "System",
          message: `Vote completed! Result: ${votingSession.options.find(o => o.id === votingSession.result)?.label}`,
          type: "system",
          timestamp: Date.now(),
        });
      }

      return {
        success: true,
        vote: votingSession,
        allVoted: votingSession.status === "closed",
      };
    }),

  getVote: protectedProcedure
    .input(z.object({
      voteId: z.string(),
    }))
    .query(async ({ input }) => {
      const votingSession = votingSessions.get(input.voteId);
      if (!votingSession) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Vote not found" });
      }
      return votingSession;
    }),

  // Game State Updates
  updateGameState: protectedProcedure
    .input(z.object({
      roomId: z.string(),
      action: z.string(),
      payload: z.any(),
    }))
    .mutation(async ({ ctx, input }) => {
      const room = getRoom(input.roomId);
      const playerId = ctx.user.id.toString();

      if (!room.players.has(playerId)) {
        throw new TRPCError({ code: "FORBIDDEN", message: "You are not in this room" });
      }

      const player = room.players.get(playerId)!;
      player.lastActivity = Date.now();

      // Process action based on type
      switch (input.action) {
        case "select-priority":
          if (room.gameState?.quarterlyPriorities) {
            const priority = room.gameState.quarterlyPriorities.find(
              (p: any) => p.id === input.payload.priorityId
            );
            if (priority) {
              if (!priority.votes) priority.votes = [];
              if (!priority.votes.includes(playerId)) {
                priority.votes.push(playerId);
              }
            }
          }
          break;

        case "bid-contract":
          if (room.gameState?.contracts) {
            const contract = room.gameState.contracts.find(
              (c: any) => c.id === input.payload.contractId
            );
            if (contract) {
              contract.bids = contract.bids || [];
              contract.bids.push({
                playerId,
                playerName: player.name,
                amount: input.payload.amount,
                timestamp: Date.now(),
              });
            }
          }
          break;

        case "advance-turn":
          if (playerId === room.hostId) {
            room.currentTurn++;
            room.gameState.quarterlyPriorities = generateQuarterlyPriorities();
            room.gameState.contracts = generateServiceContracts();
          }
          break;

        default:
          // Generic state update
          if (room.gameState) {
            room.gameState = { ...room.gameState, ...input.payload };
          }
      }

      room.updatedAt = Date.now();

      // Add action message
      room.chat.push({
        id: generateMessageId(),
        playerId,
        playerName: player.name,
        message: `performed action: ${input.action}`,
        type: "action",
        timestamp: Date.now(),
      });

      return {
        success: true,
        room: serializeRoom(room),
      };
    }),

  getGameState: protectedProcedure
    .input(z.object({
      roomId: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      const room = getRoom(input.roomId);
      const playerId = ctx.user.id.toString();

      if (!room.players.has(playerId)) {
        throw new TRPCError({ code: "FORBIDDEN", message: "You are not in this room" });
      }

      return {
        gameState: room.gameState,
        currentTurn: room.currentTurn,
        currentPhase: room.currentPhase,
        status: room.status,
      };
    }),

  // Player Status
  updateStatus: protectedProcedure
    .input(z.object({
      roomId: z.string(),
      status: z.enum(["active", "away"]),
    }))
    .mutation(async ({ ctx, input }) => {
      const room = getRoom(input.roomId);
      const playerId = ctx.user.id.toString();

      if (!room.players.has(playerId)) {
        throw new TRPCError({ code: "FORBIDDEN", message: "You are not in this room" });
      }

      const player = room.players.get(playerId)!;
      player.status = input.status;
      player.lastActivity = Date.now();
      room.updatedAt = Date.now();

      return {
        success: true,
        player,
      };
    }),

  // Heartbeat for connection tracking
  heartbeat: protectedProcedure
    .input(z.object({
      roomId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const room = getRoom(input.roomId);
      const playerId = ctx.user.id.toString();

      if (room.players.has(playerId)) {
        const player = room.players.get(playerId)!;
        player.lastActivity = Date.now();
        player.status = "active";
      }

      return {
        success: true,
        serverTime: Date.now(),
        roomStatus: room.status,
        playerCount: room.players.size,
      };
    }),
});

// Helper functions for game logic
function generateQuarterlyPriorities() {
  const allPriorities = [
    { id: "academy", label: "Expand Academy", cost: 80000, impact: { education: 10 }, description: "Add classrooms and instructors" },
    { id: "wellness", label: "Wellness Services", cost: 60000, impact: { health: 15 }, description: "Build community health center" },
    { id: "incubator", label: "Business Incubator", cost: 70000, impact: { jobs: 5 }, description: "Support new member businesses" },
    { id: "housing", label: "Housing Development", cost: 90000, impact: { population: 25 }, description: "Build affordable housing units" },
    { id: "media", label: "Real-Eye-Nation Studio", cost: 50000, impact: { influence: 20 }, description: "Expand media production" },
    { id: "agriculture", label: "Community Farm", cost: 45000, impact: { food: 30 }, description: "Establish sustainable food source" },
    { id: "training", label: "Trade Training Center", cost: 75000, impact: { skills: 15 }, description: "Vocational training facility" },
    { id: "childcare", label: "Childcare Center", cost: 55000, impact: { families: 20 }, description: "Support working families" },
  ];

  // Randomly select 4-5 priorities for this quarter
  const shuffled = allPriorities.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 4 + Math.floor(Math.random() * 2)).map(p => ({
    ...p,
    votes: [],
    selected: false,
  }));
}

function generateServiceContracts() {
  const allContracts = [
    { id: "web-dev", title: "Website Development", budget: 15000, skills: ["technology"], duration: "3 months" },
    { id: "curriculum", title: "Curriculum Development", budget: 20000, skills: ["education"], duration: "6 months" },
    { id: "marketing", title: "Marketing Campaign", budget: 10000, skills: ["media"], duration: "2 months" },
    { id: "legal-review", title: "Legal Document Review", budget: 8000, skills: ["legal"], duration: "1 month" },
    { id: "accounting", title: "Financial Audit", budget: 12000, skills: ["finance"], duration: "2 months" },
    { id: "construction", title: "Building Renovation", budget: 50000, skills: ["construction"], duration: "4 months" },
    { id: "event-planning", title: "Community Event", budget: 5000, skills: ["coordination"], duration: "1 month" },
    { id: "security", title: "Security Assessment", budget: 7000, skills: ["security"], duration: "1 month" },
  ];

  // Randomly select 3-4 contracts
  const shuffled = allContracts.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 3 + Math.floor(Math.random() * 2)).map(c => ({
    ...c,
    bids: [],
    awarded: false,
  }));
}

function calculateVoteResult(votingSession: VotingSession): string {
  const voteCounts: Record<string, number> = {};
  
  votingSession.options.forEach(opt => {
    voteCounts[opt.id] = 0;
  });

  votingSession.votes.forEach(vote => {
    voteCounts[vote.optionId] = (voteCounts[vote.optionId] || 0) + 1;
  });

  let maxVotes = 0;
  let winner = votingSession.options[0].id;

  Object.entries(voteCounts).forEach(([optionId, count]) => {
    if (count > maxVotes) {
      maxVotes = count;
      winner = optionId;
    }
  });

  return winner;
}
