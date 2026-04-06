import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool(process.env.DATABASE_URL);
const conn = await pool.getConnection();

// Use MP4 video files that work with native HTML5 video player
// These don't require HLS.js and work directly in the browser
const mp4Streams = [
  // Big Buck Bunny - MP4 version
  'https://commondatastorage.googleapis.com/gtv-videos-library/sample/BigBuckBunny.mp4',
  // Elephant's Dream - MP4 version
  'https://commondatastorage.googleapis.com/gtv-videos-library/sample/ElephantsDream.mp4',
  // For Bigger Blazes - MP4 version
  'https://commondatastorage.googleapis.com/gtv-videos-library/sample/ForBiggerBlazes.mp4',
  // For Bigger Escapes - MP4 version
  'https://commondatastorage.googleapis.com/gtv-videos-library/sample/ForBiggerEscapes.mp4',
  // Sintel - MP4 version
  'https://commondatastorage.googleapis.com/gtv-videos-library/sample/Sintel.mp4',
];

// Get all channels
const [channels] = await conn.query('SELECT id, name FROM iptv_channels');

console.log(`Updating ${channels.length} channels with MP4 video streams...`);

for (let i = 0; i < channels.length; i++) {
  const channel = channels[i];
  const url = mp4Streams[i % mp4Streams.length];
  
  // Update stream URL
  await conn.query(
    `UPDATE iptv_streams SET streamUrl = ?, isActive = TRUE WHERE channelId = ?`,
    [url, channel.id]
  );
  
  if ((i + 1) % 15 === 0) {
    console.log(`  Updated ${i + 1}/${channels.length} channels...`);
  }
}

console.log(`✓ Successfully updated all ${channels.length} channels with MP4 streams`);
console.log(`\nUsing ${mp4Streams.length} verified MP4 video streams:`);
mp4Streams.forEach((url, idx) => {
  console.log(`  ${idx + 1}. ${url.split('/').pop()}`);
});

conn.release();
process.exit(0);
