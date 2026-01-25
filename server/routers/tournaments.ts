import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { eq, and, desc, asc, sql, or, gte, lte } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import {
  gameTournaments,
  gameCenterGames,
  gamePlayerStats,
  users,
} from "../../drizzle/schema";

// Helper to ensure db is not null
const ensureDb = async () => {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
  return db;
};

// Types for bracket generation
interface BracketMatch {
  matchNumber: number;
  roundNumber: number;
  bracketPosition: string;
  player1Id: number | null;
  player2Id: number | null;
  winnerId: number | null;
  status: "pending" | "ready" | "in_progress" | "completed" | "bye";
}

interface TournamentBracket {
  type: string;
  rounds: number;
  matches: BracketMatch[];
}

// Generate single elimination bracket
function generateSingleEliminationBracket(participantIds: number[]): TournamentBracket {
  const numParticipants = participantIds.length;
  const rounds = Math.ceil(Math.log2(numParticipants));
  const bracketSize = Math.pow(2, rounds);
  const byes = bracketSize - numParticipants;
  
  const matches: BracketMatch[] = [];
  let matchNumber = 1;
  
  // Seed participants (higher seeds get byes)
  const seededParticipants = [...participantIds];
  for (let i = 0; i < byes; i++) {
    seededParticipants.push(-1); // -1 represents a bye
  }
  
  // Generate first round matches
  const firstRoundMatches = bracketSize / 2;
  for (let i = 0; i < firstRoundMatches; i++) {
    const player1 = seededParticipants[i];
    const player2 = seededParticipants[bracketSize - 1 - i];
    
    const isBye = player1 === -1 || player2 === -1;
    const winner = isBye ? (player1 === -1 ? player2 : player1) : null;
    
    matches.push({
      matchNumber: matchNumber++,
      roundNumber: 1,
      bracketPosition: `R1M${i + 1}`,
      player1Id: player1 === -1 ? null : player1,
      player2Id: player2 === -1 ? null : player2,
      winnerId: winner === -1 ? null : winner,
      status: isBye ? "bye" : "ready",
    });
  }
  
  // Generate subsequent rounds (empty until winners advance)
  let matchesInRound = firstRoundMatches / 2;
  for (let round = 2; round <= rounds; round++) {
    for (let i = 0; i < matchesInRound; i++) {
      matches.push({
        matchNumber: matchNumber++,
        roundNumber: round,
        bracketPosition: round === rounds ? "F" : `R${round}M${i + 1}`,
        player1Id: null,
        player2Id: null,
        winnerId: null,
        status: "pending",
      });
    }
    matchesInRound = matchesInRound / 2;
  }
  
  return {
    type: "single_elimination",
    rounds,
    matches,
  };
}

// Calculate ELO rating change
function calculateEloChange(winnerRating: number, loserRating: number, kFactor: number = 32): { winnerChange: number; loserChange: number } {
  const expectedWinner = 1 / (1 + Math.pow(10, (loserRating - winnerRating) / 400));
  const expectedLoser = 1 - expectedWinner;
  
  const winnerChange = Math.round(kFactor * (1 - expectedWinner));
  const loserChange = Math.round(kFactor * (0 - expectedLoser));
  
  return { winnerChange, loserChange };
}

