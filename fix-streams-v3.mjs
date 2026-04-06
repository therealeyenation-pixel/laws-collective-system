import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool(process.env.DATABASE_URL);
const conn = await pool.getConnection();

// Use CORS-enabled and reliable HLS streams
// These are from public sources that support CORS and HLS
const reliableStreams = [
  // Big Buck Bunny - Google CDN
  'https://commondatastorage.googleapis.com/gtv-videos-library/sample/BigBuckBunny.m3u8',
  // Sintel - Blender Foundation
  'https://commondatastorage.googleapis.com/gtv-videos-library/sample/Sintel.m3u8',
  // Elephant's Dream - Blender Foundation
  'https://commondatastorage.googleapis.com/gtv-videos-library/sample/ElephantsDream.m3u8',
  // For Bigger Blazes
  'https://commondatastorage.googleapis.com/gtv-videos-library/sample/ForBiggerBlazes.m3u8',
  // For Bigger Escapes
  'https://commondatastorage.googleapis.com/gtv-videos-library/sample/ForBiggerEscapes.m3u8',
];

// Get all channels
const [channels] = await conn.query('SELECT id, name FROM iptv_channels');

for (let i = 0; i < channels.length; i++) {
  const channel = channels[i];
  const url = reliableStreams[i % reliableStreams.length];
  
  // Update stream URL
  await conn.query(
    `UPDATE iptv_streams SET streamUrl = ?, isActive = TRUE WHERE channelId = ?`,
    [url, channel.id]
  );
}

console.log(`✓ Updated ${channels.length} channels with Google CDN HLS streams`);
conn.release();
process.exit(0);
