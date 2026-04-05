/**
 * Game Center Strategic Thinking Service
 * Covers: Multiplayer, AI opponents, tournaments, leaderboards, game modes
 */

// ============================================================================
// MULTIPLAYER SYSTEM
// ============================================================================

export interface MultiplayerSession {
  id: string;
  gameType: string;
  hostId: string;
  players: MultiplayerPlayer[];
  status: 'waiting' | 'starting' | 'in_progress' | 'paused' | 'finished';
  maxPlayers: number;
  isPrivate: boolean;
  inviteCode?: string;
  settings: GameSettings;
  createdAt: number;
  startedAt?: number;
  endedAt?: number;
  chatMessages: ChatMessage[];
}

export interface MultiplayerPlayer {
  id: string;
  userId: string;
  name: string;
  isHost: boolean;
  isReady: boolean;
  isConnected: boolean;
  score: number;
  rank?: number;
  joinedAt: number;
}

export interface GameSettings {
  timeLimit?: number;
  turnTimeLimit?: number;
  difficulty?: 'easy' | 'medium' | 'hard' | 'expert';
  allowSpectators: boolean;
  enableChat: boolean;
  autoMatchmaking: boolean;
}

export interface ChatMessage {
  id: string;
  userId: string;
  playerName: string;
  message: string;
  timestamp: number;
  type: 'chat' | 'system' | 'emote';
}

const multiplayerSessions: MultiplayerSession[] = [];

export function createMultiplayerSession(
  gameType: string,
  hostId: string,
  hostName: string,
  maxPlayers: number,
  isPrivate: boolean = false
): MultiplayerSession {
  const session: MultiplayerSession = {
    id: `MPS-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 4)}`,
    gameType,
    hostId,
    players: [{
      id: `PLR-${Date.now().toString(36)}`,
      userId: hostId,
      name: hostName,
      isHost: true,
      isReady: false,
      isConnected: true,
      score: 0,
      joinedAt: Date.now()
    }],
    status: 'waiting',
    maxPlayers,
    isPrivate,
    inviteCode: isPrivate ? generateInviteCode() : undefined,
    settings: {
      allowSpectators: true,
      enableChat: true,
      autoMatchmaking: false
    },
    createdAt: Date.now(),
    chatMessages: []
  };
  multiplayerSessions.push(session);
  return session;
}

function generateInviteCode(): string {
  return Math.random().toString(36).substr(2, 6).toUpperCase();
}

export function joinMultiplayerSession(
  sessionId: string,
  userId: string,
  userName: string,
  inviteCode?: string
): MultiplayerPlayer | null {
  const session = multiplayerSessions.find(s => s.id === sessionId);
  if (!session) return null;
  if (session.status !== 'waiting') return null;
  if (session.players.length >= session.maxPlayers) return null;
  if (session.isPrivate && session.inviteCode !== inviteCode) return null;
  if (session.players.find(p => p.userId === userId)) return null;

  const player: MultiplayerPlayer = {
    id: `PLR-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 4)}`,
    userId: userId,
    name: userName,
    isHost: false,
    isReady: false,
    isConnected: true,
    score: 0,
    joinedAt: Date.now()
  };
  session.players.push(player);
  return player;
}

export function setPlayerReady(sessionId: string, userId: string, ready: boolean): boolean {
  const session = multiplayerSessions.find(s => s.id === sessionId);
  if (!session) return false;
  const player = session.players.find(p => p.userId === userId);
  if (!player) return false;
  player.isReady = ready;
  return true;
}

export function startMultiplayerGame(sessionId: string, hostId: string): boolean {
  const session = multiplayerSessions.find(s => s.id === sessionId);
  if (!session) return false;
  if (session.hostId !== hostId) return false;
  if (session.players.length < 2) return false;
  if (!session.players.every(p => p.isReady || p.isHost)) return false;

  session.status = 'in_progress';
  session.startedAt = Date.now();
  return true;
}

