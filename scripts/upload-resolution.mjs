import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import mysql from "mysql2/promise";
import fs from "fs";
import path from "path";
import crypto from "crypto";

// S3 Configuration
const s3Client = new S3Client({
  region: "auto",
  endpoint: process.env.S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  },
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME;

async function uploadToS3(filePath, key, contentType) {
  const fileContent = fs.readFileSync(filePath);
  
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: fileContent,
    ContentType: contentType,
  });
  
  await s3Client.send(command);
  
  // Construct the public URL
  const publicUrl = `${process.env.S3_PUBLIC_URL}/${key}`;
  return publicUrl;
}

async function main() {
  // Database connection
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  
  try {
    // Upload the Resolution PDF
    const pdfPath = "/home/ubuntu/upload/L.A.W.S.COLLECTIVE,LLCResolution.pdf";
    const randomSuffix = crypto.randomBytes(4).toString("hex");
    const s3Key = `documents/laws-collective-resolution-grant-auth-${randomSuffix}.pdf`;
    
    console.log("Uploading Resolution PDF to S3...");
    const fileUrl = await uploadToS3(pdfPath, s3Key, "application/pdf");
    console.log("Uploaded to:", fileUrl);
    
    // Insert into database
    const documentData = {
      title: "L.A.W.S. Collective LLC Board Resolution - Grant Authorization",
      description: "Board resolution authorizing La Shanna K. Russell (President/CEO) and Amber S. Hunter (Secretary/Treasurer) to apply for, negotiate, and accept grant funding on behalf of the Company. Includes financial limits, signature authority, and banking authority provisions.",
      category: "Legal Document",
      entity: "The L.A.W.S. Collective LLC",
      status: "final",
      accessLevel: "owner only",
      version: 1,
      fileUrl: fileUrl,
      content: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const [result] = await connection.execute(
      `INSERT INTO secure_documents (title, description, category, entity, status, accessLevel, version, fileUrl, content, createdAt, updatedAt) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        documentData.title,
        documentData.description,
        documentData.category,
        documentData.entity,
        documentData.status,
        documentData.accessLevel,
        documentData.version,
        documentData.fileUrl,
        documentData.content,
        documentData.createdAt,
        documentData.updatedAt,
      ]
    );
    
    console.log("Document added to database with ID:", result.insertId);
    console.log("Done!");
    
  } finally {
    await connection.end();
  }
}

main().catch(console.error);
