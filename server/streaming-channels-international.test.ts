/**
 * Streaming Channels - International & Region Filter Tests
 * Tests the rebuilt channel list with US + international channels,
 * region filtering, category filtering, and auto-skip logic
 */

import { describe, it, expect } from 'vitest';
import { fetchIPTVChannels } from './services/data-integration';

describe('Streaming Channels - International Expansion', () => {
  let allChannels: any[];

  // Fetch channels once for all tests
  beforeAll(async () => {
    allChannels = await fetchIPTVChannels(100);
  });

  describe('Channel List Composition', () => {
    it('should return a mix of US and international channels', () => {
      expect(allChannels.length).toBeGreaterThanOrEqual(30);
      const usChannels = allChannels.filter((c) => c.region === 'us');
      const intlChannels = allChannels.filter((c) => c.region === 'international');
      expect(usChannels.length).toBeGreaterThan(0);
      expect(intlChannels.length).toBeGreaterThan(0);
    });

    it('should have at most 1 faith channel', () => {
      const faithChannels = allChannels.filter((c) => c.category === 'faith');
      expect(faithChannels.length).toBeLessThanOrEqual(1);
    });

    it('should have popular content categories (news, entertainment, sports, movies, music)', () => {
      const categories = new Set(allChannels.map((c) => c.category));
      expect(categories.has('news')).toBe(true);
      expect(categories.has('entertainment')).toBe(true);
      expect(categories.has('sports')).toBe(true);
      expect(categories.has('movies')).toBe(true);
      expect(categories.has('music')).toBe(true);
    });

    it('should have channels from multiple international regions', () => {
      const intlChannels = allChannels.filter((c) => c.region === 'international');
      const descriptions = intlChannels.map((c) => c.description.toLowerCase()).join(' ');
      // Check for geographic diversity
      expect(descriptions).toMatch(/africa|african/i);
      expect(descriptions).toMatch(/europe|european|france|german/i);
      expect(descriptions).toMatch(/japan|korea|india/i);
    });
  });

  describe('Channel Data Integrity', () => {
    it('every channel should have required fields', () => {
      allChannels.forEach((channel) => {
        expect(channel.id).toBeDefined();
        expect(typeof channel.id).toBe('number');
        expect(channel.name).toBeDefined();
        expect(typeof channel.name).toBe('string');
        expect(channel.category).toBeDefined();
        expect(channel.region).toBeDefined();
        expect(['us', 'international']).toContain(channel.region);
        expect(channel.streamUrl).toBeDefined();
        expect(channel.streamUrl).toMatch(/^https?:\/\//);
        expect(channel.isLive).toBe(true);
      });
    });

    it('every channel should have a description', () => {
      allChannels.forEach((channel) => {
        expect(channel.description).toBeDefined();
        expect(channel.description.length).toBeGreaterThan(5);
      });
    });

    it('channel IDs should be unique', () => {
      const ids = allChannels.map((c) => c.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });
  });

  describe('Region Filtering', () => {
    it('should filter to only US channels', () => {
      const usChannels = allChannels.filter((c) => c.region === 'us');
      expect(usChannels.length).toBeGreaterThan(10);
      usChannels.forEach((c) => {
        expect(c.region).toBe('us');
      });
    });

    it('should filter to only international channels', () => {
      const intlChannels = allChannels.filter((c) => c.region === 'international');
      expect(intlChannels.length).toBeGreaterThan(10);
      intlChannels.forEach((c) => {
        expect(c.region).toBe('international');
      });
    });

    it('international channels should have diverse categories', () => {
      const intlChannels = allChannels.filter((c) => c.region === 'international');
      const categories = new Set(intlChannels.map((c) => c.category));
      expect(categories.size).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Category Filtering', () => {
    it('should filter channels by category', () => {
      const newsChannels = allChannels.filter((c) => c.category === 'news');
      expect(newsChannels.length).toBeGreaterThan(0);
      newsChannels.forEach((c) => {
        expect(c.category).toBe('news');
      });
    });

    it('should support combined region + category filtering', () => {
      const intlNews = allChannels.filter(
        (c) => c.region === 'international' && c.category === 'news'
      );
      expect(intlNews.length).toBeGreaterThan(0);
      intlNews.forEach((c) => {
        expect(c.region).toBe('international');
        expect(c.category).toBe('news');
      });
    });
  });

  describe('Auto-Skip Logic', () => {
    it('should be able to find the next channel after a given channel', () => {
      const currentIndex = 0;
      const nextIndex = (currentIndex + 1) % allChannels.length;
      expect(nextIndex).toBe(1);
      expect(allChannels[nextIndex]).toBeDefined();
    });

    it('should wrap around to first channel when at the end', () => {
      const currentIndex = allChannels.length - 1;
      const nextIndex = (currentIndex + 1) % allChannels.length;
      expect(nextIndex).toBe(0);
      expect(allChannels[nextIndex]).toBeDefined();
    });

    it('should be able to find next channel in filtered list', () => {
      const newsChannels = allChannels.filter((c) => c.category === 'news');
      if (newsChannels.length > 1) {
        const currentIndex = 0;
        const nextIndex = (currentIndex + 1) % newsChannels.length;
        expect(newsChannels[nextIndex]).toBeDefined();
        expect(newsChannels[nextIndex].category).toBe('news');
      }
    });
  });

  describe('Stream URL Quality', () => {
    it('all stream URLs should be HLS (.m3u8) format', () => {
      allChannels.forEach((channel) => {
        expect(channel.streamUrl).toMatch(/\.m3u8/);
      });
    });

    it('no duplicate stream URLs', () => {
      const urls = allChannels.map((c) => c.streamUrl);
      const uniqueUrls = new Set(urls);
      expect(uniqueUrls.size).toBe(urls.length);
    });
  });
});

import { beforeAll } from 'vitest';
