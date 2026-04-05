import { describe, it, expect } from 'vitest';
import {
  createGameState,
  pauseGame,
  resumeGame,
  saveGameData,
  createCheckpoint,
  loadCheckpoint,
  generatePauseOverlay,
  getGameSaveSchema,
  validateSaveData,
  generateGameSummary
} from './game-pause-system';

describe('Game Pause System', () => {
  describe('createGameState', () => {
    it('should create new game state with initial values', () => {
      const state = createGameState('laws_quest', 'user-001', { currentRealm: 'land' });
      
      expect(state.gameId).toContain('game-');
      expect(state.gameType).toBe('laws_quest');
      expect(state.userId).toBe('user-001');
      expect(state.isPaused).toBe(false);
      expect(state.saveData.data.currentRealm).toBe('land');
      expect(state.checkpoints).toHaveLength(0);
    });
  });

  describe('pauseGame', () => {
    it('should pause game and record pause event', () => {
      let state = createGameState('chess', 'user-001');
      
      state = pauseGame(state, 'user_initiated');
      
      expect(state.isPaused).toBe(true);
      expect(state.pauseHistory).toHaveLength(1);
      expect(state.pauseHistory[0].reason).toBe('user_initiated');
    });

    it('should not double-pause', () => {
      let state = createGameState('chess', 'user-001');
      state = pauseGame(state, 'user_initiated');
      state = pauseGame(state, 'inactivity');
      
      expect(state.pauseHistory).toHaveLength(1);
    });
  });

  describe('resumeGame', () => {
    it('should resume paused game', () => {
      let state = createGameState('chess', 'user-001');
      state = pauseGame(state, 'user_initiated');
      state = resumeGame(state);
      
      expect(state.isPaused).toBe(false);
      expect(state.pauseHistory[0].resumedAt).toBeDefined();
    });

    it('should not affect unpaused game', () => {
      let state = createGameState('chess', 'user-001');
      const originalState = { ...state };
      state = resumeGame(state);
      
      expect(state.isPaused).toBe(originalState.isPaused);
    });
  });

  describe('saveGameData', () => {
    it('should update save data', () => {
      let state = createGameState('chess', 'user-001');
      
      state = saveGameData(state, { boardState: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR' });
      
      expect(state.saveData.data.boardState).toBe('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR');
    });

    it('should merge with existing data', () => {
      let state = createGameState('chess', 'user-001', { difficulty: 'hard' });
      
      state = saveGameData(state, { currentTurn: 'white' });
      
      expect(state.saveData.data.difficulty).toBe('hard');
      expect(state.saveData.data.currentTurn).toBe('white');
    });
  });

  describe('createCheckpoint', () => {
    it('should create checkpoint with current save data', () => {
      let state = createGameState('laws_quest', 'user-001', { currentRealm: 'land' });
      
      state = createCheckpoint(state, 'Before boss fight', false);
      
      expect(state.checkpoints).toHaveLength(1);
      expect(state.checkpoints[0].name).toBe('Before boss fight');
      expect(state.checkpoints[0].isAutoSave).toBe(false);
    });

    it('should limit checkpoints to 10', () => {
      let state = createGameState('laws_quest', 'user-001');
      
      for (let i = 0; i < 15; i++) {
        state = createCheckpoint(state, `Checkpoint ${i}`, true);
      }
      
      expect(state.checkpoints).toHaveLength(10);
      expect(state.checkpoints[0].name).toBe('Checkpoint 5');
    });
  });

  describe('loadCheckpoint', () => {
    it('should restore save data from checkpoint', () => {
      let state = createGameState('laws_quest', 'user-001', { currentRealm: 'land' });
      state = createCheckpoint(state, 'Checkpoint 1', false);
      const checkpointId = state.checkpoints[0].checkpointId;
      
      state = saveGameData(state, { currentRealm: 'air' });
      state = loadCheckpoint(state, checkpointId)!;
      
      expect(state.saveData.data.currentRealm).toBe('land');
    });

    it('should return null for invalid checkpoint', () => {
      const state = createGameState('laws_quest', 'user-001');
      
      const result = loadCheckpoint(state, 'invalid-id');
      
      expect(result).toBeNull();
    });
  });

  describe('generatePauseOverlay', () => {
    it('should generate overlay for user-initiated pause', () => {
      const overlay = generatePauseOverlay('user_initiated', 'chess');
      
      expect(overlay.title).toBe('Game Paused');
      expect(overlay.options.length).toBeGreaterThan(0);
      expect(overlay.showTimer).toBe(false);
    });

    it('should generate overlay with timer for inactivity', () => {
      const overlay = generatePauseOverlay('inactivity', 'chess');
      
      expect(overlay.title).toBe('Are You Still There?');
      expect(overlay.showTimer).toBe(true);
      expect(overlay.autoResumeAfter).toBe(300);
    });

    it('should generate overlay for connection lost', () => {
      const overlay = generatePauseOverlay('connection_lost', 'chess');
      
      expect(overlay.title).toBe('Connection Lost');
      expect(overlay.options.find(o => o.action === 'settings')).toBeUndefined();
    });
  });

  describe('getGameSaveSchema', () => {
    it('should return schema for laws_quest', () => {
      const schema = getGameSaveSchema('laws_quest');
      
      expect(schema).toContain('currentRealm');
      expect(schema).toContain('tokens');
      expect(schema).toContain('badges');
    });

    it('should return schema for chess', () => {
      const schema = getGameSaveSchema('chess');
      
      expect(schema).toContain('boardState');
      expect(schema).toContain('moveHistory');
    });
  });

  describe('validateSaveData', () => {
    it('should validate complete save data', () => {
      const data = {
        boardState: 'test',
        moveHistory: [],
        capturedPieces: [],
        currentTurn: 'white',
        timeRemaining: 600,
        difficulty: 'medium'
      };
      
      const result = validateSaveData('chess', data);
      
      expect(result.isValid).toBe(true);
      expect(result.missingFields).toHaveLength(0);
    });

    it('should identify missing fields', () => {
      const data = { boardState: 'test' };
      
      const result = validateSaveData('chess', data);
      
      expect(result.isValid).toBe(false);
      expect(result.missingFields).toContain('moveHistory');
    });
  });

  describe('generateGameSummary', () => {
    it('should generate formatted summary', () => {
      let state = createGameState('laws_quest', 'user-001');
      state = pauseGame(state, 'user_initiated');
      state = resumeGame(state);
      state = createCheckpoint(state, 'Test', true);
      
      const summary = generateGameSummary(state);
      
      expect(summary).toContain('GAME SESSION SUMMARY');
      expect(summary).toContain('laws_quest');
      expect(summary).toContain('Number of Pauses: 1');
      expect(summary).toContain('Checkpoints: 1');
    });
  });
});
