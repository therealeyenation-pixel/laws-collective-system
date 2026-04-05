#!/usr/bin/env node

/**
 * Seed Database via API
 * Calls tRPC procedures to populate IPTV channels and VOD content
 * This works with the running dev server
 */

import fetch from 'node-fetch';

const API_URL = process.env.API_URL || 'http://localhost:3000/api/trpc';

async function callTRPC(procedure, input) {
  try {
    const response = await fetch(`${API_URL}/${procedure}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        json: input,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data.result?.data;
  } catch (error) {
    console.error(`Error calling ${procedure}:`, error.message);
    throw error;
  }
}

async function seedIPTVChannels() {
  console.log('🎬 Seeding IPTV Channels...');
  try {
    const result = await callTRPC('adminSeed.seedIPTVChannels', {});
    console.log(`✓ Created ${result.created} IPTV channels`);
    return result;
  } catch (error) {
    console.error('Failed to seed IPTV channels:', error.message);
    return null;
  }
}

async function seedVODMovies() {
  console.log('🎥 Seeding VOD Movies...');
  try {
    const result = await callTRPC('adminSeed.seedVODMovies', {});
    console.log(`✓ Created ${result.created} VOD movies`);
    return result;
  } catch (error) {
    console.error('Failed to seed VOD movies:', error.message);
    return null;
  }
}

async function seedVODSeries() {
  console.log('📺 Seeding VOD Series...');
  try {
    const result = await callTRPC('adminSeed.seedVODSeries', {});
    console.log(`✓ Created ${result.created} VOD series`);
    return result;
  } catch (error) {
    console.error('Failed to seed VOD series:', error.message);
    return null;
  }
}

async function main() {
  console.log('🚀 Starting database seeding via API...\n');

  const results = {
    channels: await seedIPTVChannels(),
    movies: await seedVODMovies(),
    series: await seedVODSeries(),
  };

  console.log('\n📊 Seeding Summary:');
  console.log('─────────────────────────────────');
  console.log(`IPTV Channels: ${results.channels?.created || 0} created`);
  console.log(`VOD Movies:    ${results.movies?.created || 0} created`);
  console.log(`VOD Series:    ${results.series?.created || 0} created`);
  console.log('─────────────────────────────────');

  if (results.channels?.success && results.movies?.success && results.series?.success) {
    console.log('\n✓ All content seeded successfully!');
    console.log('\nYou can now visit:');
    console.log('  • http://localhost:3000/theater-live - Live IPTV channels');
    console.log('  • http://localhost:3000/theater-vod - VOD movies and series');
    console.log('  • http://localhost:3000/broadcast-channels - Radio and podcasts');
  } else {
    console.log('\n⚠ Some seeding operations failed. Check errors above.');
  }
}

main().catch(console.error);
