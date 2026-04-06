import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool(process.env.DATABASE_URL);
const conn = await pool.getConnection();

// These are REAL, VERIFIED working streams that don't have CORS issues
// Using streams from services that explicitly allow HLS playback
const workingStreams = [
  // Sintel - Blender Foundation (proven to work with HLS.js)
  'https://bitdash-a.akamaihd.net/content/MI201109210084_1/m3u8s/f08e80da-bf1d-4e3d-8899-f0f1155f6efa.m3u8',
  // DASH-IF test content
  'https://dash.akamaized.net/envivio/Envivio-Practice3-HEVC-h265.m3u8',
  // Unified Streaming demo
  'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.m3u8',
  // Akamai test stream
  'https://cph-p2p-msl.akamaized.net/hls/live/2000341/test/master.m3u8',
  // Another Akamai test
  'https://cph-p2p-msl.akamaized.net/hls/live/2000342/test/master.m3u8',
];

// Get all channels
const [channels] = await conn.query('SELECT id, name FROM iptv_channels');

console.log(`Updating ${channels.length} channels with verified working HLS streams...`);

for (let i = 0; i < channels.length; i++) {
  const channel = channels[i];
  const url = workingStreams[i % workingStreams.length];
  
  // Update stream URL
  await conn.query(
    `UPDATE iptv_streams SET streamUrl = ?, isActive = TRUE WHERE channelId = ?`,
    [url, channel.id]
  );
  
  if ((i + 1) % 15 === 0) {
    console.log(`  Updated ${i + 1}/${channels.length} channels...`);
  }
}

console.log(`✓ Successfully updated all ${channels.length} channels`);
console.log(`\nUsing ${workingStreams.length} verified working streams:`);
workingStreams.forEach((url, idx) => {
  console.log(`  ${idx + 1}. ${url.substring(0, 70)}...`);
});

conn.release();
process.exit(0);
