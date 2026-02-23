import mysql from "mysql2/promise";
import fs from "fs";
import crypto from "crypto";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Storage helper using Manus proxy
async function storagePut(relKey, data, contentType = "application/octet-stream") {
  const baseUrl = process.env.BUILT_IN_FORGE_API_URL?.replace(/\/+$/, "");
  const apiKey = process.env.BUILT_IN_FORGE_API_KEY;
  
  if (!baseUrl || !apiKey) {
    throw new Error("Storage proxy credentials missing");
  }
  
  const key = relKey.replace(/^\/+/, "");
  const uploadUrl = new URL("v1/storage/upload", baseUrl + "/");
  uploadUrl.searchParams.set("path", key);
  
  const blob = new Blob([data], { type: contentType });
  const form = new FormData();
  form.append("file", blob, key.split("/").pop() ?? key);
  
  const response = await fetch(uploadUrl, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body: form,
  });
  
  if (!response.ok) {
    const message = await response.text().catch(() => response.statusText);
    throw new Error(`Storage upload failed (${response.status}): ${message}`);
  }
  
  const result = await response.json();
  return { key, url: result.url };
}

async function main() {
  // Database connection
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  
  try {
    // Read the Resolution PDF
    const pdfPath = "/home/ubuntu/upload/L.A.W.S.COLLECTIVE,LLCResolution.pdf";
    const fileContent = fs.readFileSync(pdfPath);
    const fileSize = fs.statSync(pdfPath).size;
    
    // Generate unique key
    const randomSuffix = crypto.randomBytes(4).toString("hex");
    const fileName = `laws-collective-resolution-grant-auth-${randomSuffix}.pdf`;
    const s3Key = `documents/${fileName}`;
    
    console.log("Uploading Resolution PDF to storage...");
    const { url: fileUrl } = await storagePut(s3Key, fileContent, "application/pdf");
    console.log("Uploaded to:", fileUrl);
    
    // Get owner ID (LaShanna Russell)
    const [users] = await connection.execute(
      `SELECT id FROM users WHERE email = 'therealeyenation@gmail.com' LIMIT 1`
    );
    const ownerId = users.length > 0 ? users[0].id : 1;
    
    // Get entity ID for L.A.W.S. Collective LLC
    const [entities] = await connection.execute(
      `SELECT id FROM business_entities WHERE name LIKE '%L.A.W.S%' OR name LIKE '%LAWS%' LIMIT 1`
    );
    const entityId = entities.length > 0 ? entities[0].id : null;
    
    // Insert into database with correct column names
    const now = new Date();
    const [result] = await connection.execute(
      `INSERT INTO secure_documents (
        ownerId, entityId, folderId, documentType, title, description, 
        fileName, fileUrl, fileSize, mimeType, content, version, 
        status, isTemplate, accessLevel, blockchainHash, metadata, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        ownerId,
        entityId,
        null, // folderId
        "legal_document",
        "L.A.W.S. Collective LLC Board Resolution - Grant Authorization",
        "Board resolution authorizing La Shanna K. Russell (President/CEO) and Amber S. Hunter (Secretary/Treasurer) to apply for, negotiate, and accept grant funding on behalf of the Company. Includes financial limits up to $500,000 per grant, signature authority, and banking authority provisions. Signed January 18, 2026.",
        fileName,
        fileUrl,
        fileSize,
        "application/pdf",
        null, // content (using fileUrl instead)
        1, // version
        "final",
        false, // isTemplate
        "owner_only",
        null, // blockchainHash
        JSON.stringify({ signedDate: "2026-01-18", signatories: ["La Shanna K. Russell", "Amber S. Hunter"] }),
        now,
        now,
      ]
    );
    
    console.log("Document added to database with ID:", result.insertId);
    console.log("Done!");
    
  } finally {
    await connection.end();
  }
}

main().catch(console.error);
