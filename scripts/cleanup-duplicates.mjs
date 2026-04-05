import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function main() {
  // Parse DATABASE_URL
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('DATABASE_URL not set');
    process.exit(1);
  }

  // Extract connection details from DATABASE_URL
  // Format: mysql://user:pass@host:port/database?ssl=...
  const url = new URL(dbUrl);
  
  const conn = await mysql.createConnection({
    host: url.hostname,
    port: parseInt(url.port) || 4000,
    user: url.username,
    password: url.password,
    database: url.pathname.slice(1),
    ssl: {
      rejectUnauthorized: true
    }
  });

  console.log('Connected to database');

  // Find duplicates
  const [duplicates] = await conn.execute(`
    SELECT title, COUNT(*) as cnt 
    FROM secure_documents 
    GROUP BY title 
    HAVING COUNT(*) > 1
  `);

  console.log('Duplicate titles found:', duplicates.length);
  
  for (const dup of duplicates) {
    console.log(`  - ${dup.title}: ${dup.cnt} copies`);
    
    // Get all IDs for this title, ordered by id DESC (keep newest)
    const [docs] = await conn.execute(
      `SELECT id, fileUrl FROM secure_documents WHERE title = ? ORDER BY id DESC`,
      [dup.title]
    );
    
    // Keep the first one (newest), delete the rest
    const keepId = docs[0].id;
    const deleteIds = docs.slice(1).map(d => d.id);
    
    if (deleteIds.length > 0) {
      console.log(`    Keeping ID ${keepId}, deleting IDs: ${deleteIds.join(', ')}`);
      await conn.execute(
        `DELETE FROM secure_documents WHERE id IN (${deleteIds.join(',')})`
      );
    }
  }

  // Verify cleanup
  const [remaining] = await conn.execute(`
    SELECT COUNT(*) as total FROM secure_documents
  `);
  console.log(`\nTotal documents after cleanup: ${remaining[0].total}`);

  const [stillDuplicate] = await conn.execute(`
    SELECT title, COUNT(*) as cnt 
    FROM secure_documents 
    GROUP BY title 
    HAVING COUNT(*) > 1
  `);
  console.log(`Remaining duplicates: ${stillDuplicate.length}`);

  await conn.end();
}

main().catch(console.error);
