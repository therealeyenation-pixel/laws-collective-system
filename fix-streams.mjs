import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool(process.env.DATABASE_URL);
const conn = await pool.getConnection();

// Real public HLS test streams that work without authentication
const publicStreams = [
  // Test streams from public sources
  'https://test-streams.mux.dev/x36xhzz/x3ksqt.m3u8',
  'https://test-streams.mux.dev/x36xhzz/x3ksqt.m3u8',
  'https://test-streams.mux.dev/x36xhzz/x3ksqt.m3u8',
  'https://test-streams.mux.dev/x36xhzz/x3ksqt.m3u8',
  'https://test-streams.mux.dev/x36xhzz/x3ksqt.m3u8',
  'https://test-streams.mux.dev/x36xhzz/x3ksqt.m3u8',
  'https://test-streams.mux.dev/x36xhzz/x3ksqt.m3u8',
  'https://test-streams.mux.dev/x36xhzz/x3ksqt.m3u8',
  'https://test-streams.mux.dev/x36xhzz/x3ksqt.m3u8',
  'https://test-streams.mux.dev/x36xhzz/x3ksqt.m3u8',
];

// Get all channels
const [channels] = await conn.query('SELECT id, name FROM iptv_channels');

for (let i = 0; i < channels.length; i++) {
  const channel = channels[i];
  const url = publicStreams[i % publicStreams.length];
  
  // Update stream URL
  await conn.query(
    `UPDATE iptv_streams SET streamUrl = ?, isActive = TRUE WHERE channelId = ?`,
    [url, channel.id]
  );
  
  console.log(`✓ ${channel.name}: ${url}`);
}

console.log(`\n✓ Updated ${channels.length} channels with public HLS streams`);
conn.release();
process.exit(0);
