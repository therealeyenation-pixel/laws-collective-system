/**
 * Universal Game Save System
 * L.A.W.S. Quest - Commercial Game Product
 * Owned by The L.A.W.S. Collective, LLC
 * 
 * Provides pause and auto-save functionality across all Game Center games
 */

// ============================================
// GAME IDENTIFICATION
// ============================================

export type GameId = 
  | "chess"
  | "checkers"
  | "connect-four"
  | "tic-tac-toe"
  | "sudoku"
  | "memory-match"
  | "solitaire"
  | "snake"
  | "2048"
  | "battleship"
  | "word-search"
  | "hangman"
  | "laws-quest";

export interface GameInfo {
  id: GameId;
  name: string;
  category: "strategy" | "puzzle" | "card" | "arcade" | "word" | "rpg";
  supportsMultiplayer: boolean;
  supportsPause: boolean;
  supportsAutoSave: boolean;
  maxSaveSlots: number;
}

export const GAME_INFO: Record<GameId, GameInfo> = {
  "chess": {
    id: "chess",
    name: "Chess",
    category: "strategy",
    supportsMultiplayer: true,
    supportsPause: true,
    supportsAutoSave: true,
    maxSaveSlots: 5,
  },
  "checkers": {
    id: "checkers",
    name: "Checkers",
    category: "strategy",
    supportsMultiplayer: true,
    supportsPause: true,
    supportsAutoSave: true,
    maxSaveSlots: 5,
  },
  "connect-four": {
    id: "connect-four",
    name: "Connect Four",
    category: "strategy",
    supportsMultiplayer: true,
    supportsPause: true,
    supportsAutoSave: true,
    maxSaveSlots: 5,
  },
  "tic-tac-toe": {
    id: "tic-tac-toe",
    name: "Tic-Tac-Toe",
    category: "strategy",
    supportsMultiplayer: true,
    supportsPause: true,
    supportsAutoSave: true,
    maxSaveSlots: 3,
  },
  "sudoku": {
    id: "sudoku",
    name: "Sudoku",
    category: "puzzle",
    supportsMultiplayer: false,
    supportsPause: true,
    supportsAutoSave: true,
    maxSaveSlots: 10,
  },
  "memory-match": {
    id: "memory-match",
    name: "Memory Match",
    category: "puzzle",
    supportsMultiplayer: false,
    supportsPause: true,
    supportsAutoSave: true,
    maxSaveSlots: 5,
  },
  "solitaire": {
    id: "solitaire",
    name: "Solitaire",
    category: "card",
    supportsMultiplayer: false,
    supportsPause: true,
    supportsAutoSave: true,
    maxSaveSlots: 5,
  },
  "snake": {
    id: "snake",
    name: "Snake",
    category: "arcade",
    supportsMultiplayer: false,
    supportsPause: true,
    supportsAutoSave: false, // Snake doesn't benefit from save mid-game
    maxSaveSlots: 1,
  },
  "2048": {
    id: "2048",
    name: "2048",
    category: "puzzle",
    supportsMultiplayer: false,
    supportsPause: true,
    supportsAutoSave: true,
    maxSaveSlots: 3,
  },
  "battleship": {
    id: "battleship",
    name: "Battleship",
    category: "strategy",
    supportsMultiplayer: true,
    supportsPause: true,
    supportsAutoSave: true,
    maxSaveSlots: 5,
  },
  "word-search": {
    id: "word-search",
    name: "Word Search",
    category: "word",
    supportsMultiplayer: false,
    supportsPause: true,
    supportsAutoSave: true,
    maxSaveSlots: 5,
  },
  "hangman": {
    id: "hangman",
    name: "Hangman",
    category: "word",
    supportsMultiplayer: false,
    supportsPause: true,
    supportsAutoSave: true,
    maxSaveSlots: 3,
  },
  "laws-quest": {
    id: "laws-quest",
    name: "L.A.W.S. Quest",
    category: "rpg",
    supportsMultiplayer: false,
    supportsPause: true,
    supportsAutoSave: true,
    maxSaveSlots: 10,
  },
};

