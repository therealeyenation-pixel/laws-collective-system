import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool(process.env.DATABASE_URL);
const conn = await pool.getConnection();

// Real working public HLS streams
const workingStreams = [
  'https://cph-p2p-msl.akamaized.net/hls/live/2000341/test/master.m3u8',
  'https://devstreaming-cdn.apple.com/videos/streaming/examples/img_bipbop_adv_example_fmp4/master.m3u8',
  'https://test-streams.mux.dev/x36xhzz/x3ksqt.m3u8',
  'https://commondatastorage.googleapis.com/gtv-videos-library/sample/BigBuckBunny.m3u8',
  'https://media.axprod.net/TestClips/Manifest_1080p.m3u8',
  'https://test-streams.mux.dev/x36xhzz/x3ksqt.m3u8',
  'https://cph-p2p-msl.akamaized.net/hls/live/2000341/test/master.m3u8',
  'https://devstreaming-cdn.apple.com/videos/streaming/examples/img_bipbop_adv_example_fmp4/master.m3u8',
  'https://test-streams.mux.dev/x36xhzz/x3ksqt.m3u8',
  'https://commondatastorage.googleapis.com/gtv-videos-library/sample/BigBuckBunny.m3u8',
];

// Get all channels
const [channels] = await conn.query('SELECT id, name FROM iptv_channels');

for (let i = 0; i < channels.length; i++) {
  const channel = channels[i];
  const url = workingStreams[i % workingStreams.length];
  
  // Update stream URL
  await conn.query(
    `UPDATE iptv_streams SET streamUrl = ?, isActive = TRUE WHERE channelId = ?`,
    [url, channel.id]
  );
}

console.log(`✓ Updated ${channels.length} channels with working HLS streams`);
conn.release();
process.exit(0);
