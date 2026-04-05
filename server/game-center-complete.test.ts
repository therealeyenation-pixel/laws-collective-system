import { describe, it, expect } from 'vitest';
import {
  // Fleet Command
  createFleetCommandGame,
  placeShip,
  startFleetGame,
  fireShot,
  // Hearts
  createHeartsGame,
  passCards,
  executeCardPass,
  playCard,
  getHeartsWinner,
  // Knowledge Quest
  createKnowledgeQuestGame,
  getNextQuestion,
  answerQuestion,
  endKnowledgeQuest,
  // Escape Room
  createEscapeRoomGame,
  getCurrentPuzzle,
  attemptSolution,
  useHint,
  calculateEscapeScore
} from './services/game-center-complete';

// ============================================================================
// FLEET COMMAND TESTS
// ============================================================================

describe('Fleet Command - Naval Strategy Game', () => {
  describe('Game Creation', () => {
    it('should create a new game', () => {
      const game = createFleetCommandGame('Player 1', 'Player 2');
      expect(game.id).toMatch(/^FLEET-/);
      expect(game.status).toBe('setup');
      expect(game.player1.name).toBe('Player 1');
      expect(game.player2.name).toBe('Player 2');
    });

    it('should initialize empty boards', () => {
      const game = createFleetCommandGame('P1', 'P2');
      expect(game.player1.board.length).toBe(10);
      expect(game.player1.board[0].length).toBe(10);
      expect(game.player1.board[0][0]).toBe('empty');
    });
  });

  describe('Ship Placement', () => {
    it('should place a ship horizontally', () => {
      const game = createFleetCommandGame('P1', 'P2');
      const result = placeShip(game, 1, 'destroyer', 0, 0, true);
      expect(result).toBe(true);
      expect(game.player1.ships).toHaveLength(1);
      expect(game.player1.board[0][0]).toBe('ship');
      expect(game.player1.board[0][1]).toBe('ship');
    });

    it('should place a ship vertically', () => {
      const game = createFleetCommandGame('P1', 'P2');
      const result = placeShip(game, 1, 'cruiser', 0, 0, false);
      expect(result).toBe(true);
      expect(game.player1.board[0][0]).toBe('ship');
      expect(game.player1.board[1][0]).toBe('ship');
      expect(game.player1.board[2][0]).toBe('ship');
    });

    it('should reject ship placement out of bounds', () => {
      const game = createFleetCommandGame('P1', 'P2');
      const result = placeShip(game, 1, 'carrier', 0, 8, true); // Carrier is 5 long
      expect(result).toBe(false);
    });

    it('should reject duplicate ship types', () => {
      const game = createFleetCommandGame('P1', 'P2');
      placeShip(game, 1, 'destroyer', 0, 0, true);
      const result = placeShip(game, 1, 'destroyer', 2, 0, true);
      expect(result).toBe(false);
    });
  });

  describe('Game Start', () => {
    it('should not start without all ships placed', () => {
      const game = createFleetCommandGame('P1', 'P2');
      placeShip(game, 1, 'destroyer', 0, 0, true);
      const result = startFleetGame(game);
      expect(result).toBe(false);
    });

    it('should start when all ships placed', () => {
      const game = createFleetCommandGame('P1', 'P2');
      // Place all ships for both players
      const ships: Array<{ type: 'carrier' | 'battleship' | 'cruiser' | 'submarine' | 'destroyer'; row: number }> = [
        { type: 'carrier', row: 0 },
        { type: 'battleship', row: 1 },
        { type: 'cruiser', row: 2 },
        { type: 'submarine', row: 3 },
        { type: 'destroyer', row: 4 }
      ];
      ships.forEach(s => {
        placeShip(game, 1, s.type, s.row, 0, true);
        placeShip(game, 2, s.type, s.row, 0, true);
      });
      const result = startFleetGame(game);
      expect(result).toBe(true);
      expect(game.status).toBe('playing');
    });
  });

  describe('Combat', () => {
    it('should register a miss', () => {
      const game = createFleetCommandGame('P1', 'P2');
      const ships: Array<{ type: 'carrier' | 'battleship' | 'cruiser' | 'submarine' | 'destroyer'; row: number }> = [
        { type: 'carrier', row: 0 },
        { type: 'battleship', row: 1 },
        { type: 'cruiser', row: 2 },
        { type: 'submarine', row: 3 },
        { type: 'destroyer', row: 4 }
      ];
      ships.forEach(s => {
        placeShip(game, 1, s.type, s.row, 0, true);
        placeShip(game, 2, s.type, s.row, 0, true);
      });
      startFleetGame(game);
      
      const move = fireShot(game, 9, 9); // Empty cell
      expect(move?.result).toBe('miss');
    });

    it('should register a hit', () => {
      const game = createFleetCommandGame('P1', 'P2');
      const ships: Array<{ type: 'carrier' | 'battleship' | 'cruiser' | 'submarine' | 'destroyer'; row: number }> = [
        { type: 'carrier', row: 0 },
        { type: 'battleship', row: 1 },
        { type: 'cruiser', row: 2 },
        { type: 'submarine', row: 3 },
        { type: 'destroyer', row: 4 }
      ];
      ships.forEach(s => {
        placeShip(game, 1, s.type, s.row, 0, true);
        placeShip(game, 2, s.type, s.row, 0, true);
      });
      startFleetGame(game);
      
      const move = fireShot(game, 0, 0); // Hit carrier
      expect(move?.result).toBe('hit');
    });
  });
});