export function sendChatMessage(
  sessionId: string,
  userId: string,
  message: string
): ChatMessage | null {
  const session = multiplayerSessions.find(s => s.id === sessionId);
  if (!session || !session.settings.enableChat) return null;
  const player = session.players.find(p => p.userId === userId);
  if (!player) return null;

  const chatMsg: ChatMessage = {
    id: `MSG-${Date.now().toString(36)}`,
    userId,
    playerName: player.name,
    message,
    timestamp: Date.now(),
    type: 'chat'
  };
  session.chatMessages.push(chatMsg);
  return chatMsg;
}

// ============================================================================
// AI OPPONENT SYSTEM
// ============================================================================

export interface AIOpponent {
  id: string;
  name: string;
  personality: 'aggressive' | 'defensive' | 'balanced' | 'random' | 'adaptive';
  difficulty: 'easy' | 'medium' | 'hard' | 'expert' | 'grandmaster';
  gameTypes: string[];
  winRate: number;
  gamesPlayed: number;
  avatar?: string;
  catchphrases: string[];
}

export interface AIMove {
  action: string;
  confidence: number;
  reasoning?: string;
  alternatives: string[];
}

const aiOpponents: AIOpponent[] = [
  {
    id: 'AI-ROOKIE',
    name: 'Rookie Bot',
    personality: 'random',
    difficulty: 'easy',
    gameTypes: ['checkers', 'tic-tac-toe', 'fleet-command', 'hearts'],
    winRate: 0.25,
    gamesPlayed: 0,
    catchphrases: ['Good game!', 'I\'m still learning!', 'Nice move!']
  },
  {
    id: 'AI-CHALLENGER',
    name: 'Challenger',
    personality: 'balanced',
    difficulty: 'medium',
    gameTypes: ['checkers', 'chess', 'fleet-command', 'hearts', 'escape-room'],
    winRate: 0.50,
    gamesPlayed: 0,
    catchphrases: ['Interesting choice...', 'Let me think...', 'Well played!']
  },
  {
    id: 'AI-STRATEGIST',
    name: 'The Strategist',
    personality: 'defensive',
    difficulty: 'hard',
    gameTypes: ['checkers', 'chess', 'fleet-command', 'hearts'],
    winRate: 0.70,
    gamesPlayed: 0,
    catchphrases: ['I see your plan.', 'Patience is key.', 'Defense wins games.']
  },
  {
    id: 'AI-AGGRESSOR',
    name: 'The Aggressor',
    personality: 'aggressive',
    difficulty: 'hard',
    gameTypes: ['checkers', 'chess', 'fleet-command'],
    winRate: 0.65,
    gamesPlayed: 0,
    catchphrases: ['Attack!', 'No mercy!', 'Fortune favors the bold!']
  },
  {
    id: 'AI-GRANDMASTER',
    name: 'Grandmaster',
    personality: 'adaptive',
    difficulty: 'grandmaster',
    gameTypes: ['checkers', 'chess', 'fleet-command', 'hearts', 'escape-room', 'knowledge-quest'],
    winRate: 0.90,
    gamesPlayed: 0,
    catchphrases: ['Fascinating...', 'I\'ve seen this before.', 'Your move is predictable.']
  }
];

export function getAIOpponents(gameType?: string, difficulty?: string): AIOpponent[] {
  let filtered = [...aiOpponents];
  if (gameType) {
    filtered = filtered.filter(ai => ai.gameTypes.includes(gameType));
  }
  if (difficulty) {
    filtered = filtered.filter(ai => ai.difficulty === difficulty);
  }
  return filtered;
}

