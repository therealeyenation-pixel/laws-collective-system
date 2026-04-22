/**
 * Channel Discovery Weekly Job
 * Runs every Sunday at 2 AM UTC to auto-discover and sync new theater/music channels
 */

import { discoverAndSyncChannels } from "../services/channel-discovery";

/**
 * Execute channel discovery sync
 */
export async function executeChannelDiscovery() {
  try {
    console.log("[Channel Discovery Job] Starting scheduled sync...");
    const startTime = Date.now();
    
    const result = await discoverAndSyncChannels();
    
    const duration = Date.now() - startTime;
    console.log(`[Channel Discovery Job] Completed in ${duration}ms`);
    console.log(`[Channel Discovery Job] Results: ${result.added} added, ${result.updated} updated, ${result.total} total discovered`);
    
    return {
      success: true,
      timestamp: new Date(),
      duration,
      result,
    };
  } catch (error) {
    console.error("[Channel Discovery Job] Failed:", error);
    return {
      success: false,
      timestamp: new Date(),
      error: String(error),
    };
  }
}

/**
 * Initialize scheduled job (called from server startup)
 * Runs every Sunday at 2 AM UTC
 */
export function initializeChannelDiscoveryJob() {
  // Cron expression: 0 2 * * 0 (Sunday at 2 AM UTC)
  // This will be called by the schedule tool from the main server
  console.log("[Channel Discovery Job] Initialized - will run weekly on Sundays at 2 AM UTC");
}