// ============================================
// PAUSE SYSTEM
// ============================================

export type PauseReason = 
  | "user_requested"
  | "window_blur"
  | "menu_opened"
  | "auto_save"
  | "connection_lost"
  | "system";

export interface PauseState {
  isPaused: boolean;
  pausedAt: number | null;
  pauseReason: PauseReason | null;
  totalPausedTime: number;
  canResume: boolean;
}

export interface PauseOptions {
  showOverlay: boolean;
  allowResume: boolean;
  autoSaveOnPause: boolean;
  blurBackground: boolean;
  pauseAnimations: boolean;
  pauseTimers: boolean;
  pauseAudio: boolean;
}

export const DEFAULT_PAUSE_OPTIONS: PauseOptions = {
  showOverlay: true,
  allowResume: true,
  autoSaveOnPause: true,
  blurBackground: true,
  pauseAnimations: true,
  pauseTimers: true,
  pauseAudio: true,
};

// ============================================
// AUTO-SAVE SYSTEM
// ============================================

export type AutoSaveTrigger = 
  | "interval"
  | "pause"
  | "exit"
  | "checkpoint"
  | "significant_change"
  | "manual";

export interface AutoSaveConfig {
  enabled: boolean;
  intervalMs: number; // Auto-save interval in milliseconds
  saveOnPause: boolean;
  saveOnExit: boolean;
  saveOnSignificantChange: boolean;
  maxAutoSaves: number;
  showIndicator: boolean;
  silentSave: boolean; // Don't show toast notifications
}

export const DEFAULT_AUTO_SAVE_CONFIG: AutoSaveConfig = {
  enabled: true,
  intervalMs: 60000, // 1 minute
  saveOnPause: true,
  saveOnExit: true,
  saveOnSignificantChange: true,
  maxAutoSaves: 3,
  showIndicator: true,
  silentSave: false,
};

export interface AutoSaveState {
  lastAutoSave: number | null;
  nextAutoSave: number | null;
  autoSaveCount: number;
  isSaving: boolean;
  lastSaveError: string | null;
}

// ============================================
// SAVE DATA STRUCTURES
// ============================================

export interface GameSaveMetadata {
  saveId: string;
  gameId: GameId;
  userId: string;
  slot: number;
  name: string;
  description: string;
  createdAt: number;
  updatedAt: number;
  playDuration: number; // Total play time in seconds
  isAutoSave: boolean;
  trigger: AutoSaveTrigger;
  version: string;
  platform: "web" | "mobile" | "desktop" | "vr" | "console";
  thumbnail?: string; // Base64 encoded screenshot
}

export interface GameSaveData<T = unknown> {
  metadata: GameSaveMetadata;
  gameState: T;
  checksum: string;
}

// ============================================
// GAME-SPECIFIC SAVE STATES
// ============================================

// Chess Save State
export interface ChessSaveState {
  board: (ChessPiece | null)[][];
  currentPlayer: "white" | "black";
  moveHistory: ChessMove[];
  capturedPieces: { white: ChessPiece[]; black: ChessPiece[] };
  gameMode: "ai" | "local" | "online";
  difficulty: "easy" | "medium" | "hard" | "expert";
  aiPersonality: "balanced" | "aggressive" | "defensive";
  castlingRights: CastlingRights;
  enPassantTarget: ChessPosition | null;
  halfMoveClock: number;
  fullMoveNumber: number;
  timeRemaining?: { white: number; black: number };
  scores: { player1: number; player2: number; draws: number };
}

export interface ChessPiece {
  type: "king" | "queen" | "rook" | "bishop" | "knight" | "pawn";
  color: "white" | "black";
}

export interface ChessMove {
  from: ChessPosition;
  to: ChessPosition;
  piece: ChessPiece;
  captured?: ChessPiece;
  notation: string;
  timestamp: number;
}

export interface ChessPosition {
  row: number;
  col: number;
}

export interface CastlingRights {
  whiteKingside: boolean;
  whiteQueenside: boolean;
  blackKingside: boolean;
  blackQueenside: boolean;
}