export function getAIMove(
  aiId: string,
  gameState: object,
  validMoves: string[]
): AIMove {
  const ai = aiOpponents.find(a => a.id === aiId);
  if (!ai || validMoves.length === 0) {
    return { action: validMoves[0] || 'pass', confidence: 0, alternatives: [] };
  }

  let selectedMove: string;
  let confidence: number;

  switch (ai.personality) {
    case 'random':
      selectedMove = validMoves[Math.floor(Math.random() * validMoves.length)];
      confidence = 0.3;
      break;
    case 'aggressive':
      // Prefer attacking moves (first half of sorted moves typically)
      selectedMove = validMoves[Math.floor(Math.random() * Math.ceil(validMoves.length / 2))];
      confidence = 0.7;
      break;
    case 'defensive':
      // Prefer defensive moves (second half of sorted moves typically)
      selectedMove = validMoves[Math.floor(validMoves.length / 2 + Math.random() * Math.ceil(validMoves.length / 2))];
      confidence = 0.7;
      break;
    case 'adaptive':
      // Best move based on difficulty
      const bestIndex = ai.difficulty === 'grandmaster' ? 0 : Math.floor(Math.random() * 3);
      selectedMove = validMoves[Math.min(bestIndex, validMoves.length - 1)];
      confidence = 0.9;
      break;
    default:
      selectedMove = validMoves[Math.floor(validMoves.length / 2)];
      confidence = 0.5;
  }

  return {
    action: selectedMove,
    confidence,
    reasoning: `${ai.name} chose based on ${ai.personality} strategy`,
    alternatives: validMoves.filter(m => m !== selectedMove).slice(0, 3)
  };
}

export function recordAIGameResult(aiId: string, won: boolean): void {
  const ai = aiOpponents.find(a => a.id === aiId);
  if (!ai) return;
  ai.gamesPlayed++;
  // Adjust win rate slightly based on result
  const adjustment = won ? 0.01 : -0.01;
  ai.winRate = Math.max(0.1, Math.min(0.95, ai.winRate + adjustment));
}

// ============================================================================
// TOURNAMENT SYSTEM
// ============================================================================

export interface Tournament {
  id: string;
  name: string;
  gameType: string;
  format: 'single_elimination' | 'double_elimination' | 'round_robin' | 'swiss';
  status: 'registration' | 'in_progress' | 'completed' | 'cancelled';
  participants: TournamentParticipant[];
  brackets: TournamentBracket[];
  rounds: TournamentRound[];
  maxParticipants: number;
  entryFee: number;
  prizePool: number;
  startDate: number;
  endDate?: number;
  rules: string[];
  createdBy: string;
}

export interface TournamentParticipant {
  id: string;
  userId: string;
  name: string;
  seed?: number;
  wins: number;
  losses: number;
  points: number;
  eliminated: boolean;
  registeredAt: number;
}

export interface TournamentBracket {
  id: string;
  round: number;
  matchNumber: number;
  player1Id?: string;
  player2Id?: string;
  winnerId?: string;
  score1?: number;
  score2?: number;
  status: 'pending' | 'in_progress' | 'completed';
  scheduledAt?: number;
  completedAt?: number;
}

export interface TournamentRound {
  roundNumber: number;
  name: string;
  matches: TournamentBracket[];
  startedAt?: number;
  completedAt?: number;
}

const tournaments: Tournament[] = [];

export function createTournament(
  name: string,
  gameType: string,
  format: Tournament['format'],
  maxParticipants: number,
  entryFee: number,
  startDate: number,
  createdBy: string
): Tournament {
  const tournament: Tournament = {
    id: `TRN-${Date.now().toString(36)}`,
    name,
    gameType,
    format,
    status: 'registration',
    participants: [],
    brackets: [],
    rounds: [],
    maxParticipants,
    entryFee,
    prizePool: 0,
    startDate,
    rules: [],
    createdBy
  };
  tournaments.push(tournament);
  return tournament;
}

export function registerForTournament(
  tournamentId: string,
  userId: string,
  name: string
): TournamentParticipant | null {
  const tournament = tournaments.find(t => t.id === tournamentId);
  if (!tournament) return null;
  if (tournament.status !== 'registration') return null;
  if (tournament.participants.length >= tournament.maxParticipants) return null;
  if (tournament.participants.find(p => p.userId === userId)) return null;

  const participant: TournamentParticipant = {
    id: `TP-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 4)}`,
    userId,
    name,
    wins: 0,
    losses: 0,
    points: 0,
    eliminated: false,
    registeredAt: Date.now()
  };
  tournament.participants.push(participant);
  tournament.prizePool += tournament.entryFee;
  return participant;
}

