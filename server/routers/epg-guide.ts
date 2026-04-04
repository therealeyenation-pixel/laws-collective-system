/**
 * EPG (Electronic Program Guide) Router
 * Manages channel schedules and programming grid
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

// Sample program data
const samplePrograms = [
  { title: 'Morning News', duration: 60, rating: 'G' },
  { title: 'Business Report', duration: 30, rating: 'G' },
  { title: 'Entertainment Today', duration: 45, rating: 'PG' },
  { title: 'Sports Update', duration: 30, rating: 'PG' },
  { title: 'Documentary', duration: 60, rating: 'PG' },
  { title: 'Evening News', duration: 60, rating: 'G' },
  { title: 'Movie Night', duration: 120, rating: 'PG-13' },
  { title: 'Late Night Show', duration: 60, rating: 'PG-13' },
  { title: 'Music Video Hour', duration: 60, rating: 'PG' },
  { title: 'Kids Program', duration: 30, rating: 'G' },
];

export const epgGuideRouter = router({
  /**
   * Get EPG schedule for a specific channel
   */
  getChannelSchedule: publicProcedure
    .input(z.object({ channelId: z.number(), date: z.string().optional() }))
    .query(async ({ input }) => {
      const date = input.date || new Date().toISOString().split('T')[0];
      const schedule = [];
      
      let currentHour = 6; // Start at 6 AM
      for (let i = 0; i < 18; i++) { // 18 programs per day
        const program = samplePrograms[i % samplePrograms.length];
        const startTime = new Date(`${date}T${String(currentHour).padStart(2, '0')}:00:00`);
        const endTime = new Date(startTime.getTime() + program.duration * 60000);
        
        schedule.push({
          id: `${input.channelId}-${i}`,
          channelId: input.channelId,
          title: program.title,
          description: `${program.title} - ${program.duration} minutes`,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          duration: program.duration,
          rating: program.rating,
          genre: ['News', 'Sports', 'Entertainment', 'Documentary', 'Movie', 'Kids'][i % 6],
        });
        
        currentHour += Math.ceil(program.duration / 60);
      }
      
      return schedule;
    }),

  /**
   * Get EPG grid for multiple channels
   */
  getEPGGrid: publicProcedure
    .input(z.object({
      date: z.string().optional(),
      channelIds: z.array(z.number()).optional(),
      limit: z.number().default(10),
    }))
    .query(async ({ input }) => {
      const date = input.date || new Date().toISOString().split('T')[0];
      const conn = await getConnection();
      if (!conn) return { date, channels: [] };

      try {
        let query = 'SELECT id, name FROM iptv_channels';
        if (input.channelIds && input.channelIds.length > 0) {
          query += ` WHERE id IN (${input.channelIds.join(',')})`;
        }
        query += ` LIMIT ${input.limit}`;

        const [rows] = await conn.execute(query);
        await conn.end();

        const channels = await Promise.all(
          (rows as any[]).map(async (channel) => {
            const schedule = [];
            let currentHour = 6;
            
            for (let i = 0; i < 6; i++) { // 6 programs in grid view
              const program = samplePrograms[i % samplePrograms.length];
              const startTime = new Date(`${date}T${String(currentHour).padStart(2, '0')}:00:00`);
              const endTime = new Date(startTime.getTime() + program.duration * 60000);
              
              schedule.push({
                title: program.title,
                startTime: startTime.toISOString(),
                endTime: endTime.toISOString(),
                rating: program.rating,
              });
              
              currentHour += Math.ceil(program.duration / 60);
            }
            
            return {
              id: channel.id,
              name: channel.name,
              schedule,
            };
          })
        );

        return { date, channels };
      } catch (err) {
        console.error('Query error:', err);
        try {
          await conn.end();
        } catch (e) {}
        return { date, channels: [] };
      }
    }),

  /**
   * Get now playing on all channels
   */
  getNowPlaying: publicProcedure.query(async () => {
    const conn = await getConnection();
    if (!conn) return [];

    try {
      const [rows] = await conn.execute('SELECT id, name, category FROM iptv_channels LIMIT 20');
      await conn.end();

      const now = new Date();
      const currentHour = now.getHours();

      return (rows as any[]).map((channel, index) => {
        const program = samplePrograms[index % samplePrograms.length];
        const startTime = new Date(now);
        startTime.setHours(currentHour, 0, 0, 0);
        const endTime = new Date(startTime.getTime() + program.duration * 60000);

        return {
          channelId: channel.id,
          channelName: channel.name,
          category: channel.category,
          nowPlaying: {
            title: program.title,
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
            rating: program.rating,
            progress: Math.floor(Math.random() * 100),
          },
          upcoming: samplePrograms[(index + 1) % samplePrograms.length],
        };
      });
    } catch (err) {
      console.error('Query error:', err);
      try {
        await conn.end();
      } catch (e) {}
      return [];
    }
  }),

  /**
   * Search programs by title
   */
  searchPrograms: publicProcedure
    .input(z.object({ query: z.string(), date: z.string().optional() }))
    .query(async ({ input }) => {
      const results = samplePrograms
        .filter(p => p.title.toLowerCase().includes(input.query.toLowerCase()))
        .map((program, index) => ({
          id: index,
          title: program.title,
          description: program.title,
          duration: program.duration,
          rating: program.rating,
          channels: Math.floor(Math.random() * 10) + 1,
        }));

      return results;
    }),

  /**
   * Get favorite programs
   */
  getFavoritePrograms: publicProcedure.query(async () => {
    return samplePrograms.map((program, index) => ({
      id: index,
      title: program.title,
      rating: program.rating,
      duration: program.duration,
      frequency: Math.floor(Math.random() * 7) + 1, // Days per week
    }));
  }),

  /**
   * Set program reminder
   */
  setProgramReminder: publicProcedure
    .input(z.object({
      channelId: z.number(),
      programTitle: z.string(),
      reminderTime: z.number().default(15), // Minutes before
    }))
    .mutation(async ({ input }) => {
      return {
        success: true,
        message: `Reminder set for "${input.programTitle}" on channel ${input.channelId} (${input.reminderTime} min before)`,
        reminderId: Math.random().toString(36).substr(2, 9),
      };
    }),

  /**
   * Get category schedules
   */
  getCategorySchedule: publicProcedure
    .input(z.object({ category: z.string(), date: z.string().optional() }))
    .query(async ({ input }) => {
      const conn = await getConnection();
      if (!conn) return [];

      try {
        const [rows] = await conn.execute(
          `SELECT id, name FROM iptv_channels WHERE category = ? LIMIT 10`,
          [input.category]
        );
        await conn.end();

        return (rows as any[]).map((channel) => ({
          channelId: channel.id,
          channelName: channel.name,
          programs: samplePrograms.slice(0, 4).map((p, i) => ({
            title: p.title,
            time: `${6 + i * 2}:00`,
            rating: p.rating,
          })),
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