// Checkers Save State
export interface CheckersSaveState {
  board: (CheckersPiece | null)[][];
  currentPlayer: "red" | "black";
  moveHistory: CheckersMove[];
  capturedPieces: { red: number; black: number };
  gameMode: "ai" | "local" | "online";
  difficulty: "easy" | "medium" | "hard";
  aiPersonality: "balanced" | "aggressive" | "defensive";
  mustJump: boolean;
  selectedPiece: CheckersPosition | null;
  scores: { player1: number; player2: number; draws: number };
}

export interface CheckersPiece {
  color: "red" | "black";
  isKing: boolean;
}

export interface CheckersMove {
  from: CheckersPosition;
  to: CheckersPosition;
  captured?: CheckersPosition[];
  becameKing: boolean;
  timestamp: number;
}

export interface CheckersPosition {
  row: number;
  col: number;
}

// Connect Four Save State
export interface ConnectFourSaveState {
  grid: (0 | 1 | 2)[][]; // 0 = empty, 1 = player 1, 2 = player 2
  currentPlayer: 1 | 2;
  moveHistory: number[]; // Column indices
  gameMode: "ai" | "local" | "online";
  difficulty: "easy" | "medium" | "hard";
  aiPersonality: "balanced" | "aggressive" | "defensive";
  scores: { player1: number; player2: number; draws: number };
}

// Tic-Tac-Toe Save State
export interface TicTacToeSaveState {
  board: ("X" | "O" | null)[][];
  currentPlayer: "X" | "O";
  gameMode: "ai" | "local" | "online";
  difficulty: "easy" | "medium" | "hard";
  scores: { x: number; o: number; draws: number };
}

// Sudoku Save State
export interface SudokuSaveState {
  grid: number[][];
  solution: number[][];
  initialGrid: number[][];
  notes: Set<number>[][];
  difficulty: "easy" | "medium" | "hard" | "expert";
  timer: number; // Seconds elapsed
  mistakes: number;
  hintsUsed: number;
  selectedCell: { row: number; col: number } | null;
  highlightedNumber: number | null;
}

// Memory Match Save State
export interface MemoryMatchSaveState {
  cards: MemoryCard[];
  flippedIndices: number[];
  matchedPairs: number[];
  moves: number;
  timer: number;
  difficulty: "easy" | "medium" | "hard";
  theme: string;
  bestScore?: number;
}

export interface MemoryCard {
  id: number;
  symbol: string;
  isFlipped: boolean;
  isMatched: boolean;
}

// Solitaire Save State
export interface SolitaireSaveState {
  tableau: SolitaireCard[][];
  foundations: SolitaireCard[][];
  stock: SolitaireCard[];
  waste: SolitaireCard[];
  moveHistory: SolitaireMove[];
  score: number;
  timer: number;
  drawCount: 1 | 3;
  moves: number;
}

export interface SolitaireCard {
  suit: "hearts" | "diamonds" | "clubs" | "spades";
  rank: number; // 1-13 (Ace-King)
  faceUp: boolean;
}

export interface SolitaireMove {
  type: "draw" | "move" | "foundation" | "undo";
  from: string;
  to: string;
  cards: SolitaireCard[];
  timestamp: number;
}

// Snake Save State (minimal - mostly for high scores)
export interface SnakeSaveState {
  snake: { x: number; y: number }[];
  food: { x: number; y: number };
  direction: "UP" | "DOWN" | "LEFT" | "RIGHT";
  score: number;
  highScore: number;
  speed: number;
}

// 2048 Save State
export interface Game2048SaveState {
  grid: number[][];
  score: number;
  bestScore: number;
  moveHistory: Game2048Move[];
  gameOver: boolean;
  won: boolean;
  continueAfterWin: boolean;
}

export interface Game2048Move {
  direction: "up" | "down" | "left" | "right";
  gridBefore: number[][];
  gridAfter: number[][];
  scoreGained: number;
  timestamp: number;
}

