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
    
    // Generate unique key
    const randomSuffix = crypto.randomBytes(4).toString("hex");
    const s3Key = `documents/laws-collective-resolution-grant-auth-${randomSuffix}.pdf`;
    
    console.log("Uploading Resolution PDF to storage...");
    const { url: fileUrl } = await storagePut(s3Key, fileContent, "application/pdf");
    console.log("Uploaded to:", fileUrl);
    
    // Insert into database
    const now = new Date();
    const [result] = await connection.execute(
      `INSERT INTO secure_documents (title, description, category, entity, status, accessLevel, version, fileUrl, content, createdAt, updatedAt) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        "L.A.W.S. Collective LLC Board Resolution - Grant Authorization",
        "Board resolution authorizing La Shanna K. Russell (President/CEO) and Amber S. Hunter (Secretary/Treasurer) to apply for, negotiate, and accept grant funding on behalf of the Company. Includes financial limits up to $500,000 per grant, signature authority, and banking authority provisions.",
        "Legal Document",
        "The L.A.W.S. Collective LLC",
        "final",
        "owner only",
        1,
        fileUrl,
        null,
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
