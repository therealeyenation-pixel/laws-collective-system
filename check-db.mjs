import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool(process.env.DATABASE_URL);
const conn = await pool.getConnection();

console.log('=== CHANNELS ===');
const [channels] = await conn.query('SELECT id, name, streamUrl FROM iptv_channels LIMIT 3');
console.log(channels);

console.log('\n=== STREAMS ===');
const [streams] = await conn.query('SELECT id, channelId, streamUrl, isActive FROM iptv_streams LIMIT 3');
console.log(streams);

conn.release();
process.exit(0);
