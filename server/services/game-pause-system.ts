/**
 * Game Pause System Service
 * Phase 144: Pause overlay, save-on-exit, game-specific save data
 */

export type GameType = 'laws_quest' | 'sovereignty_journey' | 'chess' | 'checkers' | 'battleship' | 'memory_match' | 'word_search' | 'sudoku' | 'trivia' | 'other';
export type PauseReason = 'user_initiated' | 'inactivity' | 'system' | 'connection_lost' | 'emergency';

export interface GameState {
  gameId: string;
  gameType: GameType;
  userId: string;
  sessionId: string;
  startedAt: Date;
  lastActiveAt: Date;
  isPaused: boolean;
  pauseHistory: PauseEvent[];
  saveData: GameSaveData;
  totalPlayTime: number;
  checkpoints: GameCheckpoint[];
}

export interface PauseEvent {
  pauseId: string;
  reason: PauseReason;
  pausedAt: Date;
  resumedAt?: Date;
  duration?: number;
}

export interface GameSaveData {
  version: string;
  savedAt: Date;
  data: Record<string, unknown>;
}

export interface GameCheckpoint {
  checkpointId: string;
  name: string;
  createdAt: Date;
  saveData: GameSaveData;
  isAutoSave: boolean;
}

export interface PauseOverlay {
  title: string;
  message: string;
  options: PauseOption[];
  showTimer: boolean;
  autoResumeAfter?: number;
}

export interface PauseOption {
  id: string;
  label: string;
  action: 'resume' | 'save_and_exit' | 'settings' | 'help' | 'quit_without_saving';
  isPrimary: boolean;
}

const DEFAULT_PAUSE_OPTIONS: PauseOption[] = [
  { id: 'resume', label: 'Resume Game', action: 'resume', isPrimary: true },
  { id: 'save_exit', label: 'Save & Exit', action: 'save_and_exit', isPrimary: false },
  { id: 'settings', label: 'Settings', action: 'settings', isPrimary: false },
  { id: 'help', label: 'Help', action: 'help', isPrimary: false },
  { id: 'quit', label: 'Quit Without Saving', action: 'quit_without_saving', isPrimary: false }
];

const GAME_SPECIFIC_SAVE_SCHEMAS: Record<GameType, string[]> = {
  laws_quest: ['currentRealm', 'currentChapter', 'completedChallenges', 'tokens', 'badges', 'playerChoices', 'unlockedContent'],
  sovereignty_journey: ['currentAct', 'currentScene', 'sovereigntyPoints', 'legalInstruments', 'completedQuizzes', 'playerDecisions'],
  chess: ['boardState', 'moveHistory', 'capturedPieces', 'currentTurn', 'timeRemaining', 'difficulty'],
  checkers: ['boardState', 'moveHistory', 'capturedPieces', 'currentTurn', 'isKinged'],
  battleship: ['playerBoard', 'opponentBoard', 'shotsFired', 'shipsRemaining', 'difficulty'],
  memory_match: ['cardPositions', 'matchedPairs', 'flipCount', 'timeElapsed', 'difficulty'],
  word_search: ['gridState', 'foundWords', 'remainingWords', 'timeElapsed', 'hints'],
  sudoku: ['gridState', 'originalGrid', 'pencilMarks', 'timeElapsed', 'difficulty', 'hintsUsed'],
  trivia: ['currentQuestion', 'score', 'streak', 'answeredQuestions', 'category', 'difficulty'],
  other: ['customData']
};

