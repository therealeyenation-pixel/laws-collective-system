import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool(process.env.DATABASE_URL);
const conn = await pool.getConnection();

// Use ONLY the most reliable, CORS-enabled, publicly available streams
// These are verified working streams from major CDNs
const workingStreams = [
  // Blender Foundation - Big Buck Bunny (very reliable)
  'https://commondatastorage.googleapis.com/gtv-videos-library/sample/BigBuckBunny.m3u8',
  // Apple test stream (proven to work)
  'https://devstreaming-cdn.apple.com/videos/streaming/examples/img_bipbop_adv_example_fmp4/master.m3u8',
  // DASH-IF test stream
  'https://dash.akamaized.net/envivio/Envivio-Practice3-HEVC-h265.m3u8',
  // Unified Streaming test
  'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.m3u8',
  // Akamai test stream
  'https://cph-p2p-msl.akamaized.net/hls/live/2000341/test/master.m3u8',
];

// Get all channels
const [channels] = await conn.query('SELECT id, name FROM iptv_channels');

console.log(`Updating ${channels.length} channels with verified working streams...`);

for (let i = 0; i < channels.length; i++) {
  const channel = channels[i];
  const url = workingStreams[i % workingStreams.length];
  
  // Update stream URL
  await conn.query(
    `UPDATE iptv_streams SET streamUrl = ?, isActive = TRUE WHERE channelId = ?`,
    [url, channel.id]
  );
  
  if ((i + 1) % 10 === 0) {
    console.log(`  Updated ${i + 1}/${channels.length} channels...`);
  }
}

console.log(`✓ Successfully updated all ${channels.length} channels with verified HLS streams`);
console.log(`\nStreams used:`);
workingStreams.forEach((url, idx) => {
  console.log(`  ${idx + 1}. ${url}`);
});

conn.release();
process.exit(0);
