import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { TRPCError } from "@trpc/server";

// ELO Rating Constants
const DEFAULT_RATING = 1200;
const K_FACTOR_NEW = 40; // Higher K for new players (< 30 games)
const K_FACTOR_NORMAL = 20; // Normal K factor
const K_FACTOR_MASTER = 10; // Lower K for high-rated players (> 2400)
const RATING_FLOOR = 100;
const RATING_CEILING = 3000;

// Calculate expected score
function expectedScore(ratingA: number, ratingB: number): number {
  return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
}

// Get K factor based on player stats
function getKFactor(rating: number, gamesPlayed: number): number {
  if (gamesPlayed < 30) return K_FACTOR_NEW;
  if (rating > 2400) return K_FACTOR_MASTER;
  return K_FACTOR_NORMAL;
}

// Calculate new rating
function calculateNewRating(
  currentRating: number,
  opponentRating: number,
  actualScore: number, // 1 = win, 0.5 = draw, 0 = loss
  gamesPlayed: number
): number {
  const expected = expectedScore(currentRating, opponentRating);
  const k = getKFactor(currentRating, gamesPlayed);
  const newRating = currentRating + k * (actualScore - expected);
  return Math.max(RATING_FLOOR, Math.min(RATING_CEILING, Math.round(newRating)));
}

// Get rating tier/rank name
function getRatingTier(rating: number): {
  name: string;
  color: string;
  minRating: number;
} {
  if (rating >= 2400) return { name: "Grandmaster", color: "#FFD700", minRating: 2400 };
  if (rating >= 2200) return { name: "Master", color: "#E5E4E2", minRating: 2200 };
  if (rating >= 2000) return { name: "Expert", color: "#CD7F32", minRating: 2000 };
  if (rating >= 1800) return { name: "Class A", color: "#9370DB", minRating: 1800 };
  if (rating >= 1600) return { name: "Class B", color: "#4169E1", minRating: 1600 };
  if (rating >= 1400) return { name: "Class C", color: "#32CD32", minRating: 1400 };
  if (rating >= 1200) return { name: "Class D", color: "#808080", minRating: 1200 };
  return { name: "Beginner", color: "#A0522D", minRating: 0 };
}

