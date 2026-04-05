/**
 * Community Builder Multiplayer Features Service
 * Handles player lobby, matchmaking, real-time collaboration, and voting
 */

// Types
export type PlayerStatus = 'idle' | 'searching' | 'in_lobby' | 'in_game' | 'disconnected';
export type LobbyStatus = 'waiting' | 'ready' | 'starting' | 'in_progress' | 'completed';
export type VoteType = 'majority' | 'unanimous' | 'weighted';
export type DecisionCategory = 'resource_allocation' | 'building_placement' | 'policy_change' | 'member_admission' | 'emergency';

export interface Player {
  id: string;
  name: string;
  status: PlayerStatus;
  role?: CommunityRole;
  resources: PlayerResources;
  achievements: string[];
  questProgress?: number; // 0-100 completion percentage
  joinedAt: string;
  lastActive: string;
}

export interface PlayerResources {
  tokens: number;
  laborHours: number;
  skillPoints: Record<string, number>;
  landUnits: number;
}

export type CommunityRole = 'builder' | 'manager' | 'educator' | 'healer' | 'founder';

export interface Lobby {
  id: string;
  name: string;
  host: string;
  players: Player[];
  maxPlayers: number;
  minPlayers: number;
  status: LobbyStatus;
  settings: LobbySettings;
  chat: ChatMessage[];
  createdAt: string;
  startedAt?: string;
}

export interface LobbySettings {
  gameMode: 'cooperative' | 'competitive' | 'sandbox';
  difficulty: 'easy' | 'normal' | 'hard' | 'expert';
  turnTimeLimit: number; // seconds, 0 = unlimited
  resourceMultiplier: number;
  allowSpectators: boolean;
  requireQuestCompletion: boolean;
  minQuestProgress: number;
}

export interface ChatMessage {
  id: string;
  playerId: string;
  playerName: string;
  message: string;
  timestamp: string;
  type: 'chat' | 'system' | 'vote' | 'action';
}

export interface MatchmakingRequest {
  playerId: string;
  preferences: MatchmakingPreferences;
  requestedAt: string;
  expiresAt: string;
}

export interface MatchmakingPreferences {
  gameMode: 'cooperative' | 'competitive' | 'sandbox' | 'any';
  difficulty: 'easy' | 'normal' | 'hard' | 'expert' | 'any';
  playerCount: { min: number; max: number };
  preferredRole?: CommunityRole;
  skillLevel?: 'beginner' | 'intermediate' | 'advanced' | 'any';
}

export interface Vote {
  id: string;
  lobbyId: string;
  proposerId: string;
  category: DecisionCategory;
  title: string;
  description: string;
  options: VoteOption[];
  voteType: VoteType;
  votes: PlayerVote[];
  status: 'open' | 'closed' | 'passed' | 'failed';
  deadline: string;
  createdAt: string;
  closedAt?: string;
  result?: string;
}

export interface VoteOption {
  id: string;
  label: string;
  description?: string;
  resourceCost?: Partial<PlayerResources>;
}

export interface PlayerVote {
  playerId: string;
  optionId: string;
  weight: number;
  votedAt: string;
}

export interface ResourceShare {
  id: string;
  fromPlayerId: string;
  toPlayerId: string;
  resources: Partial<PlayerResources>;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  message?: string;
  createdAt: string;
  respondedAt?: string;
}

// Generate IDs
export function generateLobbyId(): string {
  return `LOBBY-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
}

export function generateVoteId(): string {
  return `VOTE-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
}

