import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

dotenv.config();

async function main() {
  // Parse DATABASE_URL
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('DATABASE_URL not set');
    process.exit(1);
  }

  const url = new URL(dbUrl);
  
  const conn = await mysql.createConnection({
    host: url.hostname,
    port: parseInt(url.port) || 4000,
    user: url.username,
    password: url.password,
    database: url.pathname.slice(1),
    ssl: { rejectUnauthorized: true }
  });

  console.log('Connected to database');

  // Find documents with content but no fileUrl
  const [docs] = await conn.execute(`
    SELECT id, title, content, documentType
    FROM secure_documents 
    WHERE (fileUrl IS NULL OR fileUrl = '')
    AND content IS NOT NULL 
    AND content != ''
  `);

  console.log(`Found ${docs.length} documents needing PDF generation`);

  for (const doc of docs) {
    console.log(`\nProcessing: ${doc.title}`);
    console.log(`  Type: ${doc.documentType}`);
    console.log(`  Content length: ${doc.content?.length || 0} chars`);
  }

  await conn.end();
}

main().catch(console.error);