// ============================================================================
// HEARTS TESTS
// ============================================================================

describe('Hearts - Card Game', () => {
  describe('Game Creation', () => {
    it('should create a 4-player game', () => {
      const game = createHeartsGame(['Alice', 'Bob', 'Carol', 'Dave']);
      expect(game.id).toMatch(/^HEARTS-/);
      expect(game.players).toHaveLength(4);
      expect(game.status).toBe('passing');
    });

    it('should deal 13 cards to each player', () => {
      const game = createHeartsGame(['A', 'B', 'C', 'D']);
      game.players.forEach(p => {
        expect(p.hand).toHaveLength(13);
      });
    });

    it('should reject non-4 player games', () => {
      expect(() => createHeartsGame(['A', 'B', 'C'])).toThrow();
    });
  });

  describe('Card Passing', () => {
    it('should allow passing 3 cards', () => {
      const game = createHeartsGame(['A', 'B', 'C', 'D']);
      const cards = game.players[0].hand.slice(0, 3);
      const result = passCards(game, 0, cards);
      expect(result).toBe(true);
    });

    it('should reject passing wrong number of cards', () => {
      const game = createHeartsGame(['A', 'B', 'C', 'D']);
      const cards = game.players[0].hand.slice(0, 2);
      const result = passCards(game, 0, cards);
      expect(result).toBe(false);
    });
  });

  describe('Card Play', () => {
    it('should allow playing a card', () => {
      const game = createHeartsGame(['A', 'B', 'C', 'D']);
      game.status = 'playing';
      // Find player with 2 of clubs
      const leadPlayer = game.players.findIndex(p => 
        p.hand.some(c => c.suit === 'clubs' && c.rank === '2')
      );
      game.currentPlayer = leadPlayer;
      
      const twoOfClubs = game.players[leadPlayer].hand.find(c => c.suit === 'clubs' && c.rank === '2')!;
      const result = playCard(game, leadPlayer, twoOfClubs);
      expect(result).toBe(true);
    });
  });

  describe('Winner Determination', () => {
    it('should return null if game not finished', () => {
      const game = createHeartsGame(['A', 'B', 'C', 'D']);
      const winner = getHeartsWinner(game);
      expect(winner).toBeNull();
    });
  });
});

// ============================================================================
// KNOWLEDGE QUEST TESTS
// ============================================================================

