import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool(process.env.DATABASE_URL);

const conn = await pool.getConnection();
const [rows] = await conn.query('SELECT id, name, streamUrl FROM iptv_channels LIMIT 3');
console.log('Stream URLs in database:');
rows.forEach(row => {
  console.log(`${row.name}: ${row.streamUrl?.substring(0, 100) || 'NULL'}`);
});
conn.release();
process.exit(0);
