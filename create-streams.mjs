import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool(process.env.DATABASE_URL);
const conn = await pool.getConnection();

// Create iptv_streams table
await conn.query(`
  CREATE TABLE IF NOT EXISTS iptv_streams (
    id INT AUTO_INCREMENT PRIMARY KEY,
    channelId INT NOT NULL,
    streamUrl VARCHAR(500),
    streamKey VARCHAR(100),
    bitrate INT,
    resolution VARCHAR(20),
    codec VARCHAR(50),
    isActive BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (channelId) REFERENCES iptv_channels(id)
  )
`);

console.log('✓ Created iptv_streams table');

// Get all channels
const [channels] = await conn.query('SELECT id, name FROM iptv_channels');

// Sample HLS URLs
const sampleUrls = [
  'https://manifest.googlevideo.com/api/manifest/hls_variant/sq/1/type/live.3gpp/id/31c6e4efcc4d4dab/itag/18/source/youtube',
  'https://manifest.googlevideo.com/api/manifest/hls_variant/sq/1/type/live.3gpp/id/dQw4w9WgXcQ/itag/18/source/youtube',
  'https://manifest.googlevideo.com/api/manifest/hls_variant/sq/1/type/live.3gpp/id/9bZkp7q19f0/itag/18/source/youtube',
];

// Insert streams for each channel
for (const channel of channels) {
  const url = sampleUrls[channel.id % sampleUrls.length];
  await conn.query(
    'INSERT INTO iptv_streams (channelId, streamUrl, streamKey, isActive) VALUES (?, ?, ?, TRUE)',
    [channel.id, url, `key_${channel.id}`]
  );
}

console.log(`✓ Created ${channels.length} stream entries`);
conn.release();
process.exit(0);