export function createGameState(
  gameType: GameType,
  userId: string,
  initialData: Record<string, unknown> = {}
): GameState {
  const now = new Date();
  return {
    gameId: `game-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    gameType,
    userId,
    sessionId: `session-${Date.now()}-${Math.random().toString(36).slice(2, 4)}`,
    startedAt: now,
    lastActiveAt: now,
    isPaused: false,
    pauseHistory: [],
    saveData: {
      version: '1.0',
      savedAt: now,
      data: initialData
    },
    totalPlayTime: 0,
    checkpoints: []
  };
}

export function pauseGame(state: GameState, reason: PauseReason): GameState {
  if (state.isPaused) {
    return state;
  }
  
  const now = new Date();
  const playTimeSinceLastPause = now.getTime() - state.lastActiveAt.getTime();
  
  const pauseEvent: PauseEvent = {
    pauseId: `pause-${Date.now()}`,
    reason,
    pausedAt: now
  };
  
  return {
    ...state,
    isPaused: true,
    lastActiveAt: now,
    totalPlayTime: state.totalPlayTime + playTimeSinceLastPause,
    pauseHistory: [...state.pauseHistory, pauseEvent]
  };
}

export function resumeGame(state: GameState): GameState {
  if (!state.isPaused) {
    return state;
  }
  
  const now = new Date();
  const lastPause = state.pauseHistory[state.pauseHistory.length - 1];
  
  if (lastPause && !lastPause.resumedAt) {
    lastPause.resumedAt = now;
    lastPause.duration = now.getTime() - lastPause.pausedAt.getTime();
  }
  
  return {
    ...state,
    isPaused: false,
    lastActiveAt: now,
    pauseHistory: [...state.pauseHistory.slice(0, -1), lastPause]
  };
}

export function saveGameData(state: GameState, data: Record<string, unknown>): GameState {
  const now = new Date();
  return {
    ...state,
    saveData: {
      version: state.saveData.version,
      savedAt: now,
      data: { ...state.saveData.data, ...data }
    },
    lastActiveAt: now
  };
}

export function createCheckpoint(
  state: GameState,
  name: string,
  isAutoSave: boolean = false
): GameState {
  const checkpoint: GameCheckpoint = {
    checkpointId: `checkpoint-${Date.now()}`,
    name,
    createdAt: new Date(),
    saveData: { ...state.saveData },
    isAutoSave
  };
  
  const maxCheckpoints = 10;
  const checkpoints = [...state.checkpoints, checkpoint].slice(-maxCheckpoints);
  
  return {
    ...state,
    checkpoints
  };
}

export function loadCheckpoint(state: GameState, checkpointId: string): GameState | null {
  const checkpoint = state.checkpoints.find(c => c.checkpointId === checkpointId);
  if (!checkpoint) {
    return null;
  }
  
  return {
    ...state,
    saveData: { ...checkpoint.saveData },
    lastActiveAt: new Date()
  };
}

export function generatePauseOverlay(reason: PauseReason, gameType: GameType): PauseOverlay {
  const titles: Record<PauseReason, string> = {
    user_initiated: 'Game Paused',
    inactivity: 'Are You Still There?',
    system: 'System Pause',
    connection_lost: 'Connection Lost',
    emergency: 'Emergency Pause'
  };
  
  const messages: Record<PauseReason, string> = {
    user_initiated: 'Take your time. Your progress has been saved.',
    inactivity: 'We noticed you have been away. Your game is paused.',
    system: 'The game has been paused by the system.',
    connection_lost: 'Your connection was lost. Progress saved locally.',
    emergency: 'Game paused for an emergency. Your progress is safe.'
  };
  
  let options = [...DEFAULT_PAUSE_OPTIONS];
  
  if (reason === 'connection_lost') {
    options = options.filter(o => o.action !== 'settings');
  }
  
  return {
    title: titles[reason],
    message: messages[reason],
    options,
    showTimer: reason === 'inactivity',
    autoResumeAfter: reason === 'inactivity' ? 300 : undefined
  };
}

export function getGameSaveSchema(gameType: GameType): string[] {
  return GAME_SPECIFIC_SAVE_SCHEMAS[gameType] || GAME_SPECIFIC_SAVE_SCHEMAS.other;
}

export function validateSaveData(gameType: GameType, data: Record<string, unknown>): { isValid: boolean; missingFields: string[] } {
  const schema = getGameSaveSchema(gameType);
  const missingFields = schema.filter(field => !(field in data));
  
  return {
    isValid: missingFields.length === 0,
    missingFields
  };
}

export function calculateTotalPauseTime(state: GameState): number {
  return state.pauseHistory.reduce((total, pause) => {
    if (pause.duration) {
      return total + pause.duration;
    }
    if (pause.pausedAt && !pause.resumedAt) {
      return total + (Date.now() - pause.pausedAt.getTime());
    }
    return total;
  }, 0);
}

export function generateGameSummary(state: GameState): string {
  const totalPauseTime = calculateTotalPauseTime(state);
  const activePlayTime = state.totalPlayTime;
  const sessionDuration = Date.now() - state.startedAt.getTime();
  
  return `
GAME SESSION SUMMARY
====================
Game: ${state.gameType}
Session ID: ${state.sessionId}
Started: ${state.startedAt.toLocaleString()}

TIME STATISTICS
---------------
Total Session Duration: ${Math.round(sessionDuration / 60000)} minutes
Active Play Time: ${Math.round(activePlayTime / 60000)} minutes
Total Pause Time: ${Math.round(totalPauseTime / 60000)} minutes
Number of Pauses: ${state.pauseHistory.length}

SAVE DATA
---------
Last Saved: ${state.saveData.savedAt.toLocaleString()}
Checkpoints: ${state.checkpoints.length}
Auto-saves: ${state.checkpoints.filter(c => c.isAutoSave).length}

STATUS
------
Currently Paused: ${state.isPaused ? 'Yes' : 'No'}
`;
}

export const gamePauseSystem = {
  createGameState,
  pauseGame,
  resumeGame,
  saveGameData,
  createCheckpoint,
  loadCheckpoint,
  generatePauseOverlay,
  getGameSaveSchema,
  validateSaveData,
  calculateTotalPauseTime,
  generateGameSummary,
  DEFAULT_PAUSE_OPTIONS,
  GAME_SPECIFIC_SAVE_SCHEMAS
};