export const tournamentsRouter = router({
  // Get all tournaments with optional filters
  getTournaments: publicProcedure
    .input(z.object({
      status: z.enum(["registration", "in_progress", "completed", "cancelled"]).optional(),
      gameId: z.number().optional(),
      ageGroup: z.enum(["k_5", "6_8", "9_12", "adult", "all_ages", "family"]).optional(),
    }).optional())
    .query(async ({ input }) => {
      const db = await ensureDb();
      
      let query = db.select({
        tournament: gameTournaments,
        game: gameCenterGames,
      })
        .from(gameTournaments)
        .leftJoin(gameCenterGames, eq(gameTournaments.gameId, gameCenterGames.id));
      
      const conditions = [];
      if (input?.status) {
        conditions.push(eq(gameTournaments.status, input.status));
      }
      if (input?.gameId) {
        conditions.push(eq(gameTournaments.gameId, input.gameId));
      }
      if (input?.ageGroup) {
        conditions.push(eq(gameTournaments.ageGroup, input.ageGroup));
      }
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions)) as any;
      }
      
      const results = await query.orderBy(desc(gameTournaments.startDate));
      
      return results.map(r => ({
        ...r.tournament,
        game: r.game,
      }));
    }),

  // Get single tournament with full details
  getTournament: publicProcedure
    .input(z.object({ tournamentId: z.number() }))
    .query(async ({ input }) => {
      const db = await ensureDb();
      
      const [tournament] = await db.select({
        tournament: gameTournaments,
        game: gameCenterGames,
      })
        .from(gameTournaments)
        .leftJoin(gameCenterGames, eq(gameTournaments.gameId, gameCenterGames.id))
        .where(eq(gameTournaments.id, input.tournamentId));
      
      if (!tournament) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Tournament not found" });
      }
      
      // Get participants
      const participants = await db.execute(sql`
        SELECT tp.*, u.name as playerName, u.avatar as playerAvatar,
               gps.rating as playerRating
        FROM tournament_participants tp
        LEFT JOIN user u ON tp.playerId = u.id
        LEFT JOIN game_player_stats gps ON tp.playerId = gps.playerId 
          AND gps.gameId = ${tournament.tournament.gameId}
        WHERE tp.tournamentId = ${input.tournamentId}
        ORDER BY tp.seed ASC, tp.registeredAt ASC
      `);
      
      // Get matches
      const matches = await db.execute(sql`
        SELECT tm.*,
               p1.name as player1Name, p2.name as player2Name,
               w.name as winnerName
        FROM tournament_matches tm
        LEFT JOIN user p1 ON tm.player1Id = p1.id
        LEFT JOIN user p2 ON tm.player2Id = p2.id
        LEFT JOIN user w ON tm.winnerId = w.id
        WHERE tm.tournamentId = ${input.tournamentId}
        ORDER BY tm.roundNumber ASC, tm.matchNumber ASC
      `);
      
      return {
        ...tournament.tournament,
        game: tournament.game,
        participants: (participants as any)[0] || [],
        matches: (matches as any)[0] || [],
      };
    }),

  // Register for a tournament
  registerForTournament: protectedProcedure
    .input(z.object({ tournamentId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await ensureDb();
      
      // Check tournament exists and is open for registration
      const [tournament] = await db.select().from(gameTournaments)
        .where(eq(gameTournaments.id, input.tournamentId));
      
      if (!tournament) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Tournament not found" });
      }
      
      if (tournament.status !== "registration") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Tournament is not open for registration" });
      }
      
      if (tournament.currentParticipants >= (tournament.maxParticipants || 16)) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Tournament is full" });
      }
      
      // Check if already registered
      const [existing] = await db.execute(sql`
        SELECT id FROM tournament_participants 
        WHERE tournamentId = ${input.tournamentId} AND playerId = ${ctx.user.id}
      `) as any;
      
      if (existing && existing[0]?.length > 0) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Already registered for this tournament" });
      }
      
      // Get player rating for seeding
      const [playerStats] = await db.select().from(gamePlayerStats)
        .where(and(
          eq(gamePlayerStats.playerId, ctx.user.id),
          eq(gamePlayerStats.gameId, tournament.gameId)
        ));
      
      const rating = playerStats?.rating || 1000;
      
      // Deduct entry fee if applicable
      if (tournament.entryFee > 0) {
        // TODO: Integrate with token economy
      }
      
      // Register participant
      await db.execute(sql`
        INSERT INTO tournament_participants (tournamentId, playerId, seed)
        VALUES (${input.tournamentId}, ${ctx.user.id}, ${rating})
      `);
      
      // Update participant count
      await db.update(gameTournaments)
        .set({ currentParticipants: tournament.currentParticipants + 1 })
        .where(eq(gameTournaments.id, input.tournamentId));
      
      return { success: true, message: "Successfully registered for tournament" };
    }),

  // Withdraw from tournament
  withdrawFromTournament: protectedProcedure
    .input(z.object({ tournamentId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await ensureDb();
      
      const [tournament] = await db.select().from(gameTournaments)
        .where(eq(gameTournaments.id, input.tournamentId));
      
      if (!tournament) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Tournament not found" });
      }
      
      if (tournament.status !== "registration") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Cannot withdraw after tournament has started" });
      }
      
      await db.execute(sql`
        DELETE FROM tournament_participants 
        WHERE tournamentId = ${input.tournamentId} AND playerId = ${ctx.user.id}
      `);
      
      await db.update(gameTournaments)
        .set({ currentParticipants: Math.max(0, tournament.currentParticipants - 1) })
        .where(eq(gameTournaments.id, input.tournamentId));
      
      return { success: true };
    }),

  // Start tournament (admin only)
  startTournament: protectedProcedure
    .input(z.object({ tournamentId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await ensureDb();
      
      // Check admin
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Admin only" });
      }
      
      const [tournament] = await db.select().from(gameTournaments)
        .where(eq(gameTournaments.id, input.tournamentId));
      
      if (!tournament) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Tournament not found" });
      }
      
      if (tournament.status !== "registration") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Tournament already started or completed" });
      }
      
      // Get participants sorted by seed (rating)
      const participants = await db.execute(sql`
        SELECT playerId FROM tournament_participants 
        WHERE tournamentId = ${input.tournamentId}
        ORDER BY seed DESC
      `) as any;
      
      const participantIds = ((participants as any)[0] || []).map((p: any) => p.playerId);
      
      if (participantIds.length < 2) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Need at least 2 participants" });
      }
      
      // Generate bracket
      const bracket = generateSingleEliminationBracket(participantIds);
      
      // Insert matches
      for (const match of bracket.matches) {
        await db.execute(sql`
          INSERT INTO tournament_matches 
          (tournamentId, roundNumber, matchNumber, bracketPosition, player1Id, player2Id, winnerId, status)
          VALUES (${input.tournamentId}, ${match.roundNumber}, ${match.matchNumber}, 
                  ${match.bracketPosition}, ${match.player1Id}, ${match.player2Id}, 
                  ${match.winnerId}, ${match.status})
        `);
      }
      
      // Update tournament status
      await db.update(gameTournaments)
        .set({ 
          status: "in_progress",
          bracketData: bracket,
          startDate: new Date(),
        })
        .where(eq(gameTournaments.id, input.tournamentId));
      
      // Update participant statuses for bye winners
      for (const match of bracket.matches) {
        if (match.status === "bye" && match.winnerId) {
          await db.execute(sql`
            UPDATE tournament_participants 
            SET currentRound = 2, wins = wins + 1
            WHERE tournamentId = ${input.tournamentId} AND playerId = ${match.winnerId}
          `);
        }
      }
      
      return { success: true, bracket };
    }),

  // Report match result
  reportMatchResult: protectedProcedure
    .input(z.object({
      matchId: z.number(),
      winnerId: z.number(),
      player1Score: z.number().default(0),
      player2Score: z.number().default(0),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await ensureDb();
      
      // Get match
      const [match] = await db.execute(sql`
        SELECT * FROM tournament_matches WHERE id = ${input.matchId}
      `) as any;
      
      const matchData = (match as any)[0]?.[0];
      if (!matchData) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Match not found" });
      }
      
      // Verify user is participant or admin
      const isParticipant = matchData.player1Id === ctx.user.id || matchData.player2Id === ctx.user.id;
      if (!isParticipant && ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized" });
      }
      
      // Update match
      await db.execute(sql`
        UPDATE tournament_matches 
        SET winnerId = ${input.winnerId}, 
            player1Score = ${input.player1Score},
            player2Score = ${input.player2Score},
            status = 'completed',
            completedAt = NOW()
        WHERE id = ${input.matchId}
      `);
      
      // Update participant stats
      const loserId = matchData.player1Id === input.winnerId ? matchData.player2Id : matchData.player1Id;
      
      await db.execute(sql`
        UPDATE tournament_participants 
        SET wins = wins + 1, currentRound = currentRound + 1
        WHERE tournamentId = ${matchData.tournamentId} AND playerId = ${input.winnerId}
      `);
      
      await db.execute(sql`
        UPDATE tournament_participants 
        SET losses = losses + 1, status = 'eliminated', eliminatedAt = NOW()
        WHERE tournamentId = ${matchData.tournamentId} AND playerId = ${loserId}
      `);
      
      // Advance winner to next match
      const nextRound = matchData.roundNumber + 1;
      const nextMatchNumber = Math.ceil(matchData.matchNumber / 2);
      const isPlayer1 = matchData.matchNumber % 2 === 1;
      
      const [nextMatch] = await db.execute(sql`
        SELECT id FROM tournament_matches 
        WHERE tournamentId = ${matchData.tournamentId} 
          AND roundNumber = ${nextRound} 
          AND matchNumber = ${nextMatchNumber}
      `) as any;
      
      if (nextMatch && (nextMatch as any)[0]?.length > 0) {
        const nextMatchId = (nextMatch as any)[0][0].id;
        if (isPlayer1) {
          await db.execute(sql`
            UPDATE tournament_matches SET player1Id = ${input.winnerId} WHERE id = ${nextMatchId}
          `);
        } else {
          await db.execute(sql`
            UPDATE tournament_matches SET player2Id = ${input.winnerId} WHERE id = ${nextMatchId}
          `);
        }
        
        // Check if next match is ready
        const [updatedNext] = await db.execute(sql`
          SELECT player1Id, player2Id FROM tournament_matches WHERE id = ${nextMatchId}
        `) as any;
        
        if (updatedNext && (updatedNext as any)[0]?.[0]?.player1Id && (updatedNext as any)[0]?.[0]?.player2Id) {
          await db.execute(sql`
            UPDATE tournament_matches SET status = 'ready' WHERE id = ${nextMatchId}
          `);
        }
      } else {
        // This was the final match
        await db.execute(sql`
          UPDATE tournament_participants 
          SET status = 'winner', finalPlacement = 1
          WHERE tournamentId = ${matchData.tournamentId} AND playerId = ${input.winnerId}
        `);
        
        await db.execute(sql`
          UPDATE tournament_participants 
          SET finalPlacement = 2
          WHERE tournamentId = ${matchData.tournamentId} AND playerId = ${loserId}
        `);
        
        await db.update(gameTournaments)
          .set({ status: "completed", endDate: new Date() })
          .where(eq(gameTournaments.id, matchData.tournamentId));
      }
      
      return { success: true };
    }),

  // Matchmaking - Join queue
  joinMatchmakingQueue: protectedProcedure
    .input(z.object({
      gameId: z.number(),
      matchType: z.enum(["casual", "ranked"]).default("casual"),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await ensureDb();
      
      // Get player rating
      const [playerStats] = await db.select().from(gamePlayerStats)
        .where(and(
          eq(gamePlayerStats.playerId, ctx.user.id),
          eq(gamePlayerStats.gameId, input.gameId)
        ));
      
      const rating = playerStats?.rating || 1000;
      const ratingRange = input.matchType === "ranked" ? 150 : 500;
      
      // Check if already in queue
      const [existing] = await db.execute(sql`
        SELECT id FROM matchmaking_queue 
        WHERE playerId = ${ctx.user.id} AND gameId = ${input.gameId} AND status = 'waiting'
      `) as any;
      
      if (existing && (existing as any)[0]?.length > 0) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Already in queue" });
      }
      
      // Try to find a match
      const [potentialMatch] = await db.execute(sql`
        SELECT * FROM matchmaking_queue 
        WHERE gameId = ${input.gameId} 
          AND matchType = ${input.matchType}
          AND status = 'waiting'
          AND playerId != ${ctx.user.id}
          AND ABS(playerRating - ${rating}) <= ${ratingRange}
        ORDER BY queuedAt ASC
        LIMIT 1
      `) as any;
      
      if (potentialMatch && (potentialMatch as any)[0]?.length > 0) {
        const opponent = (potentialMatch as any)[0][0];
        
        // Create match
        await db.execute(sql`
          INSERT INTO game_matches (gameId, matchType, player1Id, player2Id, status)
          VALUES (${input.gameId}, 'vs_player', ${opponent.playerId}, ${ctx.user.id}, 'waiting')
        `);
        
        // Update queue entries
        await db.execute(sql`
          UPDATE matchmaking_queue 
          SET status = 'matched', matchedWithId = ${ctx.user.id}, matchedAt = NOW()
          WHERE id = ${opponent.id}
        `);
        
        return { 
          matched: true, 
          opponentId: opponent.playerId,
          message: "Match found!" 
        };
      }
      
      // No match found, add to queue
      await db.execute(sql`
        INSERT INTO matchmaking_queue (playerId, gameId, matchType, playerRating, ratingRange, expiresAt)
        VALUES (${ctx.user.id}, ${input.gameId}, ${input.matchType}, ${rating}, ${ratingRange}, 
                DATE_ADD(NOW(), INTERVAL 5 MINUTE))
      `);
      
      return { matched: false, message: "Added to queue, waiting for opponent..." };
    }),

  // Leave matchmaking queue
  leaveMatchmakingQueue: protectedProcedure
    .input(z.object({ gameId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await ensureDb();
      
      await db.execute(sql`
        UPDATE matchmaking_queue 
        SET status = 'cancelled'
        WHERE playerId = ${ctx.user.id} AND gameId = ${input.gameId} AND status = 'waiting'
      `);
      
      return { success: true };
    }),

  // Check queue status
  getQueueStatus: protectedProcedure
    .input(z.object({ gameId: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = await ensureDb();
      
      const [queueEntry] = await db.execute(sql`
        SELECT * FROM matchmaking_queue 
        WHERE playerId = ${ctx.user.id} AND gameId = ${input.gameId} AND status = 'waiting'
        ORDER BY queuedAt DESC
        LIMIT 1
      `) as any;
      
      if (!queueEntry || !(queueEntry as any)[0]?.length) {
        return { inQueue: false };
      }
      
      const entry = (queueEntry as any)[0][0];
      
      // Check if matched
      if (entry.matchedWithId) {
        return { 
          inQueue: false, 
          matched: true, 
          opponentId: entry.matchedWithId 
        };
      }
      
      // Get queue position
      const [position] = await db.execute(sql`
        SELECT COUNT(*) as pos FROM matchmaking_queue 
        WHERE gameId = ${input.gameId} AND status = 'waiting' AND queuedAt < ${entry.queuedAt}
      `) as any;
      
      return {
        inQueue: true,
        position: ((position as any)[0]?.[0]?.pos || 0) + 1,
        queuedAt: entry.queuedAt,
      };
    }),

  // Spectator - Join as spectator
  joinAsSpectator: protectedProcedure
    .input(z.object({
      matchId: z.number(),
      matchType: z.enum(["game", "tournament"]),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await ensureDb();
      
      // Check if already spectating
      const [existing] = await db.execute(sql`
        SELECT id FROM spectator_sessions 
        WHERE matchId = ${input.matchId} AND matchType = ${input.matchType} 
          AND spectatorId = ${ctx.user.id} AND isActive = TRUE
      `) as any;
      
      if (existing && (existing as any)[0]?.length > 0) {
        return { success: true, message: "Already spectating" };
      }
      
      await db.execute(sql`
        INSERT INTO spectator_sessions (matchId, matchType, spectatorId)
        VALUES (${input.matchId}, ${input.matchType}, ${ctx.user.id})
      `);
      
      // Update spectator count
      if (input.matchType === "tournament") {
        await db.execute(sql`
          UPDATE tournament_matches SET spectatorCount = spectatorCount + 1 WHERE id = ${input.matchId}
        `);
      }
      
      return { success: true };
    }),

  // Leave spectating
  leaveSpectating: protectedProcedure
    .input(z.object({
      matchId: z.number(),
      matchType: z.enum(["game", "tournament"]),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await ensureDb();
      
      await db.execute(sql`
        UPDATE spectator_sessions 
        SET isActive = FALSE, leftAt = NOW()
        WHERE matchId = ${input.matchId} AND matchType = ${input.matchType} 
          AND spectatorId = ${ctx.user.id} AND isActive = TRUE
      `);
      
      if (input.matchType === "tournament") {
        await db.execute(sql`
          UPDATE tournament_matches SET spectatorCount = GREATEST(0, spectatorCount - 1) WHERE id = ${input.matchId}
        `);
      }
      
      return { success: true };
    }),

  // Get active spectators for a match
  getSpectators: publicProcedure
    .input(z.object({
      matchId: z.number(),
      matchType: z.enum(["game", "tournament"]),
    }))
    .query(async ({ input }) => {
      const db = await ensureDb();
      
      const spectators = await db.execute(sql`
        SELECT ss.*, u.name as spectatorName, u.avatar as spectatorAvatar
        FROM spectator_sessions ss
        LEFT JOIN user u ON ss.spectatorId = u.id
        WHERE ss.matchId = ${input.matchId} AND ss.matchType = ${input.matchType} AND ss.isActive = TRUE
        ORDER BY ss.joinedAt DESC
      `);
      
      return (spectators as any)[0] || [];
    }),

  // Get live matches (for spectator lobby)
  getLiveMatches: publicProcedure
    .input(z.object({ gameId: z.number().optional() }).optional())
    .query(async ({ input }) => {
      const db = await ensureDb();
      
      // Get tournament matches in progress
      let tournamentQuery = sql`
        SELECT tm.*, gt.name as tournamentName, gcg.name as gameName,
               p1.name as player1Name, p2.name as player2Name
        FROM tournament_matches tm
        JOIN game_tournaments gt ON tm.tournamentId = gt.id
        JOIN game_center_games gcg ON gt.gameId = gcg.id
        LEFT JOIN user p1 ON tm.player1Id = p1.id
        LEFT JOIN user p2 ON tm.player2Id = p2.id
        WHERE tm.status = 'in_progress'
      `;
      
      if (input?.gameId) {
        tournamentQuery = sql`${tournamentQuery} AND gt.gameId = ${input.gameId}`;
      }
      
      const tournamentMatches = await db.execute(tournamentQuery);
      
      return {
        tournamentMatches: (tournamentMatches as any)[0] || [],
      };
    }),
});
