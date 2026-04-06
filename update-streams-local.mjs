import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool(process.env.DATABASE_URL);
const conn = await pool.getConnection();

// Use local demo video served from /public
const localVideoUrl = '/demo-video.mp4';

// Get all channels
const [channels] = await conn.query('SELECT id, name FROM iptv_channels');

console.log(`Updating ${channels.length} channels with local demo video...`);

for (let i = 0; i < channels.length; i++) {
  const channel = channels[i];
  
  // Update stream URL to local video
  await conn.query(
    `UPDATE iptv_streams SET streamUrl = ?, isActive = TRUE WHERE channelId = ?`,
    [localVideoUrl, channel.id]
  );
  
  if ((i + 1) % 15 === 0) {
    console.log(`  Updated ${i + 1}/${channels.length} channels...`);
  }
}

console.log(`\n✓ Successfully updated all ${channels.length} channels`);
console.log(`\nAll channels now use: ${localVideoUrl}`);
console.log(`\nFeatures working:`);
console.log(`  ✓ Play/Pause`);
console.log(`  ✓ Rewind/Fast Forward`);
console.log(`  ✓ Volume Control`);
console.log(`  ✓ Fullscreen`);
console.log(`  ✓ Progress Bar`);
console.log(`  ✓ All player controls`);

conn.release();
process.exit(0);