export function startTournament(tournamentId: string): boolean {
  const tournament = tournaments.find(t => t.id === tournamentId);
  if (!tournament) return false;
  if (tournament.status !== 'registration') return false;
  if (tournament.participants.length < 2) return false;

  // Seed participants randomly
  const shuffled = [...tournament.participants].sort(() => Math.random() - 0.5);
  shuffled.forEach((p, i) => p.seed = i + 1);

  // Generate brackets based on format
  generateBrackets(tournament);
  tournament.status = 'in_progress';
  return true;
}

function generateBrackets(tournament: Tournament): void {
  const numParticipants = tournament.participants.length;
  const numRounds = Math.ceil(Math.log2(numParticipants));

  for (let round = 1; round <= numRounds; round++) {
    const matchesInRound = Math.pow(2, numRounds - round);
    const roundMatches: TournamentBracket[] = [];

    for (let match = 1; match <= matchesInRound; match++) {
      const bracket: TournamentBracket = {
        id: `BRK-${tournament.id}-R${round}-M${match}`,
        round,
        matchNumber: match,
        status: 'pending'
      };

      // Assign players for first round
      if (round === 1) {
        const p1Index = (match - 1) * 2;
        const p2Index = p1Index + 1;
        if (p1Index < numParticipants) bracket.player1Id = tournament.participants[p1Index].id;
        if (p2Index < numParticipants) bracket.player2Id = tournament.participants[p2Index].id;
        
        // Bye if only one player
        if (bracket.player1Id && !bracket.player2Id) {
          bracket.winnerId = bracket.player1Id;
          bracket.status = 'completed';
        }
      }

      roundMatches.push(bracket);
      tournament.brackets.push(bracket);
    }

    tournament.rounds.push({
      roundNumber: round,
      name: getRoundName(round, numRounds),
      matches: roundMatches
    });
  }
}

function getRoundName(round: number, totalRounds: number): string {
  const remaining = totalRounds - round;
  if (remaining === 0) return 'Finals';
  if (remaining === 1) return 'Semi-Finals';
  if (remaining === 2) return 'Quarter-Finals';
  return `Round ${round}`;
}

export function recordMatchResult(
  tournamentId: string,
  bracketId: string,
  winnerId: string,
  score1: number,
  score2: number
): boolean {
  const tournament = tournaments.find(t => t.id === tournamentId);
  if (!tournament) return false;
  
  const bracket = tournament.brackets.find(b => b.id === bracketId);
  if (!bracket || bracket.status === 'completed') return false;

  bracket.winnerId = winnerId;
  bracket.score1 = score1;
  bracket.score2 = score2;
  bracket.status = 'completed';
  bracket.completedAt = Date.now();

  // Update participant stats
  const winner = tournament.participants.find(p => p.id === winnerId);
  const loserId = bracket.player1Id === winnerId ? bracket.player2Id : bracket.player1Id;
  const loser = tournament.participants.find(p => p.id === loserId);

  if (winner) winner.wins++;
  if (loser) {
    loser.losses++;
    if (tournament.format === 'single_elimination') loser.eliminated = true;
  }

  // Advance winner to next round
  advanceWinner(tournament, bracket);

  // Check if tournament is complete
  const finalBracket = tournament.brackets.find(b => b.round === tournament.rounds.length);
  if (finalBracket?.status === 'completed') {
    tournament.status = 'completed';
    tournament.endDate = Date.now();
  }

  return true;
}

function advanceWinner(tournament: Tournament, completedBracket: TournamentBracket): void {
  const nextRound = completedBracket.round + 1;
  const nextMatchNumber = Math.ceil(completedBracket.matchNumber / 2);
  const nextBracket = tournament.brackets.find(
    b => b.round === nextRound && b.matchNumber === nextMatchNumber
  );

  if (nextBracket && completedBracket.winnerId) {
    if (completedBracket.matchNumber % 2 === 1) {
      nextBracket.player1Id = completedBracket.winnerId;
    } else {
      nextBracket.player2Id = completedBracket.winnerId;
    }
  }
}

// ============================================================================
// LEADERBOARD SYSTEM
// ============================================================================

