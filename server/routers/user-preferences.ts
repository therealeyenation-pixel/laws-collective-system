import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { sql } from "drizzle-orm";

export const userPreferencesRouter = router({
  getPreferences: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return null;
    try {
      const result = await db.execute(sql`SELECT * FROM user_preferences WHERE userId = ${ctx.user?.id || 0}`);
      const prefs = (result as any[])[0];
      if (prefs) {
        return {
          weatherLocation: prefs.weatherLocation || 'New York, NY',
          weatherUnit: prefs.weatherUnit || 'fahrenheit',
          timezone: prefs.timezone || 'America/New_York',
          language: prefs.language || 'en',
          theme: prefs.theme || 'system',
          notificationsEnabled: prefs.notificationsEnabled ?? true,
          emailNotifications: prefs.emailNotifications ?? true,
          dashboardLayout: prefs.dashboardLayout || 'default',
        };
      }
      return {
        weatherLocation: 'New York, NY',
        weatherUnit: 'fahrenheit' as const,
        timezone: 'America/New_York',
        language: 'en',
        theme: 'system' as const,
        notificationsEnabled: true,
        emailNotifications: true,
        dashboardLayout: 'default',
      };
    } catch (error) {
      console.error('Error fetching preferences:', error);
      return null;
    }
  }),

  updateWeatherLocation: protectedProcedure
    .input(z.object({
      location: z.string().min(1).max(255),
      unit: z.enum(['fahrenheit', 'celsius']).optional()
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      try {
        await db.execute(
          sql`INSERT INTO user_preferences (userId, weatherLocation, weatherUnit)
              VALUES (${ctx.user?.id || 0}, ${input.location}, ${input.unit || 'fahrenheit'})
              ON DUPLICATE KEY UPDATE weatherLocation = ${input.location}, weatherUnit = COALESCE(${input.unit}, weatherUnit)`
        );
        return { success: true, location: input.location };
      } catch (error) {
        console.error('Error updating weather location:', error);
        throw new Error('Failed to update weather location');
      }
    }),

  updatePreferences: protectedProcedure
    .input(z.object({
      weatherLocation: z.string().min(1).max(255).optional(),
      weatherUnit: z.enum(['fahrenheit', 'celsius']).optional(),
      timezone: z.string().max(100).optional(),
      language: z.string().max(10).optional(),
      theme: z.enum(['light', 'dark', 'system']).optional(),
      notificationsEnabled: z.boolean().optional(),
      emailNotifications: z.boolean().optional(),
      dashboardLayout: z.string().max(50).optional()
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      try {
        await db.execute(
          sql`INSERT INTO user_preferences (userId, weatherLocation, weatherUnit, timezone, language, theme, notificationsEnabled, emailNotifications, dashboardLayout)
              VALUES (${ctx.user?.id || 0}, ${input.weatherLocation || 'New York, NY'}, ${input.weatherUnit || 'fahrenheit'}, ${input.timezone || 'America/New_York'}, ${input.language || 'en'}, ${input.theme || 'system'}, ${input.notificationsEnabled ?? true}, ${input.emailNotifications ?? true}, ${input.dashboardLayout || 'default'})
              ON DUPLICATE KEY UPDATE 
                weatherLocation = COALESCE(${input.weatherLocation}, weatherLocation),
                weatherUnit = COALESCE(${input.weatherUnit}, weatherUnit),
                timezone = COALESCE(${input.timezone}, timezone),
                language = COALESCE(${input.language}, language),
                theme = COALESCE(${input.theme}, theme),
                notificationsEnabled = COALESCE(${input.notificationsEnabled}, notificationsEnabled),
                emailNotifications = COALESCE(${input.emailNotifications}, emailNotifications),
                dashboardLayout = COALESCE(${input.dashboardLayout}, dashboardLayout)`
        );
        return { success: true };
      } catch (error) {
        console.error('Error updating preferences:', error);
        throw new Error('Failed to update preferences');
      }
    }),

  resetPreferences: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error('Database not available');
    try {
      await db.execute(sql`DELETE FROM user_preferences WHERE userId = ${ctx.user?.id || 0}`);
      return { success: true };
    } catch (error) {
      console.error('Error resetting preferences:', error);
      throw new Error('Failed to reset preferences');
    }
  })
});
