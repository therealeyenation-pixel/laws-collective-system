import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create temp directory for PDFs
const tempDir = path.join(__dirname, '../temp_pdfs');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

async function uploadToStorage(filePath, fileName) {
  const baseUrl = process.env.BUILT_IN_FORGE_API_URL?.replace(/\/+$/, '');
  const apiKey = process.env.BUILT_IN_FORGE_API_KEY;
  
  if (!baseUrl || !apiKey) {
    throw new Error('Storage credentials not configured');
  }

  const fileBuffer = fs.readFileSync(filePath);
  const blob = new Blob([fileBuffer], { type: 'application/pdf' });
  const formData = new FormData();
  formData.append('file', blob, fileName);

  const uploadUrl = new URL('v1/storage/upload', baseUrl + '/');
  uploadUrl.searchParams.set('path', `documents/${fileName}`);

  const response = await fetch(uploadUrl, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}` },
    body: formData
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Upload failed: ${response.status} - ${text}`);
  }

  const result = await response.json();
  return result.url;
}

async function main() {
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
    SELECT id, title, content, documentType, description
    FROM secure_documents 
    WHERE (fileUrl IS NULL OR fileUrl = '')
    AND content IS NOT NULL 
    AND content != ''
  `);

  console.log(`Found ${docs.length} documents needing PDF generation\n`);

  for (const doc of docs) {
    console.log(`Processing: ${doc.title}`);
    
    try {
      // Create markdown file
      const safeTitle = doc.title.replace(/[^a-z0-9]/gi, '_').substring(0, 50);
      const mdPath = path.join(tempDir, `${safeTitle}.md`);
      const pdfPath = path.join(tempDir, `${safeTitle}.pdf`);
      
      // Write markdown content
      fs.writeFileSync(mdPath, doc.content);
      
      // Convert to PDF using manus-md-to-pdf
      console.log('  Converting to PDF...');
      execSync(`manus-md-to-pdf "${mdPath}" "${pdfPath}"`, { stdio: 'pipe' });
      
      // Upload to storage
      console.log('  Uploading to storage...');
      const fileName = `${safeTitle}_${Date.now()}.pdf`;
      const fileUrl = await uploadToStorage(pdfPath, fileName);
      
      // Update database
      console.log('  Updating database...');
      await conn.execute(
        `UPDATE secure_documents SET fileUrl = ?, fileName = ?, mimeType = ? WHERE id = ?`,
        [fileUrl, fileName, 'application/pdf', doc.id]
      );
      
      console.log(`  ✓ Done: ${fileUrl}\n`);
      
      // Cleanup temp files
      fs.unlinkSync(mdPath);
      fs.unlinkSync(pdfPath);
      
    } catch (error) {
      console.error(`  ✗ Error: ${error.message}\n`);
    }
  }

  // Cleanup temp directory
  try {
    fs.rmdirSync(tempDir);
  } catch (e) {}

  await conn.end();
  console.log('Done!');
}

main().catch(console.error);
