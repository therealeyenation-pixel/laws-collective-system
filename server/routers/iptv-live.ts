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
      }).optional()
    )
    .query(async ({ input = {} }) => {
      const conn = await getConnection();
      if (!conn) {
        console.error('No database connection');
        return [];
      }

      try {
        const limit = input.limit || 50;
        const offset = input.offset || 0;
        
        console.log('DEBUG: Executing getChannels with limit:', limit, 'offset:', offset);
        const query = `SELECT * FROM iptv_channels ORDER BY id LIMIT ${limit} OFFSET ${offset}`;
        const [rows] = await conn.execute(query);
        console.log('DEBUG: Query returned', (rows as any[]).length, 'rows');
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
   * Get channels by category
   */
  getChannelsByCategory: publicProcedure
    .input(z.object({ category: z.string() }))
    .query(async ({ input }) => {
      const conn = await getConnection();
      if (!conn) return [];

      try {
        const [rows] = await conn.execute(
          `SELECT * FROM iptv_channels WHERE LOWER(category) = LOWER(?) ORDER BY name`,
          [input.category]
        );
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
        const [rows] = await conn.execute(
          `SELECT * FROM iptv_channels WHERE id = ?`,
          [input.channelId]
        );
        await conn.end();

        const channel = (rows as any[])[0];
        if (!channel) return { channel: null, activeStream: null };

        return {
          channel: {
            id: channel.id,
            name: channel.name,
            category: channel.category,
            description: channel.description,
            streamUrl: channel.streamUrl,
            logo: channel.logo,
            contentRating: channel.contentRating,
            isAdultContent: channel.isAdultContent,
            accessLevel: channel.accessLevel,
          },
          activeStream: {
            url: channel.streamUrl,
            quality: '1080p',
            bitrate: '5000k',
            codec: 'h264',
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
   * Get all categories
   */
  getCategories: publicProcedure.query(async () => {
    const conn = await getConnection();
    if (!conn) return [];

    try {
      const [rows] = await conn.execute(
        `SELECT DISTINCT category FROM iptv_channels WHERE category IS NOT NULL ORDER BY category`
      );
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
   * Search channels
   */
  searchChannels: publicProcedure
    .input(z.object({ query: z.string() }))
    .query(async ({ input }) => {
      const conn = await getConnection();
      if (!conn) return [];

      try {
        const searchTerm = `%${input.query}%`;
        const [rows] = await conn.execute(
          `SELECT * FROM iptv_channels WHERE name LIKE ? OR description LIKE ? ORDER BY name`,
          [searchTerm, searchTerm]
        );
        await conn.end();

        return (rows as any[]).map(row => ({
          id: row.id,
          name: row.name,
          category: row.category,
          description: row.description,
          streamUrl: row.streamUrl,
          logo: row.logo,
          logoUrl: row.logo,
          contentRating: row.contentRating,
          isAdultContent: row.isAdultContent,
          accessLevel: row.accessLevel,
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
});
