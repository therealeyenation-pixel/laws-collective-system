/**
 * IPTV Bulk Channel Import Router
 * Handles importing 11,000+ channels from external IPTV lists
 * Supports M3U playlists and CSV formats
 */

import { protectedProcedure, adminProcedure } from '../_core/trpc';
import { z } from 'zod';
import { db } from '../db';
import { iptvChannels } from '../../drizzle/schema';

const bulkImportRouter = {
  /**
   * Import channels from M3U playlist
   */
  importFromM3U: adminProcedure
    .input(
      z.object({
        m3uContent: z.string().min(1),
        batchName: z.string().min(1),
        defaultAccessLevel: z.enum(['public', 'members', 'verified_18', 'verified_21', 'premium']).default('public'),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const batchId = `batch_${Date.now()}`;
      const channels = parseM3UContent(input.m3uContent);
      const importedChannels = [];

      for (const channel of channels) {
        try {
          const result = await db.insert(iptvChannels).values({
            name: channel.name,
            description: channel.description,
            category: channel.category || 'entertainment',
            subcategory: channel.subcategory,
            streamUrl: channel.streamUrl,
            logoUrl: channel.logo,
            country: channel.country,
            language: channel.language || 'en',
            contentRating: channel.contentRating || 'G',
            isAdultContent: channel.isAdult || false,
            accessLevel: channel.isAdult ? 'verified_18' : input.defaultAccessLevel,
            requiresAgeVerification: channel.isAdult || false,
            importBatchId: batchId,
            externalId: channel.externalId,
            isActive: true,
            isLive: false,
          });

          importedChannels.push({
            id: result.insertId,
            name: channel.name,
            status: 'imported',
          });
        } catch (error) {
          console.error(`Failed to import channel ${channel.name}:`, error);
        }
      }

      return {
        batchId,
        totalImported: importedChannels.length,
        channels: importedChannels,
        message: `Successfully imported ${importedChannels.length} channels`,
      };
    }),

  /**
   * Import channels from CSV
   */
  importFromCSV: adminProcedure
    .input(
      z.object({
        csvContent: z.string().min(1),
        batchName: z.string().min(1),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const batchId = `batch_${Date.now()}`;
      const channels = parseCSVContent(input.csvContent);
      const importedChannels = [];

      for (const channel of channels) {
        try {
          const result = await db.insert(iptvChannels).values({
            name: channel.name,
            description: channel.description,
            category: channel.category,
            subcategory: channel.subcategory,
            streamUrl: channel.streamUrl,
            logoUrl: channel.logoUrl,
            country: channel.country,
            language: channel.language || 'en',
            contentRating: channel.contentRating || 'G',
            isAdultContent: channel.isAdultContent || false,
            accessLevel: channel.accessLevel || 'public',
            requiresAgeVerification: channel.requiresAgeVerification || false,
            importBatchId: batchId,
            externalId: channel.externalId,
            isActive: true,
            isLive: false,
          });

          importedChannels.push({
            id: result.insertId,
            name: channel.name,
            status: 'imported',
          });
        } catch (error) {
          console.error(`Failed to import channel ${channel.name}:`, error);
        }
      }

      return {
        batchId,
        totalImported: importedChannels.length,
        channels: importedChannels,
      };
    }),

  /**
   * Get import batches
   */
  getImportBatches: adminProcedure
    .input(
      z.object({
        limit: z.number().default(50),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input, ctx }) => {
      // Get unique batch IDs and their channel counts
      const batches = await db.query.iptvChannels.findMany({
        limit: input.limit,
        offset: input.offset,
      });

      const batchMap = new Map();
      for (const channel of batches) {
        if (channel.importBatchId) {
          if (!batchMap.has(channel.importBatchId)) {
            batchMap.set(channel.importBatchId, {
              batchId: channel.importBatchId,
              count: 0,
              createdAt: channel.createdAt,
            });
          }
          batchMap.get(channel.importBatchId).count++;
        }
      }

      return Array.from(batchMap.values());
    }),

  /**
   * Get channels by batch
   */
  getChannelsByBatch: protectedProcedure
    .input(
      z.object({
        batchId: z.string(),
        limit: z.number().default(100),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input, ctx }) => {
      const channels = await db.query.iptvChannels.findMany({
        where: (channels, { eq }) => eq(channels.importBatchId, input.batchId),
        limit: input.limit,
        offset: input.offset,
      });

      return channels;
    }),

  /**
   * Delete batch and all its channels
   */
  deleteBatch: adminProcedure
    .input(
      z.object({
        batchId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const result = await db
        .delete(iptvChannels)
        .where((channels) => channels.importBatchId === input.batchId);

      return {
        success: true,
        message: `Batch ${input.batchId} deleted`,
      };
    }),
};

/**
 * Parse M3U format
 * Format: #EXTINF:-1 tvg-id="id" tvg-name="Name" tvg-logo="logo" group-title="Category",Channel Name
 * http://stream.url
 */
function parseM3UContent(content: string) {
  const channels = [];
  const lines = content.split('\n');
  let currentChannel: any = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line.startsWith('#EXTINF')) {
      currentChannel = {
        name: '',
        category: 'entertainment',
        streamUrl: '',
        logo: '',
        country: '',
        language: 'en',
        contentRating: 'G',
        isAdult: false,
      };

      // Parse EXTINF line
      const nameMatch = line.match(/,(.+)$/);
      if (nameMatch) {
        currentChannel.name = nameMatch[1].trim();
      }

      const logoMatch = line.match(/tvg-logo="([^"]+)"/);
      if (logoMatch) {
        currentChannel.logo = logoMatch[1];
      }

      const groupMatch = line.match(/group-title="([^"]+)"/);
      if (groupMatch) {
        currentChannel.category = groupMatch[1];
      }

      const idMatch = line.match(/tvg-id="([^"]+)"/);
      if (idMatch) {
        currentChannel.externalId = idMatch[1];
      }

      // Check for adult content indicators
      if (
        currentChannel.name.toLowerCase().includes('adult') ||
        currentChannel.name.toLowerCase().includes('xxx') ||
        currentChannel.category.toLowerCase().includes('adult')
      ) {
        currentChannel.isAdult = true;
        currentChannel.contentRating = 'X';
      }
    } else if (line && !line.startsWith('#') && currentChannel) {
      currentChannel.streamUrl = line;
      channels.push(currentChannel);
      currentChannel = null;
    }
  }

  return channels;
}

/**
 * Parse CSV format
 * Columns: name, description, category, subcategory, streamUrl, logoUrl, country, language, contentRating, isAdultContent, accessLevel
 */
function parseCSVContent(content: string) {
  const channels = [];
  const lines = content.split('\n');
  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = line.split(',').map((v) => v.trim());
    const channel: any = {};

    headers.forEach((header, index) => {
      channel[header] = values[index] || '';
    });

    if (channel.name) {
      channels.push({
        name: channel.name,
        description: channel.description || '',
        category: channel.category || 'entertainment',
        subcategory: channel.subcategory || '',
        streamUrl: channel.streamurl || '',
        logoUrl: channel.logourl || '',
        country: channel.country || '',
        language: channel.language || 'en',
        contentRating: channel.contentrating || 'G',
        isAdultContent: channel.isadultcontent === 'true' || false,
        accessLevel: channel.accesslevel || 'public',
        requiresAgeVerification: channel.requiresageverification === 'true' || false,
        externalId: channel.externalid || '',
      });
    }
  }

  return channels;
}

export default bulkImportRouter;