export const eloRatingRouter = router({
  // Get player's rating for a specific game
  getPlayerRating: protectedProcedure
    .input(z.object({ gameId: z.string() }))
    .query(async ({ ctx, input }) => {
      const db = getDb();
      
      const [rating] = await db.execute(
        `SELECT * FROM player_elo_ratings WHERE user_id = ? AND game_id = ?`,
        [ctx.user.id, input.gameId]
      );
      
      const ratingData = (rating as any[])[0];
      
      if (!ratingData) {
        // Return default rating for new player
        const tier = getRatingTier(DEFAULT_RATING);
        return {
          rating: DEFAULT_RATING,
          gamesPlayed: 0,
          wins: 0,
          losses: 0,
          draws: 0,
          winStreak: 0,
          bestWinStreak: 0,
          peakRating: DEFAULT_RATING,
          tier,
          ratingChange: 0,
        };
      }
      
      const tier = getRatingTier(ratingData.rating);
      return {
        rating: ratingData.rating,
        gamesPlayed: ratingData.games_played,
        wins: ratingData.wins,
        losses: ratingData.losses,
        draws: ratingData.draws,
        winStreak: ratingData.win_streak,
        bestWinStreak: ratingData.best_win_streak,
        peakRating: ratingData.peak_rating,
        tier,
        ratingChange: ratingData.last_rating_change || 0,
      };
    }),

  // Get all ratings for a player across all games
  getAllPlayerRatings: protectedProcedure.query(async ({ ctx }) => {
    const db = getDb();
    
    const [ratings] = await db.execute(
      `SELECT * FROM player_elo_ratings WHERE user_id = ? ORDER BY rating DESC`,
      [ctx.user.id]
    );
    
    return (ratings as any[]).map((r) => ({
      gameId: r.game_id,
      rating: r.rating,
      gamesPlayed: r.games_played,
      wins: r.wins,
      losses: r.losses,
      draws: r.draws,
      winStreak: r.win_streak,
      bestWinStreak: r.best_win_streak,
      peakRating: r.peak_rating,
      tier: getRatingTier(r.rating),
    }));
  }),

  // Record match result and update ratings
  recordMatchResult: protectedProcedure
    .input(
      z.object({
        gameId: z.string(),
        opponentId: z.number(),
        result: z.enum(["win", "loss", "draw"]),
        matchId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const playerId = ctx.user.id;
      
      // Get or create player rating
      let [playerRatingResult] = await db.execute(
        `SELECT * FROM player_elo_ratings WHERE user_id = ? AND game_id = ?`,
        [playerId, input.gameId]
      );
      
      let playerRating = (playerRatingResult as any[])[0];
      
      if (!playerRating) {
        await db.execute(
          `INSERT INTO player_elo_ratings (user_id, game_id, rating, games_played, wins, losses, draws, win_streak, best_win_streak, peak_rating, created_at, updated_at)
           VALUES (?, ?, ?, 0, 0, 0, 0, 0, 0, ?, NOW(), NOW())`,
          [playerId, input.gameId, DEFAULT_RATING, DEFAULT_RATING]
        );
        playerRating = {
          rating: DEFAULT_RATING,
          games_played: 0,
          wins: 0,
          losses: 0,
          draws: 0,
          win_streak: 0,
          best_win_streak: 0,
          peak_rating: DEFAULT_RATING,
        };
      }
      
      // Get or create opponent rating
      let [opponentRatingResult] = await db.execute(
        `SELECT * FROM player_elo_ratings WHERE user_id = ? AND game_id = ?`,
        [input.opponentId, input.gameId]
      );
      
      let opponentRating = (opponentRatingResult as any[])[0];
      
      if (!opponentRating) {
        await db.execute(
          `INSERT INTO player_elo_ratings (user_id, game_id, rating, games_played, wins, losses, draws, win_streak, best_win_streak, peak_rating, created_at, updated_at)
           VALUES (?, ?, ?, 0, 0, 0, 0, 0, 0, ?, NOW(), NOW())`,
          [input.opponentId, input.gameId, DEFAULT_RATING, DEFAULT_RATING]
        );
        opponentRating = {
          rating: DEFAULT_RATING,
          games_played: 0,
        };
      }
      
      // Calculate score
      const playerScore = input.result === "win" ? 1 : input.result === "draw" ? 0.5 : 0;
      const opponentScore = 1 - playerScore;
      
      // Calculate new ratings
      const newPlayerRating = calculateNewRating(
        playerRating.rating,
        opponentRating.rating,
        playerScore,
        playerRating.games_played
      );
      
      const newOpponentRating = calculateNewRating(
        opponentRating.rating,
        playerRating.rating,
        opponentScore,
        opponentRating.games_played
      );
      
      const playerRatingChange = newPlayerRating - playerRating.rating;
      const opponentRatingChange = newOpponentRating - opponentRating.rating;
      
      // Update player stats
      const newWinStreak = input.result === "win" ? playerRating.win_streak + 1 : 0;
      const newBestWinStreak = Math.max(playerRating.best_win_streak, newWinStreak);
      const newPeakRating = Math.max(playerRating.peak_rating, newPlayerRating);
      
      await db.execute(
        `UPDATE player_elo_ratings SET
          rating = ?,
          games_played = games_played + 1,
          wins = wins + ?,
          losses = losses + ?,
          draws = draws + ?,
          win_streak = ?,
          best_win_streak = ?,
          peak_rating = ?,
          last_rating_change = ?,
          updated_at = NOW()
        WHERE user_id = ? AND game_id = ?`,
        [
          newPlayerRating,
          input.result === "win" ? 1 : 0,
          input.result === "loss" ? 1 : 0,
          input.result === "draw" ? 1 : 0,
          newWinStreak,
          newBestWinStreak,
          newPeakRating,
          playerRatingChange,
          playerId,
          input.gameId,
        ]
      );
      
      // Update opponent stats
      const opponentNewWinStreak = input.result === "loss" ? (opponentRating.win_streak || 0) + 1 : 0;
      
      await db.execute(
        `UPDATE player_elo_ratings SET
          rating = ?,
          games_played = games_played + 1,
          wins = wins + ?,
          losses = losses + ?,
          draws = draws + ?,
          win_streak = ?,
          last_rating_change = ?,
          updated_at = NOW()
        WHERE user_id = ? AND game_id = ?`,
        [
          newOpponentRating,
          input.result === "loss" ? 1 : 0,
          input.result === "win" ? 1 : 0,
          input.result === "draw" ? 1 : 0,
          opponentNewWinStreak,
          opponentRatingChange,
          input.opponentId,
          input.gameId,
        ]
      );
      
      // Record rating history
      await db.execute(
        `INSERT INTO elo_rating_history (user_id, game_id, old_rating, new_rating, rating_change, opponent_id, opponent_rating, result, match_id, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          playerId,
          input.gameId,
          playerRating.rating,
          newPlayerRating,
          playerRatingChange,
          input.opponentId,
          opponentRating.rating,
          input.result,
          input.matchId || null,
        ]
      );
      
      return {
        oldRating: playerRating.rating,
        newRating: newPlayerRating,
        ratingChange: playerRatingChange,
        newTier: getRatingTier(newPlayerRating),
        oldTier: getRatingTier(playerRating.rating),
        tierChanged: getRatingTier(newPlayerRating).name !== getRatingTier(playerRating.rating).name,
      };
    }),

  // Get rating leaderboard for a game
  getLeaderboard: publicProcedure
    .input(
      z.object({
        gameId: z.string(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input }) => {
      const db = getDb();
      
      const [results] = await db.execute(
        `SELECT r.*, u.name as player_name, u.avatar_url
         FROM player_elo_ratings r
         JOIN user u ON r.user_id = u.id
         WHERE r.game_id = ? AND r.games_played >= 5
         ORDER BY r.rating DESC
         LIMIT ? OFFSET ?`,
        [input.gameId, input.limit, input.offset]
      );
      
      const [countResult] = await db.execute(
        `SELECT COUNT(*) as total FROM player_elo_ratings WHERE game_id = ? AND games_played >= 5`,
        [input.gameId]
      );
      
      return {
        players: (results as any[]).map((r, index) => ({
          rank: input.offset + index + 1,
          playerId: r.user_id,
          playerName: r.player_name,
          avatarUrl: r.avatar_url,
          rating: r.rating,
          gamesPlayed: r.games_played,
          wins: r.wins,
          losses: r.losses,
          draws: r.draws,
          winRate: r.games_played > 0 ? Math.round((r.wins / r.games_played) * 100) : 0,
          tier: getRatingTier(r.rating),
        })),
        total: (countResult as any[])[0]?.total || 0,
      };
    }),

  // Get rating history for a player
  getRatingHistory: protectedProcedure
    .input(
      z.object({
        gameId: z.string(),
        limit: z.number().min(1).max(100).default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = getDb();
      
      const [results] = await db.execute(
        `SELECT h.*, u.name as opponent_name
         FROM elo_rating_history h
         LEFT JOIN user u ON h.opponent_id = u.id
         WHERE h.user_id = ? AND h.game_id = ?
         ORDER BY h.created_at DESC
         LIMIT ?`,
        [ctx.user.id, input.gameId, input.limit]
      );
      
      return (results as any[]).map((h) => ({
        id: h.id,
        oldRating: h.old_rating,
        newRating: h.new_rating,
        ratingChange: h.rating_change,
        opponentName: h.opponent_name,
        opponentRating: h.opponent_rating,
        result: h.result,
        matchId: h.match_id,
        createdAt: h.created_at,
      }));
    }),

  // Find opponents with similar rating (for matchmaking)
  findMatchedOpponents: protectedProcedure
    .input(
      z.object({
        gameId: z.string(),
        ratingRange: z.number().min(50).max(500).default(200),
        limit: z.number().min(1).max(20).default(10),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = getDb();
      
      // Get player's rating
      const [playerRatingResult] = await db.execute(
        `SELECT rating FROM player_elo_ratings WHERE user_id = ? AND game_id = ?`,
        [ctx.user.id, input.gameId]
      );
      
      const playerRating = (playerRatingResult as any[])[0]?.rating || DEFAULT_RATING;
      
      // Find opponents within rating range
      const [results] = await db.execute(
        `SELECT r.*, u.name as player_name, u.avatar_url
         FROM player_elo_ratings r
         JOIN user u ON r.user_id = u.id
         WHERE r.game_id = ?
           AND r.user_id != ?
           AND r.rating BETWEEN ? AND ?
         ORDER BY ABS(r.rating - ?) ASC
         LIMIT ?`,
        [
          input.gameId,
          ctx.user.id,
          playerRating - input.ratingRange,
          playerRating + input.ratingRange,
          playerRating,
          input.limit,
        ]
      );
      
      return (results as any[]).map((r) => ({
        playerId: r.user_id,
        playerName: r.player_name,
        avatarUrl: r.avatar_url,
        rating: r.rating,
        ratingDiff: r.rating - playerRating,
        gamesPlayed: r.games_played,
        winRate: r.games_played > 0 ? Math.round((r.wins / r.games_played) * 100) : 0,
        tier: getRatingTier(r.rating),
        expectedWinChance: Math.round(expectedScore(playerRating, r.rating) * 100),
      }));
    }),

  // Get rating tiers info
  getRatingTiers: publicProcedure.query(() => {
    return [
      { name: "Grandmaster", color: "#FFD700", minRating: 2400, description: "Elite players" },
      { name: "Master", color: "#E5E4E2", minRating: 2200, description: "Expert level" },
      { name: "Expert", color: "#CD7F32", minRating: 2000, description: "Advanced players" },
      { name: "Class A", color: "#9370DB", minRating: 1800, description: "Strong players" },
      { name: "Class B", color: "#4169E1", minRating: 1600, description: "Intermediate" },
      { name: "Class C", color: "#32CD32", minRating: 1400, description: "Developing" },
      { name: "Class D", color: "#808080", minRating: 1200, description: "Novice" },
      { name: "Beginner", color: "#A0522D", minRating: 0, description: "New players" },
    ];
  }),
});

export default eloRatingRouter;
