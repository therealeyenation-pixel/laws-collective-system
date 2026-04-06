/**
 * Streaming Seed Router
 * Direct database population for IPTV and VOD content
 */

import { publicProcedure, router } from '../_core/trpc';
import mysql from 'mysql2/promise';
import { ENV } from '../_core/env';
import { z } from 'zod';

async function getConnection() {
  try {
    return await mysql.createConnection(process.env.DATABASE_URL || '');
  } catch (err) {
    console.error('Database connection failed:', err);
    return null;
  }
}

export const streamingSeedRouter = router({
  /**
   * Create IPTV channels table and seed data
   */
  seedIPTV: publicProcedure.mutation(async () => {
    const conn = await getConnection();
    if (!conn) return { success: false, created: 0, error: 'Database unavailable' };

    try {
      // Create table if not exists
      await conn.execute(`
        CREATE TABLE IF NOT EXISTS iptv_channels (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL UNIQUE,
          category VARCHAR(100),
          description TEXT,
          streamUrl VARCHAR(500),
          logo VARCHAR(500),
          contentRating ENUM('G', 'PG', 'PG-13', 'R', 'NC-17', 'X', 'UNRATED') DEFAULT 'G',
          isAdultContent BOOLEAN DEFAULT FALSE,
          accessLevel ENUM('public', 'members', 'verified_18', 'verified_21', 'premium') DEFAULT 'public',
          isActive BOOLEAN DEFAULT TRUE,
          viewerCount INT DEFAULT 0,
          createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);

      const channels = [
        ['BBC News', 'News', 'British Broadcasting Corporation News', 'https://stream.bbc.co.uk/news', 'https://via.placeholder.com/100?text=BBC', 'G', 0, 'public'],
        ['CNN', 'News', 'Cable News Network', 'https://stream.cnn.com/live', 'https://via.placeholder.com/100?text=CNN', 'G', 0, 'public'],
        ['ESPN', 'Sports', 'ESPN Sports Channel', 'https://stream.espn.com/live', 'https://via.placeholder.com/100?text=ESPN', 'PG', 0, 'public'],
        ['Netflix', 'Entertainment', 'Netflix Streaming', 'https://stream.netflix.com/live', 'https://via.placeholder.com/100?text=Netflix', 'PG-13', 0, 'members'],
        ['HBO', 'Entertainment', 'HBO Channel', 'https://stream.hbo.com/live', 'https://via.placeholder.com/100?text=HBO', 'R', 0, 'members'],
        ['MTV', 'Music', 'Music Television', 'https://stream.mtv.com/live', 'https://via.placeholder.com/100?text=MTV', 'PG-13', 0, 'public'],
        ['Cartoon Network', 'Kids', 'Cartoon Network', 'https://stream.cartoonnetwork.com/live', 'https://via.placeholder.com/100?text=Cartoon', 'G', 0, 'public'],
        ['National Geographic', 'Documentary', 'National Geographic', 'https://stream.natgeo.com/live', 'https://via.placeholder.com/100?text=NatGeo', 'PG', 0, 'public'],
        ['Adult Channel 1', 'Adult', 'Adult Content', 'https://stream.adult1.com/live', 'https://via.placeholder.com/100?text=Adult', 'X', 1, 'verified_18'],
        ['Adult Channel 2', 'Adult', 'Adult Content', 'https://stream.adult2.com/live', 'https://via.placeholder.com/100?text=Adult', 'X', 1, 'verified_18'],
      ];

      let created = 0;
      for (const channel of channels) {
        try {
          await conn.execute(
            `INSERT IGNORE INTO iptv_channels (name, category, description, streamUrl, logo, contentRating, isAdultContent, accessLevel) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            channel
          );
          created++;
        } catch (err) {
          console.error(`Failed to insert ${channel[0]}:`, err);
        }
      }

      await conn.end();
      return { success: true, created, message: `Created ${created} IPTV channels` };
    } catch (err) {
      console.error('Seeding error:', err);
      await conn.end();
      return { success: false, created: 0, error: String(err) };
    }
  }),

  /**
   * Create VOD movies table and seed data
   */
  seedVOD: publicProcedure.mutation(async () => {
    const conn = await getConnection();
    if (!conn) return { success: false, created: 0, error: 'Database unavailable' };

    try {
      // Create table if not exists
      await conn.execute(`
        CREATE TABLE IF NOT EXISTS vod_movies (
          id INT AUTO_INCREMENT PRIMARY KEY,
          title VARCHAR(255) NOT NULL UNIQUE,
          description TEXT,
          genre VARCHAR(100),
          director VARCHAR(255),
          duration INT,
          releaseYear INT,
          imdbRating DECIMAL(3,1),
          contentRating VARCHAR(20),
          posterUrl VARCHAR(500),
          isActive BOOLEAN DEFAULT TRUE,
          createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);

      const movies = [
        ['The Shawshank Redemption', 'Drama film', 'Drama', 'Frank Darabont', 142, 1994, 9.3, 'R', 'https://via.placeholder.com/300x450?text=Shawshank'],
        ['The Godfather', 'Drama film', 'Drama', 'Francis Ford Coppola', 175, 1972, 9.2, 'R', 'https://via.placeholder.com/300x450?text=Godfather'],
        ['The Dark Knight', 'Action film', 'Action', 'Christopher Nolan', 152, 2008, 9.0, 'PG-13', 'https://via.placeholder.com/300x450?text=DarkKnight'],
        ['Inception', 'Sci-Fi film', 'Sci-Fi', 'Christopher Nolan', 148, 2010, 8.8, 'PG-13', 'https://via.placeholder.com/300x450?text=Inception'],
        ['Forrest Gump', 'Drama film', 'Drama', 'Robert Zemeckis', 142, 1994, 8.8, 'PG-13', 'https://via.placeholder.com/300x450?text=ForrestGump'],
        ['Pulp Fiction', 'Thriller film', 'Thriller', 'Quentin Tarantino', 154, 1994, 8.9, 'R', 'https://via.placeholder.com/300x450?text=PulpFiction'],
        ['The Matrix', 'Sci-Fi film', 'Sci-Fi', 'Lana Wachowski', 136, 1999, 8.7, 'R', 'https://via.placeholder.com/300x450?text=Matrix'],
        ['Interstellar', 'Sci-Fi film', 'Sci-Fi', 'Christopher Nolan', 169, 2014, 8.6, 'PG-13', 'https://via.placeholder.com/300x450?text=Interstellar'],
        ['The Lion King', 'Animation film', 'Animation', 'Roger Allers', 88, 1994, 8.5, 'G', 'https://via.placeholder.com/300x450?text=LionKing'],
        ['Toy Story', 'Animation film', 'Animation', 'John Lasseter', 81, 1995, 8.3, 'G', 'https://via.placeholder.com/300x450?text=ToyStory'],
      ];

      let created = 0;
      for (const movie of movies) {
        try {
          await conn.execute(
            `INSERT IGNORE INTO vod_movies (title, description, genre, director, duration, releaseYear, imdbRating, contentRating, posterUrl) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            movie
          );
          created++;
        } catch (err) {
          console.error(`Failed to insert ${movie[0]}:`, err);
        }
      }

      await conn.end();
      return { success: true, created, message: `Created ${created} VOD movies` };
    } catch (err) {
      console.error('Seeding error:', err);
      await conn.end();
      return { success: false, created: 0, error: String(err) };
    }
  }),

  /**
   * Get IPTV channels count
   */
  getChannelCount: publicProcedure.query(async () => {
    const conn = await getConnection();
    if (!conn) return { count: 0, error: 'Database unavailable' };

    try {
      const [rows] = await conn.execute(`SELECT COUNT(*) as count FROM iptv_channels`);
      const count = (rows as any)[0]?.count || 0;
      await conn.end();
      return { count, success: true };
    } catch (err) {
      console.error('Query error:', err);
      await conn.end();
      return { count: 0, error: String(err) };
    }
  }),
});

/**
 * Stream proxy endpoint - fetches external streams and serves them through the backend
 * This avoids CORS and external CDN restrictions
 */
export const streamProxyRouter = router({
  /**
   * Proxy a stream URL through the backend
   * This allows the frontend to fetch streams without CORS issues
   */
  getProxiedStream: publicProcedure
    .input(z.object({ streamUrl: z.string().url() }))
    .query(async ({ input }) => {
      try {
        // Validate that the stream URL is one we support
        const allowedDomains = [
          'bitdash-a.akamaihd.net',
          'dash.akamaized.net',
          'demo.unified-streaming.com',
          'cph-p2p-msl.akamaized.net',
        ];
        
        const url = new URL(input.streamUrl);
        if (!allowedDomains.some(domain => url.hostname.includes(domain))) {
          throw new Error('Stream URL not allowed');
        }
        
        // Fetch the stream manifest
        const response = await fetch(input.streamUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          },
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch stream: ${response.status}`);
        }
        
        const content = await response.text();
        return {
          success: true,
          content,
          contentType: response.headers.get('content-type') || 'application/vnd.apple.mpegurl',
        };
      } catch (error) {
        console.error('Stream proxy error:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    }),
});