describe('Knowledge Quest - Trivia Game', () => {
  describe('Game Creation', () => {
    it('should create a new game', () => {
      const game = createKnowledgeQuestGame('Player 1');
      expect(game.id).toMatch(/^QUEST-/);
      expect(game.status).toBe('playing');
      expect(game.player.name).toBe('Player 1');
    });

    it('should set default categories', () => {
      const game = createKnowledgeQuestGame('P1');
      expect(game.categories).toContain('land');
      expect(game.categories).toContain('air');
      expect(game.categories).toContain('water');
      expect(game.categories).toContain('self');
    });

    it('should allow custom categories', () => {
      const game = createKnowledgeQuestGame('P1', ['finance', 'general']);
      expect(game.categories).toEqual(['finance', 'general']);
    });
  });

  describe('Questions', () => {
    it('should get a question', () => {
      const game = createKnowledgeQuestGame('P1', ['finance', 'general', 'land', 'air', 'water', 'self']);
      const question = getNextQuestion(game);
      expect(question).not.toBeNull();
      expect(question?.options).toHaveLength(4);
    });

    it('should track current question', () => {
      const game = createKnowledgeQuestGame('P1', ['finance', 'general', 'land', 'air', 'water', 'self']);
      getNextQuestion(game);
      expect(game.currentQuestion).not.toBeNull();
    });
  });

  describe('Answering', () => {
    it('should award points for correct answer', () => {
      const game = createKnowledgeQuestGame('P1', ['finance', 'general', 'land', 'air', 'water', 'self']);
      const question = getNextQuestion(game);
      const result = answerQuestion(game, question!.correctIndex);
      expect(result?.correct).toBe(true);
      expect(game.player.score).toBeGreaterThan(0);
    });

    it('should not award points for wrong answer', () => {
      const game = createKnowledgeQuestGame('P1', ['finance', 'general', 'land', 'air', 'water', 'self']);
      const question = getNextQuestion(game);
      const wrongIndex = (question!.correctIndex + 1) % 4;
      const result = answerQuestion(game, wrongIndex);
      expect(result?.correct).toBe(false);
      expect(result?.pointsEarned).toBe(0);
    });

    it('should track streak', () => {
      const game = createKnowledgeQuestGame('P1', ['finance', 'general', 'land', 'air', 'water', 'self']);
      
      // Answer correctly twice
      let q = getNextQuestion(game);
      answerQuestion(game, q!.correctIndex);
      q = getNextQuestion(game);
      if (q) answerQuestion(game, q.correctIndex);
      
      expect(game.streak).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Game End', () => {
    it('should calculate final stats', () => {
      const game = createKnowledgeQuestGame('P1', ['finance', 'general', 'land', 'air', 'water', 'self']);
      getNextQuestion(game);
      answerQuestion(game, game.currentQuestion!.correctIndex);
      
      const result = endKnowledgeQuest(game);
      expect(result.score).toBeGreaterThan(0);
      expect(result.accuracy).toBe(100);
    });
  });
});

// ============================================================================
// ADVANCED ESCAPE ROOM TESTS
// ============================================================================

describe('Advanced Escape Room - Puzzle Game', () => {
  describe('Game Creation', () => {
    it('should create a new game', () => {
      const game = createEscapeRoomGame('Mystery Manor', ['Alice', 'Bob']);
      expect(game.id).toMatch(/^ESCAPE-/);
      expect(game.status).toBe('playing');
      expect(game.players).toHaveLength(2);
    });

    it('should set time limit based on difficulty', () => {
      const easyGame = createEscapeRoomGame('Test', ['P1'], 'easy');
      const hardGame = createEscapeRoomGame('Test', ['P1'], 'hard');
      expect(easyGame.timeLimit).toBe(60);
      expect(hardGame.timeLimit).toBe(30);
    });

    it('should set max hints based on difficulty', () => {
      const easyGame = createEscapeRoomGame('Test', ['P1'], 'easy');
      const hardGame = createEscapeRoomGame('Test', ['P1'], 'hard');
      expect(easyGame.maxHints).toBe(10);
      expect(hardGame.maxHints).toBe(3);
    });
  });

  describe('Puzzles', () => {
    it('should get current puzzle', () => {
      const game = createEscapeRoomGame('Test', ['P1']);
      const puzzle = getCurrentPuzzle(game);
      expect(puzzle).not.toBeNull();
      expect(puzzle?.solved).toBe(false);
    });

    it('should have puzzle with clue and solution', () => {
      const game = createEscapeRoomGame('Test', ['P1']);
      const puzzle = getCurrentPuzzle(game);
      expect(puzzle?.clue).toBeDefined();
      expect(puzzle?.solution).toBeDefined();
    });
  });

  describe('Solutions', () => {
    it('should accept correct solution', () => {
      const game = createEscapeRoomGame('Test', ['P1']);
      const puzzle = getCurrentPuzzle(game);
      const result = attemptSolution(game, 0, puzzle!.solution);
      expect(result.correct).toBe(true);
    });

    it('should reject incorrect solution', () => {
      const game = createEscapeRoomGame('Test', ['P1']);
      const result = attemptSolution(game, 0, 'WRONG ANSWER');
      expect(result.correct).toBe(false);
    });

    it('should track attempts', () => {
      const game = createEscapeRoomGame('Test', ['P1']);
      attemptSolution(game, 0, 'WRONG');
      const puzzle = getCurrentPuzzle(game);
      expect(puzzle?.attempts).toBe(1);
    });

    it('should fail game after max attempts', () => {
      const game = createEscapeRoomGame('Test', ['P1']);
      const puzzle = getCurrentPuzzle(game);
      for (let i = 0; i < puzzle!.maxAttempts; i++) {
        attemptSolution(game, 0, 'WRONG');
      }
      expect(game.status).toBe('failed');
    });
  });

  describe('Hints', () => {
    it('should provide hint', () => {
      const game = createEscapeRoomGame('Test', ['P1']);
      const hint = useHint(game);
      expect(hint).not.toBeNull();
      expect(game.hintsUsed).toBe(1);
    });

    it('should limit hints', () => {
      const game = createEscapeRoomGame('Test', ['P1'], 'hard'); // 3 max hints
      useHint(game);
      useHint(game);
      useHint(game);
      const fourthHint = useHint(game);
      expect(fourthHint).toBeNull();
    });
  });

  describe('Scoring', () => {
    it('should calculate score on escape', () => {
      const game = createEscapeRoomGame('Test', ['P1'], 'easy');
      // Solve all puzzles
      while (game.status === 'playing' && getCurrentPuzzle(game)) {
        const puzzle = getCurrentPuzzle(game);
        attemptSolution(game, 0, puzzle!.solution);
      }
      
      if (game.status === 'escaped') {
        const score = calculateEscapeScore(game);
        expect(score).toBeGreaterThan(0);
      }
    });

    it('should return 0 if not escaped', () => {
      const game = createEscapeRoomGame('Test', ['P1']);
      const score = calculateEscapeScore(game);
      expect(score).toBe(0);
    });
  });
});