// Lobby Management
export function createLobby(host: Player, name: string, settings?: Partial<LobbySettings>): Lobby {
  const defaultSettings: LobbySettings = {
    gameMode: 'cooperative',
    difficulty: 'normal',
    turnTimeLimit: 120,
    resourceMultiplier: 1.0,
    allowSpectators: true,
    requireQuestCompletion: false,
    minQuestProgress: 0
  };

  return {
    id: generateLobbyId(),
    name,
    host: host.id,
    players: [{ ...host, status: 'in_lobby' }],
    maxPlayers: 8,
    minPlayers: 2,
    status: 'waiting',
    settings: { ...defaultSettings, ...settings },
    chat: [{
      id: `MSG-${Date.now()}`,
      playerId: 'system',
      playerName: 'System',
      message: `Lobby "${name}" created by ${host.name}`,
      timestamp: new Date().toISOString(),
      type: 'system'
    }],
    createdAt: new Date().toISOString()
  };
}

export function joinLobby(lobby: Lobby, player: Player): { success: boolean; lobby?: Lobby; error?: string } {
  if (lobby.status !== 'waiting') {
    return { success: false, error: 'Lobby is not accepting new players' };
  }
  
  if (lobby.players.length >= lobby.maxPlayers) {
    return { success: false, error: 'Lobby is full' };
  }
  
  if (lobby.players.some(p => p.id === player.id)) {
    return { success: false, error: 'Player already in lobby' };
  }
  
  if (lobby.settings.requireQuestCompletion && (player.questProgress || 0) < lobby.settings.minQuestProgress) {
    return { success: false, error: `Quest progress must be at least ${lobby.settings.minQuestProgress}%` };
  }

  const updatedLobby: Lobby = {
    ...lobby,
    players: [...lobby.players, { ...player, status: 'in_lobby' }],
    chat: [...lobby.chat, {
      id: `MSG-${Date.now()}`,
      playerId: 'system',
      playerName: 'System',
      message: `${player.name} joined the lobby`,
      timestamp: new Date().toISOString(),
      type: 'system'
    }]
  };

  return { success: true, lobby: updatedLobby };
}

export function leaveLobby(lobby: Lobby, playerId: string): { success: boolean; lobby?: Lobby; disbanded?: boolean } {
  const playerIndex = lobby.players.findIndex(p => p.id === playerId);
  if (playerIndex === -1) {
    return { success: false };
  }

  const player = lobby.players[playerIndex];
  const updatedPlayers = lobby.players.filter(p => p.id !== playerId);

  // If host leaves and there are other players, transfer host
  let newHost = lobby.host;
  if (playerId === lobby.host && updatedPlayers.length > 0) {
    newHost = updatedPlayers[0].id;
  }

  // If no players left, disband
  if (updatedPlayers.length === 0) {
    return { success: true, disbanded: true };
  }

  const updatedLobby: Lobby = {
    ...lobby,
    host: newHost,
    players: updatedPlayers,
    chat: [...lobby.chat, {
      id: `MSG-${Date.now()}`,
      playerId: 'system',
      playerName: 'System',
      message: `${player.name} left the lobby${newHost !== lobby.host ? `. ${updatedPlayers[0].name} is now the host` : ''}`,
      timestamp: new Date().toISOString(),
      type: 'system'
    }]
  };

  return { success: true, lobby: updatedLobby };
}

export function checkLobbyReady(lobby: Lobby): { ready: boolean; reasons: string[] } {
  const reasons: string[] = [];
  
  if (lobby.players.length < lobby.minPlayers) {
    reasons.push(`Need at least ${lobby.minPlayers} players (currently ${lobby.players.length})`);
  }
  
  // Check if all players have selected roles in cooperative mode
  if (lobby.settings.gameMode === 'cooperative') {
    const playersWithoutRoles = lobby.players.filter(p => !p.role);
    if (playersWithoutRoles.length > 0) {
      reasons.push(`${playersWithoutRoles.length} player(s) need to select a role`);
    }
  }

  return {
    ready: reasons.length === 0,
    reasons
  };
}

export function startGame(lobby: Lobby): { success: boolean; lobby?: Lobby; error?: string } {
  const readyCheck = checkLobbyReady(lobby);
  if (!readyCheck.ready) {
    return { success: false, error: readyCheck.reasons.join('; ') };
  }

  return {
    success: true,
    lobby: {
      ...lobby,
      status: 'in_progress',
      startedAt: new Date().toISOString(),
      chat: [...lobby.chat, {
        id: `MSG-${Date.now()}`,
        playerId: 'system',
        playerName: 'System',
        message: 'Game started! Good luck building your community!',
        timestamp: new Date().toISOString(),
        type: 'system'
      }]
    }
  };
}