export interface Leaderboard {
  id: string;
  name: string;
  gameType: string;
  period: 'daily' | 'weekly' | 'monthly' | 'all_time';
  entries: LeaderboardEntry[];
  lastUpdated: number;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  playerName: string;
  score: number;
  gamesPlayed: number;
  winRate: number;
  streak: number;
  achievements: string[];
}

const leaderboards: Leaderboard[] = [];

export function getOrCreateLeaderboard(
  gameType: string,
  period: Leaderboard['period']
): Leaderboard {
  let leaderboard = leaderboards.find(l => l.gameType === gameType && l.period === period);
  
  if (!leaderboard) {
    leaderboard = {
      id: `LB-${gameType}-${period}`,
      name: `${gameType} ${period.replace('_', ' ')} Leaderboard`,
      gameType,
      period,
      entries: [],
      lastUpdated: Date.now()
    };
    leaderboards.push(leaderboard);
  }
  
  return leaderboard;
}

export function updateLeaderboardEntry(
  gameType: string,
  period: Leaderboard['period'],
  userId: string,
  playerName: string,
  scoreChange: number,
  won: boolean
): LeaderboardEntry {
  const leaderboard = getOrCreateLeaderboard(gameType, period);
  let entry = leaderboard.entries.find(e => e.userId === userId);

  if (!entry) {
    entry = {
      rank: leaderboard.entries.length + 1,
      userId,
      playerName,
      score: 0,
      gamesPlayed: 0,
      winRate: 0,
      streak: 0,
      achievements: []
    };
    leaderboard.entries.push(entry);
  }

  entry.score += scoreChange;
  entry.gamesPlayed++;
  entry.winRate = Math.round((entry.score / (entry.gamesPlayed * 100)) * 100);
  entry.streak = won ? entry.streak + 1 : 0;

  // Re-rank entries
  leaderboard.entries.sort((a, b) => b.score - a.score);
  leaderboard.entries.forEach((e, i) => e.rank = i + 1);
  leaderboard.lastUpdated = Date.now();

  return entry;
}

export function getTopPlayers(
  gameType: string,
  period: Leaderboard['period'],
  limit: number = 10
): LeaderboardEntry[] {
  const leaderboard = getOrCreateLeaderboard(gameType, period);
  return leaderboard.entries.slice(0, limit);
}

// ============================================================================
// GAME MODES
// ============================================================================

export interface GameMode {
  id: string;
  name: string;
  description: string;
  gameType: string;
  rules: GameRule[];
  modifiers: GameModifier[];
  isRanked: boolean;
  minPlayers: number;
  maxPlayers: number;
  estimatedDuration: number;
}

export interface GameRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}

export interface GameModifier {
  id: string;
  name: string;
  type: 'buff' | 'debuff' | 'neutral';
  effect: string;
  value: number;
}

const gameModes: GameMode[] = [
  {
    id: 'MODE-CLASSIC',
    name: 'Classic',
    description: 'Standard rules, no modifications',
    gameType: 'all',
    rules: [],
    modifiers: [],
    isRanked: true,
    minPlayers: 2,
    maxPlayers: 4,
    estimatedDuration: 30
  },
  {
    id: 'MODE-BLITZ',
    name: 'Blitz',
    description: 'Fast-paced with reduced time limits',
    gameType: 'all',
    rules: [{ id: 'R-BLITZ', name: 'Speed Mode', description: '50% reduced turn time', enabled: true }],
    modifiers: [{ id: 'M-SPEED', name: 'Speed Boost', type: 'neutral', effect: 'Turn time reduced', value: 0.5 }],
    isRanked: true,
    minPlayers: 2,
    maxPlayers: 2,
    estimatedDuration: 10
  },
  {
    id: 'MODE-CASUAL',
    name: 'Casual',
    description: 'Relaxed gameplay, no ranking impact',
    gameType: 'all',
    rules: [],
    modifiers: [],
    isRanked: false,
    minPlayers: 2,
    maxPlayers: 8,
    estimatedDuration: 45
  },
  {
    id: 'MODE-PRACTICE',
    name: 'Practice',
    description: 'Play against AI to improve skills',
    gameType: 'all',
    rules: [{ id: 'R-HINTS', name: 'Hints Enabled', description: 'Get move suggestions', enabled: true }],
    modifiers: [],
    isRanked: false,
    minPlayers: 1,
    maxPlayers: 1,
    estimatedDuration: 20
  },
  {
    id: 'MODE-TOURNAMENT',
    name: 'Tournament',
    description: 'Competitive play with brackets',
    gameType: 'all',
    rules: [{ id: 'R-STRICT', name: 'Strict Rules', description: 'No takebacks allowed', enabled: true }],
    modifiers: [],
    isRanked: true,
    minPlayers: 4,
    maxPlayers: 64,
    estimatedDuration: 120
  }
];

