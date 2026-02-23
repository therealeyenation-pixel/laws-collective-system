import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { eq, and, desc, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { gameCenterGames } from "../../drizzle/schema";

// Helper to ensure db is not null
const ensureDb = async () => {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
  return db;
};

export const gameSavesRouter = router({
  // Save game state
  saveGame: protectedProcedure
    .input(z.object({
      gameId: z.number(),
      matchId: z.number().optional(),
      saveName: z.string().optional(),
      saveType: z.enum(["manual", "auto", "checkpoint"]).default("auto"),
      gameState: z.any(),
      score: z.number().default(0),
      progress: z.number().default(0),
      playTime: z.number().default(0),
      difficulty: z.enum(["easy", "medium", "hard"]).default("medium"),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await ensureDb();
      
      // For auto-saves, check if there's an existing one to update
      if (input.saveType === "auto") {
        const [existing] = await db.execute(sql`
          SELECT id FROM game_save_states 
          WHERE playerId = ${ctx.user.id} AND gameId = ${input.gameId} 
            AND saveType = 'auto' AND isActive = TRUE
          ORDER BY savedAt DESC
          LIMIT 1
        `) as any;
        
        if (existing && (existing as any)[0]?.length > 0) {
          const saveId = (existing as any)[0][0].id;
          await db.execute(sql`
            UPDATE game_save_states 
            SET gameState = ${JSON.stringify(input.gameState)},
                score = ${input.score},
                progress = ${input.progress},
                playTime = ${input.playTime},
                savedAt = NOW(),
                expiresAt = DATE_ADD(NOW(), INTERVAL 30 DAY)
            WHERE id = ${saveId}
          `);
          return { success: true, saveId, updated: true };
        }
      }
      
      // Create new save
      const saveName = input.saveName || 
        (input.saveType === "auto" ? "Auto Save" : 
         input.saveType === "checkpoint" ? `Checkpoint - ${input.progress}%` : 
         `Save ${new Date().toLocaleDateString()}`);
      
      const [result] = await db.execute(sql`
        INSERT INTO game_save_states 
        (playerId, gameId, matchId, saveName, saveType, gameState, score, progress, playTime, difficulty, expiresAt)
        VALUES (${ctx.user.id}, ${input.gameId}, ${input.matchId || null}, ${saveName}, 
                ${input.saveType}, ${JSON.stringify(input.gameState)}, ${input.score}, 
                ${input.progress}, ${input.playTime}, ${input.difficulty},
                DATE_ADD(NOW(), INTERVAL 30 DAY))
      `) as any;
      
      return { success: true, saveId: result.insertId, updated: false };
    }),

  // Load game state
  loadGame: protectedProcedure
    .input(z.object({ saveId: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = await ensureDb();
      
      const [save] = await db.execute(sql`
        SELECT gss.*, gcg.name as gameName, gcg.slug as gameSlug
        FROM game_save_states gss
        LEFT JOIN game_center_games gcg ON gss.gameId = gcg.id
        WHERE gss.id = ${input.saveId} AND gss.playerId = ${ctx.user.id} AND gss.isActive = TRUE
      `) as any;
      
      if (!save || !(save as any)[0]?.length) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Save not found" });
      }
      
      const saveData = (save as any)[0][0];
      
      return {
        ...saveData,
        gameState: typeof saveData.gameState === "string" 
          ? JSON.parse(saveData.gameState) 
          : saveData.gameState,
      };
    }),

  // Get all saves for a game
  getSaves: protectedProcedure
    .input(z.object({ 
      gameId: z.number().optional(),
      saveType: z.enum(["manual", "auto", "checkpoint"]).optional(),
    }).optional())
    .query(async ({ input, ctx }) => {
      const db = await ensureDb();
      
      let query = sql`
        SELECT gss.id, gss.gameId, gss.saveName, gss.saveType, gss.score, 
               gss.progress, gss.playTime, gss.difficulty, gss.savedAt,
               gcg.name as gameName, gcg.slug as gameSlug, gcg.icon as gameIcon
        FROM game_save_states gss
        LEFT JOIN game_center_games gcg ON gss.gameId = gcg.id
        WHERE gss.playerId = ${ctx.user.id} AND gss.isActive = TRUE
      `;
      
      if (input?.gameId) {
        query = sql`${query} AND gss.gameId = ${input.gameId}`;
      }
      if (input?.saveType) {
        query = sql`${query} AND gss.saveType = ${input.saveType}`;
      }
      
      query = sql`${query} ORDER BY gss.savedAt DESC`;
      
      const saves = await db.execute(query);
      
      return (saves as any)[0] || [];
    }),

  // Get most recent save for a game (for "Continue" button)
  getLatestSave: protectedProcedure
    .input(z.object({ gameId: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = await ensureDb();
      
      const [save] = await db.execute(sql`
        SELECT gss.*, gcg.name as gameName, gcg.slug as gameSlug
        FROM game_save_states gss
        LEFT JOIN game_center_games gcg ON gss.gameId = gcg.id
        WHERE gss.playerId = ${ctx.user.id} AND gss.gameId = ${input.gameId} AND gss.isActive = TRUE
        ORDER BY gss.savedAt DESC
        LIMIT 1
      `) as any;
      
      if (!save || !(save as any)[0]?.length) {
        return null;
      }
      
      const saveData = (save as any)[0][0];
      
      return {
        ...saveData,
        gameState: typeof saveData.gameState === "string" 
          ? JSON.parse(saveData.gameState) 
          : saveData.gameState,
      };
    }),

  // Delete a save
  deleteSave: protectedProcedure
    .input(z.object({ saveId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await ensureDb();
      
      // Soft delete - mark as inactive
      await db.execute(sql`
        UPDATE game_save_states 
        SET isActive = FALSE
        WHERE id = ${input.saveId} AND playerId = ${ctx.user.id}
      `);
      
      return { success: true };
    }),

  // Delete all saves for a game
  deleteAllSaves: protectedProcedure
    .input(z.object({ gameId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await ensureDb();
      
      await db.execute(sql`
        UPDATE game_save_states 
        SET isActive = FALSE
        WHERE gameId = ${input.gameId} AND playerId = ${ctx.user.id}
      `);
      
      return { success: true };
    }),

  // Rename a save
  renameSave: protectedProcedure
    .input(z.object({ 
      saveId: z.number(),
      newName: z.string().min(1).max(100),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await ensureDb();
      
      await db.execute(sql`
        UPDATE game_save_states 
        SET saveName = ${input.newName}
        WHERE id = ${input.saveId} AND playerId = ${ctx.user.id}
      `);
      
      return { success: true };
    }),

  // Get save statistics
  getSaveStats: protectedProcedure
    .query(async ({ ctx }) => {
      const db = await ensureDb();
      
      const [stats] = await db.execute(sql`
        SELECT 
          COUNT(*) as totalSaves,
          SUM(CASE WHEN saveType = 'manual' THEN 1 ELSE 0 END) as manualSaves,
          SUM(CASE WHEN saveType = 'auto' THEN 1 ELSE 0 END) as autoSaves,
          SUM(CASE WHEN saveType = 'checkpoint' THEN 1 ELSE 0 END) as checkpointSaves,
          SUM(playTime) as totalPlayTime,
          MAX(progress) as highestProgress,
          COUNT(DISTINCT gameId) as gamesWithSaves
        FROM game_save_states 
        WHERE playerId = ${ctx.user.id} AND isActive = TRUE
      `) as any;
      
      return (stats as any)[0]?.[0] || {
        totalSaves: 0,
        manualSaves: 0,
        autoSaves: 0,
        checkpointSaves: 0,
        totalPlayTime: 0,
        highestProgress: 0,
        gamesWithSaves: 0,
      };
    }),

  // Clean up expired saves (admin/cron job)
  cleanupExpiredSaves: protectedProcedure
    .mutation(async ({ ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Admin only" });
      }
      
      const db = await ensureDb();
      
      const [result] = await db.execute(sql`
        UPDATE game_save_states 
        SET isActive = FALSE
        WHERE expiresAt IS NOT NULL AND expiresAt < NOW() AND isActive = TRUE
      `) as any;
      
      return { success: true, cleaned: result.affectedRows || 0 };
    }),
});