// Battleship Save State
export interface BattleshipSaveState {
  playerBoard: BattleshipCell[][];
  opponentBoard: BattleshipCell[][];
  playerShips: BattleshipShip[];
  opponentShips: BattleshipShip[];
  currentTurn: "player" | "opponent";
  shotHistory: BattleshipShot[];
  gameMode: "ai" | "local" | "online";
  difficulty: "easy" | "medium" | "hard";
  phase: "setup" | "playing" | "finished";
}

export interface BattleshipCell {
  hasShip: boolean;
  isHit: boolean;
  shipId?: string;
}

export interface BattleshipShip {
  id: string;
  name: string;
  size: number;
  positions: { row: number; col: number }[];
  hits: number;
  isSunk: boolean;
}

export interface BattleshipShot {
  row: number;
  col: number;
  isHit: boolean;
  player: "player" | "opponent";
  timestamp: number;
}

// Word Search Save State
export interface WordSearchSaveState {
  grid: string[][];
  words: WordSearchWord[];
  foundWords: string[];
  selectedCells: { row: number; col: number }[];
  timer: number;
  difficulty: "easy" | "medium" | "hard";
  category: string;
  hints: number;
}

export interface WordSearchWord {
  word: string;
  startRow: number;
  startCol: number;
  direction: "horizontal" | "vertical" | "diagonal" | "reverse-horizontal" | "reverse-vertical" | "reverse-diagonal";
  found: boolean;
}

// Hangman Save State
export interface HangmanSaveState {
  word: string;
  category: string;
  guessedLetters: string[];
  wrongGuesses: number;
  maxWrongGuesses: number;
  hint?: string;
  score: number;
  streak: number;
  difficulty: "easy" | "medium" | "hard";
}

// ============================================
// SAVE MANAGER INTERFACE
// ============================================

export interface SaveManager<T> {
  // Core operations
  save(slot: number, state: T, trigger?: AutoSaveTrigger): Promise<GameSaveData<T>>;
  load(slot: number): Promise<GameSaveData<T> | null>;
  delete(slot: number): Promise<boolean>;
  
  // Slot management
  listSaves(): Promise<GameSaveMetadata[]>;
  getSaveMetadata(slot: number): Promise<GameSaveMetadata | null>;
  getNextAvailableSlot(): Promise<number>;
  
  // Auto-save
  startAutoSave(): void;
  stopAutoSave(): void;
  triggerAutoSave(): Promise<void>;
  
  // Cloud sync
  syncToCloud(): Promise<boolean>;
  syncFromCloud(): Promise<boolean>;
  
  // Validation
  validateSave(data: GameSaveData<T>): boolean;
  migrateOldSave(data: unknown): GameSaveData<T> | null;
}

// ============================================
// PAUSE MANAGER INTERFACE
// ============================================

export interface PauseManager {
  // State
  getState(): PauseState;
  isPaused(): boolean;
  
  // Actions
  pause(reason?: PauseReason): void;
  resume(): void;
  toggle(): void;
  
  // Configuration
  setOptions(options: Partial<PauseOptions>): void;
  getOptions(): PauseOptions;
  
  // Events
  onPause(callback: (state: PauseState) => void): () => void;
  onResume(callback: (state: PauseState) => void): () => void;
}

// ============================================
// GAME SESSION
// ============================================

export interface GameSession {
  sessionId: string;
  gameId: GameId;
  userId: string;
  startedAt: number;
  endedAt: number | null;
  duration: number;
  pauseState: PauseState;
  autoSaveState: AutoSaveState;
  currentSaveSlot: number | null;
  isActive: boolean;
}

// ============================================
// EVENTS
// ============================================

export type GameSaveEvent = 
  | { type: "save_started"; slot: number; trigger: AutoSaveTrigger }
  | { type: "save_completed"; slot: number; metadata: GameSaveMetadata }
  | { type: "save_failed"; slot: number; error: string }
  | { type: "load_started"; slot: number }
  | { type: "load_completed"; slot: number; metadata: GameSaveMetadata }
  | { type: "load_failed"; slot: number; error: string }
  | { type: "auto_save_triggered" }
  | { type: "pause_state_changed"; state: PauseState };

export type GameSaveEventHandler = (event: GameSaveEvent) => void;