export function getGameModes(gameType?: string): GameMode[] {
  if (!gameType) return gameModes;
  return gameModes.filter(m => m.gameType === 'all' || m.gameType === gameType);
}

export function getGameMode(modeId: string): GameMode | undefined {
  return gameModes.find(m => m.id === modeId);
}

// ============================================================================
// MATCHMAKING
// ============================================================================

export interface MatchmakingQueue {
  id: string;
  gameType: string;
  mode: string;
  players: QueuedPlayer[];
  averageWaitTime: number;
}

export interface QueuedPlayer {
  userId: string;
  name: string;
  rating: number;
  queuedAt: number;
  preferences: {
    maxWaitTime: number;
    ratingRange: number;
  };
}

const matchmakingQueues: MatchmakingQueue[] = [];

export function joinMatchmaking(
  gameType: string,
  mode: string,
  userId: string,
  name: string,
  rating: number
): QueuedPlayer {
  let queue = matchmakingQueues.find(q => q.gameType === gameType && q.mode === mode);
  
  if (!queue) {
    queue = {
      id: `MMQ-${gameType}-${mode}`,
      gameType,
      mode,
      players: [],
      averageWaitTime: 30
    };
    matchmakingQueues.push(queue);
  }

  const player: QueuedPlayer = {
    userId,
    name,
    rating,
    queuedAt: Date.now(),
    preferences: {
      maxWaitTime: 120,
      ratingRange: 200
    }
  };
  queue.players.push(player);
  return player;
}

export function findMatch(gameType: string, mode: string): MultiplayerSession | null {
  const queue = matchmakingQueues.find(q => q.gameType === gameType && q.mode === mode);
  if (!queue || queue.players.length < 2) return null;

  // Simple matching: take first two players within rating range
  const player1 = queue.players[0];
  const matchIndex = queue.players.findIndex((p, i) => 
    i > 0 && Math.abs(p.rating - player1.rating) <= player1.preferences.ratingRange
  );

  if (matchIndex === -1) return null;

  const player2 = queue.players[matchIndex];
  
  // Remove from queue
  queue.players.splice(matchIndex, 1);
  queue.players.shift();

  // Create session
  const session = createMultiplayerSession(gameType, player1.userId, player1.name, 2, false);
  joinMultiplayerSession(session.id, player2.userId, player2.name);
  
  return session;
}

export function leaveMatchmaking(gameType: string, mode: string, userId: string): boolean {
  const queue = matchmakingQueues.find(q => q.gameType === gameType && q.mode === mode);
  if (!queue) return false;
  
  const index = queue.players.findIndex(p => p.userId === userId);
  if (index === -1) return false;
  
  queue.players.splice(index, 1);
  return true;
}

// ============================================================================
// EXPORTS
// ============================================================================

export const gameStrategicService = {
  // Multiplayer
  createMultiplayerSession,
  joinMultiplayerSession,
  setPlayerReady,
  startMultiplayerGame,
  sendChatMessage,
  // AI
  getAIOpponents,
  getAIMove,
  recordAIGameResult,
  // Tournament
  createTournament,
  registerForTournament,
  startTournament,
  recordMatchResult,
  // Leaderboard
  getOrCreateLeaderboard,
  updateLeaderboardEntry,
  getTopPlayers,
  // Game Modes
  getGameModes,
  getGameMode,
  // Matchmaking
  joinMatchmaking,
  findMatch,
  leaveMatchmaking
};

export default gameStrategicService;
