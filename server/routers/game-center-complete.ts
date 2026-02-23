import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import {
  createFleetCommandGame,
  placeShip,
  startFleetGame,
  fireShot,
  createHeartsGame,
  passCards,
  executeCardPass,
  playCard,
  getHeartsWinner,
  createKnowledgeQuestGame,
  getNextQuestion,
  answerQuestion,
  endKnowledgeQuest,
  createEscapeRoomGame,
  getCurrentPuzzle,
  attemptSolution,
  useHint,
  calculateEscapeScore,
  FleetCommandGame,
  HeartsGame,
  KnowledgeQuestGame,
  EscapeRoomGame
} from "../services/game-center-complete";

// In-memory game storage (in production, use database)
const fleetGames = new Map<string, FleetCommandGame>();
const heartsGames = new Map<string, HeartsGame>();
const questGames = new Map<string, KnowledgeQuestGame>();
const escapeGames = new Map<string, EscapeRoomGame>();

export const gameCenterCompleteRouter = router({
  // ============================================================================
  // FLEET COMMAND
  // ============================================================================
  
  createFleetGame: protectedProcedure
    .input(z.object({
      player1Name: z.string(),
      player2Name: z.string()
    }))
    .mutation(({ input }) => {
      const game = createFleetCommandGame(input.player1Name, input.player2Name);
      fleetGames.set(game.id, game);
      return { gameId: game.id, game };
    }),

  placeFleetShip: protectedProcedure
    .input(z.object({
      gameId: z.string(),
      playerNum: z.union([z.literal(1), z.literal(2)]),
      shipType: z.enum(['carrier', 'battleship', 'cruiser', 'submarine', 'destroyer']),
      startRow: z.number().min(0).max(9),
      startCol: z.number().min(0).max(9),
      horizontal: z.boolean()
    }))
    .mutation(({ input }) => {
      const game = fleetGames.get(input.gameId);
      if (!game) throw new Error('Game not found');
      const success = placeShip(game, input.playerNum, input.shipType, input.startRow, input.startCol, input.horizontal);
      return { success, game };
    }),

  startFleetGame: protectedProcedure
    .input(z.object({ gameId: z.string() }))
    .mutation(({ input }) => {
      const game = fleetGames.get(input.gameId);
      if (!game) throw new Error('Game not found');
      const success = startFleetGame(game);
      return { success, game };
    }),

  fireFleetShot: protectedProcedure
    .input(z.object({
      gameId: z.string(),
      row: z.number().min(0).max(9),
      col: z.number().min(0).max(9)
    }))
    .mutation(({ input }) => {
      const game = fleetGames.get(input.gameId);
      if (!game) throw new Error('Game not found');
      const move = fireShot(game, input.row, input.col);
      return { move, game };
    }),

  getFleetGame: protectedProcedure
    .input(z.object({ gameId: z.string() }))
    .query(({ input }) => {
      const game = fleetGames.get(input.gameId);
      if (!game) throw new Error('Game not found');
      return game;
    }),

  // ============================================================================
  // HEARTS
  // ============================================================================

  createHeartsGame: protectedProcedure
    .input(z.object({
      playerNames: z.array(z.string()).length(4)
    }))
    .mutation(({ input }) => {
      const game = createHeartsGame(input.playerNames);
      heartsGames.set(game.id, game);
      return { gameId: game.id, game };
    }),

  passHeartsCards: protectedProcedure
    .input(z.object({
      gameId: z.string(),
      playerIndex: z.number().min(0).max(3),
      cards: z.array(z.object({
        suit: z.enum(['hearts', 'diamonds', 'clubs', 'spades']),
        rank: z.enum(['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']),
        value: z.number()
      })).length(3)
    }))
    .mutation(({ input }) => {
      const game = heartsGames.get(input.gameId);
      if (!game) throw new Error('Game not found');
      const success = passCards(game, input.playerIndex, input.cards);
      return { success, game };
    }),

  executeHeartsPass: protectedProcedure
    .input(z.object({ gameId: z.string() }))
    .mutation(({ input }) => {
      const game = heartsGames.get(input.gameId);
      if (!game) throw new Error('Game not found');
      const success = executeCardPass(game);
      return { success, game };
    }),

  playHeartsCard: protectedProcedure
    .input(z.object({
      gameId: z.string(),
      playerIndex: z.number().min(0).max(3),
      card: z.object({
        suit: z.enum(['hearts', 'diamonds', 'clubs', 'spades']),
        rank: z.enum(['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']),
        value: z.number()
      })
    }))
    .mutation(({ input }) => {
      const game = heartsGames.get(input.gameId);
      if (!game) throw new Error('Game not found');
      const success = playCard(game, input.playerIndex, input.card);
      return { success, game };
    }),

  getHeartsWinner: protectedProcedure
    .input(z.object({ gameId: z.string() }))
    .query(({ input }) => {
      const game = heartsGames.get(input.gameId);
      if (!game) throw new Error('Game not found');
      return getHeartsWinner(game);
    }),

  getHeartsGame: protectedProcedure
    .input(z.object({ gameId: z.string() }))
    .query(({ input }) => {
      const game = heartsGames.get(input.gameId);
      if (!game) throw new Error('Game not found');
      return game;
    }),

  // ============================================================================
  // KNOWLEDGE QUEST
  // ============================================================================

  createKnowledgeQuest: protectedProcedure
    .input(z.object({
      playerName: z.string(),
      categories: z.array(z.enum(['land', 'air', 'water', 'self', 'finance', 'history', 'science', 'general'])).optional(),
      difficulty: z.enum(['easy', 'medium', 'hard']).optional()
    }))
    .mutation(({ input }) => {
      const game = createKnowledgeQuestGame(
        input.playerName,
        input.categories,
        input.difficulty
      );
      questGames.set(game.id, game);
      return { gameId: game.id, game };
    }),

  getQuestQuestion: protectedProcedure
    .input(z.object({ gameId: z.string() }))
    .mutation(({ input }) => {
      const game = questGames.get(input.gameId);
      if (!game) throw new Error('Game not found');
      const question = getNextQuestion(game);
      return { question, game };
    }),

  answerQuestQuestion: protectedProcedure
    .input(z.object({
      gameId: z.string(),
      answerIndex: z.number().min(0).max(3)
    }))
    .mutation(({ input }) => {
      const game = questGames.get(input.gameId);
      if (!game) throw new Error('Game not found');
      const result = answerQuestion(game, input.answerIndex);
      return { result, game };
    }),

  endKnowledgeQuest: protectedProcedure
    .input(z.object({ gameId: z.string() }))
    .mutation(({ input }) => {
      const game = questGames.get(input.gameId);
      if (!game) throw new Error('Game not found');
      const result = endKnowledgeQuest(game);
      return { result, game };
    }),

  getQuestGame: protectedProcedure
    .input(z.object({ gameId: z.string() }))
    .query(({ input }) => {
      const game = questGames.get(input.gameId);
      if (!game) throw new Error('Game not found');
      return game;
    }),

  // ============================================================================
  // ESCAPE ROOM
  // ============================================================================

  createEscapeRoom: protectedProcedure
    .input(z.object({
      roomName: z.string(),
      playerNames: z.array(z.string()).min(1).max(4),
      difficulty: z.enum(['easy', 'medium', 'hard']).optional()
    }))
    .mutation(({ input }) => {
      const game = createEscapeRoomGame(
        input.roomName,
        input.playerNames,
        input.difficulty
      );
      escapeGames.set(game.id, game);
      return { gameId: game.id, game };
    }),

  getEscapePuzzle: protectedProcedure
    .input(z.object({ gameId: z.string() }))
    .query(({ input }) => {
      const game = escapeGames.get(input.gameId);
      if (!game) throw new Error('Game not found');
      const puzzle = getCurrentPuzzle(game);
      // Don't expose solution
      if (puzzle) {
        const { solution, ...safePuzzle } = puzzle;
        return safePuzzle;
      }
      return null;
    }),

  attemptEscapeSolution: protectedProcedure
    .input(z.object({
      gameId: z.string(),
      playerIndex: z.number().min(0).max(3),
      answer: z.string()
    }))
    .mutation(({ input }) => {
      const game = escapeGames.get(input.gameId);
      if (!game) throw new Error('Game not found');
      const result = attemptSolution(game, input.playerIndex, input.answer);
      return { result, game };
    }),

  useEscapeHint: protectedProcedure
    .input(z.object({ gameId: z.string() }))
    .mutation(({ input }) => {
      const game = escapeGames.get(input.gameId);
      if (!game) throw new Error('Game not found');
      const hint = useHint(game);
      return { hint, hintsRemaining: game.maxHints - game.hintsUsed };
    }),

  getEscapeScore: protectedProcedure
    .input(z.object({ gameId: z.string() }))
    .query(({ input }) => {
      const game = escapeGames.get(input.gameId);
      if (!game) throw new Error('Game not found');
      return {
        score: calculateEscapeScore(game),
        status: game.status,
        puzzlesSolved: game.puzzles.filter(p => p.solved).length,
        totalPuzzles: game.puzzles.length
      };
    }),

  getEscapeGame: protectedProcedure
    .input(z.object({ gameId: z.string() }))
    .query(({ input }) => {
      const game = escapeGames.get(input.gameId);
      if (!game) throw new Error('Game not found');
      // Remove solutions from puzzles before returning
      return {
        ...game,
        puzzles: game.puzzles.map(p => {
          const { solution, ...safePuzzle } = p;
          return safePuzzle;
        })
      };
    }),

  // ============================================================================
  // GAME CENTER OVERVIEW
  // ============================================================================

  getAvailableGames: publicProcedure.query(() => {
    return [
      {
        id: 'fleet-command',
        name: 'Fleet Command',
        category: 'Strategy',
        description: 'Strategic naval battle using coordinates',
        players: '2 player',
        duration: '20-30 min',
        tokens: 10,
        tags: ['coordinates', 'strategy', 'probability'],
        status: 'ready'
      },
      {
        id: 'hearts',
        name: 'Hearts',
        category: 'Card Games',
        description: 'Classic trick-taking card game',
        players: '4 player',
        duration: '30-45 min',
        tokens: 10,
        tags: ['strategy', 'probability', 'memory'],
        status: 'ready'
      },
      {
        id: 'knowledge-quest',
        name: 'Knowledge Quest',
        category: 'Trivia',
        description: 'Trivia game with L.A.W.S. categories',
        players: '1-4 players',
        duration: '15-30 min',
        tokens: 15,
        tags: ['education', 'trivia', 'L.A.W.S.'],
        status: 'ready'
      },
      {
        id: 'escape-room',
        name: 'Advanced Escape Room',
        category: 'Mystery',
        description: 'Complex puzzles with cryptography elements',
        players: '1-4 players',
        duration: '45-60 min',
        tokens: 20,
        tags: ['cryptography', 'problem solving', 'teamwork'],
        status: 'ready'
      }
    ];
  }),

  getActiveGames: protectedProcedure.query(({ ctx }) => {
    const userId = ctx.user.id;
    // Return active games for this user
    const activeFleet = Array.from(fleetGames.values()).filter(g => 
      g.status !== 'finished' && (g.player1.id.includes(userId.toString()) || g.player2.id.includes(userId.toString()))
    );
    const activeHearts = Array.from(heartsGames.values()).filter(g => 
      g.status !== 'finished'
    );
    const activeQuests = Array.from(questGames.values()).filter(g => 
      g.status === 'playing'
    );
    const activeEscapes = Array.from(escapeGames.values()).filter(g => 
      g.status === 'playing'
    );

    return {
      fleetCommand: activeFleet.length,
      hearts: activeHearts.length,
      knowledgeQuest: activeQuests.length,
      escapeRoom: activeEscapes.length,
      total: activeFleet.length + activeHearts.length + activeQuests.length + activeEscapes.length
    };
  })
});

export default gameCenterCompleteRouter;