// Matchmaking
export function createMatchmakingRequest(player: Player, preferences: MatchmakingPreferences): MatchmakingRequest {
  return {
    playerId: player.id,
    preferences,
    requestedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString() // 5 minute timeout
  };
}

export function findMatchingLobbies(lobbies: Lobby[], request: MatchmakingRequest): Lobby[] {
  return lobbies.filter(lobby => {
    // Must be waiting for players
    if (lobby.status !== 'waiting') return false;
    
    // Must have room
    if (lobby.players.length >= lobby.maxPlayers) return false;
    
    // Check game mode preference
    if (request.preferences.gameMode !== 'any' && lobby.settings.gameMode !== request.preferences.gameMode) {
      return false;
    }
    
    // Check difficulty preference
    if (request.preferences.difficulty !== 'any' && lobby.settings.difficulty !== request.preferences.difficulty) {
      return false;
    }
    
    // Check player count preference
    const currentPlayers = lobby.players.length;
    const potentialPlayers = currentPlayers + 1;
    if (potentialPlayers < request.preferences.playerCount.min || 
        potentialPlayers > request.preferences.playerCount.max) {
      return false;
    }
    
    return true;
  });
}

export function matchPlayers(requests: MatchmakingRequest[]): { matched: MatchmakingRequest[][]; unmatched: MatchmakingRequest[] } {
  const matched: MatchmakingRequest[][] = [];
  const unmatched: MatchmakingRequest[] = [];
  const used = new Set<string>();

  // Group by game mode preference
  const byMode: Record<string, MatchmakingRequest[]> = {};
  requests.forEach(req => {
    const mode = req.preferences.gameMode;
    if (!byMode[mode]) byMode[mode] = [];
    byMode[mode].push(req);
  });

  // Try to match players with same preferences
  Object.values(byMode).forEach(modeRequests => {
    while (modeRequests.length >= 2) {
      const group: MatchmakingRequest[] = [];
      const first = modeRequests.shift()!;
      group.push(first);
      used.add(first.playerId);

      // Find compatible players
      for (let i = modeRequests.length - 1; i >= 0 && group.length < 4; i--) {
        const candidate = modeRequests[i];
        if (isCompatible(first, candidate)) {
          group.push(candidate);
          used.add(candidate.playerId);
          modeRequests.splice(i, 1);
        }
      }

      if (group.length >= 2) {
        matched.push(group);
      } else {
        unmatched.push(first);
      }
    }
    
    // Remaining unmatched
    modeRequests.forEach(req => {
      if (!used.has(req.playerId)) {
        unmatched.push(req);
      }
    });
  });

  return { matched, unmatched };
}

function isCompatible(a: MatchmakingRequest, b: MatchmakingRequest): boolean {
  // Check difficulty compatibility
  if (a.preferences.difficulty !== 'any' && b.preferences.difficulty !== 'any' &&
      a.preferences.difficulty !== b.preferences.difficulty) {
    return false;
  }
  
  // Check player count overlap
  const minOverlap = Math.max(a.preferences.playerCount.min, b.preferences.playerCount.min);
  const maxOverlap = Math.min(a.preferences.playerCount.max, b.preferences.playerCount.max);
  if (minOverlap > maxOverlap) {
    return false;
  }
  
  return true;
}

