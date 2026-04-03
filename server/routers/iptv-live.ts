/**
 * IPTV Live Router
 * Reads from seeded iptv_channels and vod_movies tables
 * Public access for all members
 */

import { publicProcedure, router } from '../_core/trpc';
import { z } from 'zod';
import mysql from 'mysql2/promise';

async function getConnection() {
  try {
    return await mysql.createConnection(process.env.DATABASE_URL || '');
  } catch (err) {
    console.error('Database connection failed:', err);
    return null;
  }
}

export const iptvLiveRouter = router({
  /**
   * Get all live IPTV channels
   */
  getChannels: publicProcedure
    .input(
      z.object({
        category: z.string().optional(),
        limit: z.number().default(50),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input }) => {
      const conn = await getConnection();
      if (!conn) {
        console.error('No database connection');
        return [];
      }

      try {
        const query = `SELECT * FROM iptv_channels LIMIT ${input.limit} OFFSET ${input.offset}`;
        const [rows] = await conn.execute(query);
        await conn.end();

        return (rows as any[]).map(row => ({
          id: row.id,
          name: row.name,
          category: row.category,
          description: row.description,
          streamUrl: row.streamUrl,
          logo: row.logo,
          logoUrl: row.logo,
          bannerUrl: row.logo,
          contentRating: row.contentRating,
          isAdultContent: row.isAdultContent,
          accessLevel: row.accessLevel,
          isActive: row.isActive,
          isLive: true,
          currentViewers: Math.floor(Math.random() * 5000),
          totalViewers: Math.floor(Math.random() * 50000),
        }));
      } catch (err) {
        console.error('Query error:', err);
        try {
          await conn.end();
        } catch (e) {}
        return [];
      }
    }),

  /**
   * Get channel details
   */
  getChannelDetails: publicProcedure
    .input(z.object({ channelId: z.number() }))
    .query(async ({ input }) => {
      const conn = await getConnection();
      if (!conn) return { channel: null, activeStream: null };

      try {
        const [rows] = await conn.execute(`SELECT * FROM iptv_channels WHERE id = ${input.channelId}`);

        const channel = (rows as any[])[0];
        await conn.end();

        return {
          channel: channel
            ? {
                id: channel.id,
                name: channel.name,
                description: channel.description,
                streamUrl: channel.streamUrl,
                logo: channel.logo,
                logoUrl: channel.logo,
                bannerUrl: channel.logo,
                currentViewers: Math.floor(Math.random() * 5000),
                totalViewers: Math.floor(Math.random() * 50000),
              }
            : null,
          activeStream: {
            url: channel?.streamUrl,
            isActive: true,
          },
        };
      } catch (err) {
        console.error('Query error:', err);
        try {
          await conn.end();
        } catch (e) {}
        return { channel: null, activeStream: null };
      }
    }),

  /**
   * Get VOD movies
   */
  getVODMovies: publicProcedure
    .input(
      z.object({
        genre: z.string().optional(),
        limit: z.number().default(20),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input }) => {
      const conn = await getConnection();
      if (!conn) return [];

      try {
        const query = `SELECT * FROM vod_movies LIMIT ${input.limit} OFFSET ${input.offset}`;
        const [rows] = await conn.execute(query);
        await conn.end();

        return (rows as any[]).map(row => ({
          id: row.id,
          title: row.title,
          genre: row.genre,
          director: row.director,
          duration: row.duration,
          releaseYear: row.releaseYear,
          imdbRating: row.imdbRating,
          contentRating: row.contentRating,
          posterUrl: row.posterUrl,
          description: row.description,
        }));
      } catch (err) {
        console.error('Query error:', err);
        try {
          await conn.end();
        } catch (e) {}
        return [];
      }
    }),

  /**
   * Get VOD series
   */
  getVODSeries: publicProcedure
    .input(
      z.object({
        genre: z.string().optional(),
        limit: z.number().default(20),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input }) => {
      const conn = await getConnection();
      if (!conn) return [];

      try {
        const query = `SELECT * FROM vod_series LIMIT ${input.limit} OFFSET ${input.offset}`;
        const [rows] = await conn.execute(query);
        await conn.end();

        return (rows as any[]).map(row => ({
          id: row.id,
          title: row.title,
          genre: row.genre,
          creator: row.creator,
          totalSeasons: row.totalSeasons,
          totalEpisodes: row.totalEpisodes,
          imdbRating: row.imdbRating,
          contentRating: row.contentRating,
          posterUrl: row.posterUrl,
          description: row.description,
        }));
      } catch (err) {
        console.error('Query error:', err);
        try {
          await conn.end();
        } catch (e) {}
        return [];
      }
    }),

  /**
   * Get channel categories
   */
  getCategories: publicProcedure.query(async () => {
    const conn = await getConnection();
    if (!conn) return [];

    try {
      const [rows] = await conn.execute('SELECT DISTINCT category FROM iptv_channels');
      await conn.end();

      return (rows as any[]).map(row => row.category);
    } catch (err) {
      console.error('Query error:', err);
      try {
        await conn.end();
      } catch (e) {}
      return [];
    }
  }),

  /**
   * Follow channel (stub)
   */
  followChannel: publicProcedure
    .input(z.object({ channelId: z.number() }))
    .mutation(async ({ input }) => {
      return { success: true, channelId: input.channelId };
    }),

  /**
   * Start playback (stub)
   */
  startPlayback: publicProcedure
    .input(z.object({ channelId: z.number() }))
    .mutation(async ({ input }) => {
      return { success: true, channelId: input.channelId };
    }),
});
