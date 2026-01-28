import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { addClient, removeClient, clearUserTyping } from "../services/chatSSE";
import { standaloneAuth } from "./standaloneAuth";
import { getDb } from "../db";
import { users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { handleStripeWebhook } from "../stripe/webhook";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function runMigrations() {
  // Run migration to create tables and add columns if they don't exist
  if (process.env.DATABASE_URL) {
    try {
      const mysql = await import('mysql2/promise');
      const connection = await mysql.createConnection(process.env.DATABASE_URL);
      
      // Check if users table exists
      const [tables] = await connection.execute(
        "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users'"
      ) as any;
      
      if (tables.length === 0) {
        console.log('[Migration] Creating users table...');
        await connection.execute(`
          CREATE TABLE users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            openId VARCHAR(64) UNIQUE NOT NULL,
            name TEXT,
            email VARCHAR(320),
            passwordHash VARCHAR(255),
            loginMethod VARCHAR(64),
            role ENUM('user', 'staff', 'admin', 'owner') DEFAULT 'user' NOT NULL,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
            updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
            lastSignedIn TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
          )
        `);
        console.log('[Migration] users table created successfully');
      } else {
        // Table exists, add missing columns
        console.log('[Migration] users table exists, checking for missing columns...');
        
        const columnsToAdd = [
          { name: 'passwordHash', sql: 'ALTER TABLE `users` ADD COLUMN `passwordHash` VARCHAR(255) NULL' },
          { name: 'loginMethod', sql: 'ALTER TABLE `users` ADD COLUMN `loginMethod` VARCHAR(64) NULL' },
          { name: 'lastSignedIn', sql: 'ALTER TABLE `users` ADD COLUMN `lastSignedIn` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL' }
        ];
        
        for (const col of columnsToAdd) {
          const [columns] = await connection.execute(
            `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = '${col.name}'`
          ) as any;
          
          if (columns.length === 0) {
            console.log(`[Migration] Adding ${col.name} column...`);
            try {
              await connection.execute(col.sql);
              console.log(`[Migration] ${col.name} column added successfully`);
            } catch (e: any) {
              console.log(`[Migration] ${col.name} column may already exist or error: ${e.message}`);
            }
          }
        }
        console.log('[Migration] Column check complete');
      }
      
      await connection.end();
    } catch (error) {
      console.error('[Migration] Error running migrations:', error);
    }
  } else {
    console.log('[Migration] DATABASE_URL not set, skipping migrations');
  }
}

async function startServer() {
  // Run migrations before starting server
  await runMigrations();
  
  const app = express();
  const server = createServer(app);
  
  // Trust proxy for proper HTTPS detection behind load balancers/proxies
  app.set("trust proxy", 1);
  
  // Stripe webhook - MUST be before body parser to get raw body
  app.post("/api/stripe/webhook", express.raw({ type: "application/json" }), handleStripeWebhook);
  
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
  
  // SSE endpoint for real-time chat events
  app.get("/api/chat/events", async (req, res) => {
    try {
      // Verify user session from cookie
      const sessionCookie = req.headers.cookie
        ?.split("; ")
        .find((c) => c.startsWith("session="))
        ?.split("=")[1];
      
      if (!sessionCookie) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }
      
      const session = await standaloneAuth.verifySession(sessionCookie);
      if (!session) {
        res.status(401).json({ error: "Invalid session" });
        return;
      }
      
      // Get user from database
      const db = await getDb();
      if (!db) {
        res.status(500).json({ error: "Database not available" });
        return;
      }
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.openId, session.openId))
        .limit(1);
      if (!user) {
        res.status(401).json({ error: "Invalid session" });
        return;
      }
      
      // Set SSE headers
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      res.setHeader("X-Accel-Buffering", "no"); // Disable nginx buffering
      res.flushHeaders();
      
      // Add client to connected clients
      addClient(user.id, res);
      
      // Handle client disconnect
      req.on("close", () => {
        removeClient(user.id, res);
        clearUserTyping(user.id);
      });
    } catch (error) {
      console.error("SSE connection error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