// Voting System
export function createVote(
  lobbyId: string,
  proposerId: string,
  category: DecisionCategory,
  title: string,
  description: string,
  options: Omit<VoteOption, 'id'>[],
  voteType: VoteType = 'majority',
  durationMinutes: number = 5
): Vote {
  return {
    id: generateVoteId(),
    lobbyId,
    proposerId,
    category,
    title,
    description,
    options: options.map((opt, i) => ({ ...opt, id: `OPT-${i + 1}` })),
    voteType,
    votes: [],
    status: 'open',
    deadline: new Date(Date.now() + durationMinutes * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString()
  };
}

export function castVote(vote: Vote, playerId: string, optionId: string, weight: number = 1): { success: boolean; vote?: Vote; error?: string } {
  if (vote.status !== 'open') {
    return { success: false, error: 'Vote is closed' };
  }
  
  if (new Date(vote.deadline) < new Date()) {
    return { success: false, error: 'Vote deadline has passed' };
  }
  
  if (!vote.options.some(o => o.id === optionId)) {
    return { success: false, error: 'Invalid option' };
  }
  
  // Check if player already voted
  if (vote.votes.some(v => v.playerId === playerId)) {
    return { success: false, error: 'Player has already voted' };
  }

  const updatedVote: Vote = {
    ...vote,
    votes: [...vote.votes, {
      playerId,
      optionId,
      weight,
      votedAt: new Date().toISOString()
    }]
  };

  return { success: true, vote: updatedVote };
}

export function closeVote(vote: Vote, totalPlayers: number): Vote {
  if (vote.status !== 'open') return vote;

  // Tally votes
  const tally: Record<string, number> = {};
  vote.options.forEach(opt => tally[opt.id] = 0);
  vote.votes.forEach(v => {
    tally[v.optionId] = (tally[v.optionId] || 0) + v.weight;
  });

  // Determine result based on vote type
  let passed = false;
  let winningOption: string | undefined;
  const totalVotes = vote.votes.reduce((sum, v) => sum + v.weight, 0);

  if (vote.voteType === 'unanimous') {
    // All votes must be for the same option
    const uniqueOptions = new Set(vote.votes.map(v => v.optionId));
    passed = uniqueOptions.size === 1 && vote.votes.length === totalPlayers;
    if (passed) winningOption = vote.votes[0].optionId;
  } else if (vote.voteType === 'majority') {
    // Simple majority
    const maxVotes = Math.max(...Object.values(tally));
    const winners = Object.entries(tally).filter(([_, count]) => count === maxVotes);
    passed = winners.length === 1 && maxVotes > totalVotes / 2;
    if (passed) winningOption = winners[0][0];
  } else {
    // Weighted - highest total wins
    const maxVotes = Math.max(...Object.values(tally));
    const winners = Object.entries(tally).filter(([_, count]) => count === maxVotes);
    passed = winners.length === 1;
    if (passed) winningOption = winners[0][0];
  }

  return {
    ...vote,
    status: passed ? 'passed' : 'failed',
    closedAt: new Date().toISOString(),
    result: winningOption ? vote.options.find(o => o.id === winningOption)?.label : undefined
  };
}

// Resource Sharing
export function createResourceShare(
  fromPlayerId: string,
  toPlayerId: string,
  resources: Partial<PlayerResources>,
  message?: string
): ResourceShare {
  return {
    id: `SHARE-${Date.now().toString(36).toUpperCase()}`,
    fromPlayerId,
    toPlayerId,
    resources,
    status: 'pending',
    message,
    createdAt: new Date().toISOString()
  };
}

export function respondToResourceShare(
  share: ResourceShare,
  accept: boolean
): ResourceShare {
  return {
    ...share,
    status: accept ? 'accepted' : 'rejected',
    respondedAt: new Date().toISOString()
  };
}

export function executeResourceTransfer(
  share: ResourceShare,
  fromPlayer: Player,
  toPlayer: Player
): { success: boolean; fromPlayer?: Player; toPlayer?: Player; error?: string } {
  if (share.status !== 'accepted') {
    return { success: false, error: 'Share must be accepted first' };
  }

  // Validate sender has enough resources
  const resources = share.resources;
  if (resources.tokens && fromPlayer.resources.tokens < resources.tokens) {
    return { success: false, error: 'Insufficient tokens' };
  }
  if (resources.laborHours && fromPlayer.resources.laborHours < resources.laborHours) {
    return { success: false, error: 'Insufficient labor hours' };
  }
  if (resources.landUnits && fromPlayer.resources.landUnits < resources.landUnits) {
    return { success: false, error: 'Insufficient land units' };
  }

  // Execute transfer
  const updatedFrom: Player = {
    ...fromPlayer,
    resources: {
      ...fromPlayer.resources,
      tokens: fromPlayer.resources.tokens - (resources.tokens || 0),
      laborHours: fromPlayer.resources.laborHours - (resources.laborHours || 0),
      landUnits: fromPlayer.resources.landUnits - (resources.landUnits || 0)
    }
  };

  const updatedTo: Player = {
    ...toPlayer,
    resources: {
      ...toPlayer.resources,
      tokens: toPlayer.resources.tokens + (resources.tokens || 0),
      laborHours: toPlayer.resources.laborHours + (resources.laborHours || 0),
      landUnits: toPlayer.resources.landUnits + (resources.landUnits || 0)
    }
  };

  return { success: true, fromPlayer: updatedFrom, toPlayer: updatedTo };
}

// Chat
export function addChatMessage(lobby: Lobby, playerId: string, playerName: string, message: string): Lobby {
  return {
    ...lobby,
    chat: [...lobby.chat, {
      id: `MSG-${Date.now()}`,
      playerId,
      playerName,
      message,
      timestamp: new Date().toISOString(),
      type: 'chat'
    }]
  };
}

// Role Assignment
export function assignRole(lobby: Lobby, playerId: string, role: CommunityRole): { success: boolean; lobby?: Lobby; error?: string } {
  const playerIndex = lobby.players.findIndex(p => p.id === playerId);
  if (playerIndex === -1) {
    return { success: false, error: 'Player not in lobby' };
  }

  // Check if role is already taken (in cooperative mode, roles should be unique)
  if (lobby.settings.gameMode === 'cooperative') {
    const existingPlayer = lobby.players.find(p => p.role === role && p.id !== playerId);
    if (existingPlayer) {
      return { success: false, error: `Role ${role} is already taken by ${existingPlayer.name}` };
    }
  }

  const updatedPlayers = [...lobby.players];
  updatedPlayers[playerIndex] = { ...updatedPlayers[playerIndex], role };

  return {
    success: true,
    lobby: {
      ...lobby,
      players: updatedPlayers,
      chat: [...lobby.chat, {
        id: `MSG-${Date.now()}`,
        playerId: 'system',
        playerName: 'System',
        message: `${lobby.players[playerIndex].name} selected the ${role} role`,
        timestamp: new Date().toISOString(),
        type: 'system'
      }]
    }
  };
}

// Lobby Statistics
export function getLobbyStats(lobby: Lobby): {
  playerCount: number;
  totalResources: PlayerResources;
  roleDistribution: Record<CommunityRole, number>;
  averageQuestProgress: number;
  chatMessageCount: number;
} {
  const totalResources: PlayerResources = {
    tokens: 0,
    laborHours: 0,
    skillPoints: {},
    landUnits: 0
  };

  const roleDistribution: Record<CommunityRole, number> = {
    builder: 0,
    manager: 0,
    educator: 0,
    healer: 0,
    founder: 0
  };

  let totalQuestProgress = 0;

  lobby.players.forEach(player => {
    totalResources.tokens += player.resources.tokens;
    totalResources.laborHours += player.resources.laborHours;
    totalResources.landUnits += player.resources.landUnits;
    
    if (player.role) {
      roleDistribution[player.role]++;
    }
    
    totalQuestProgress += player.questProgress || 0;
  });

  return {
    playerCount: lobby.players.length,
    totalResources,
    roleDistribution,
    averageQuestProgress: lobby.players.length > 0 ? totalQuestProgress / lobby.players.length : 0,
    chatMessageCount: lobby.chat.length
  };
}
