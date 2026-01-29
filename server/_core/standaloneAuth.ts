import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { ForbiddenError } from "@shared/_core/errors";
import { parse as parseCookieHeader } from "cookie";
import type { Request } from "express";
import { SignJWT, jwtVerify } from "jose";
import * as bcrypt from "bcryptjs";
import type { User } from "../../drizzle/schema";
import * as db from "../db";
import { ENV } from "./env";
import { randomUUID } from "crypto";

export type SessionPayload = {
  openId: string;
  appId: string;
  name: string;
};

class StandaloneAuthService {
  private getSessionSecret() {
    const secret = ENV.cookieSecret;
    return new TextEncoder().encode(secret);
  }

  /**
   * Hash a password using bcrypt
   */
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  /**
   * Verify a password against a hash
   */
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Register a new user with email and password
   */
  async registerUser(email: string, password: string, name?: string): Promise<User> {
    // Check if user already exists
    const existingUser = await db.getUserByEmail(email);
    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    const passwordHash = await this.hashPassword(password);
    const openId = `local_${randomUUID()}`; // Generate a unique ID for local users

    // Check if this is the first user - make them owner
    const allUsers = await db.getAllUsers();
    const isFirstUser = !allUsers || allUsers.length === 0;

    await db.upsertUser({
      openId,
      email,
      name: name || null,
      loginMethod: "email",
      lastSignedIn: new Date(),
      role: isFirstUser ? "owner" : "user",
    });

    // Update password hash separately
    const user = await db.getUserByEmail(email);
    if (user) {
      await db.updateUserPassword(user.id, passwordHash);
    }

    const finalUser = await db.getUserByEmail(email);
    if (!finalUser) {
      throw new Error("Failed to create user");
    }

    return finalUser;
  }

  /**
   * Login a user with email and password
   */
  async loginUser(email: string, password: string): Promise<User> {
    const user = await db.getUserByEmail(email);
    if (!user) {
      throw new Error("Invalid email or password");
    }

    if (!user.passwordHash) {
      throw new Error("This account requires OAuth login");
    }

    const isValid = await this.verifyPassword(password, user.passwordHash);
    if (!isValid) {
      throw new Error("Invalid email or password");
    }

    // Update last signed in
    await db.upsertUser({
      openId: user.openId,
      lastSignedIn: new Date(),
    });

    return user;
  }

  /**
   * Create a session token for a user
   */
  async createSessionToken(
    openId: string,
    options: { expiresInMs?: number; name?: string } = {}
  ): Promise<string> {
    const issuedAt = Date.now();
    const expiresInMs = options.expiresInMs ?? ONE_YEAR_MS;
    const expirationSeconds = Math.floor((issuedAt + expiresInMs) / 1000);
    const secretKey = this.getSessionSecret();

    return new SignJWT({
      openId,
      appId: ENV.appId || "laws-collective",
      name: options.name || "",
    })
      .setProtectedHeader({ alg: "HS256", typ: "JWT" })
      .setExpirationTime(expirationSeconds)
      .sign(secretKey);
  }

  /**
   * Verify a session token
   */
  async verifySession(
    cookieValue: string | undefined | null
  ): Promise<{ openId: string; appId: string; name: string } | null> {
    if (!cookieValue) {
      return null;
    }

    try {
      const secretKey = this.getSessionSecret();
      const { payload } = await jwtVerify(cookieValue, secretKey, {
        algorithms: ["HS256"],
      });
      const { openId, appId, name } = payload as Record<string, unknown>;

      if (typeof openId !== "string" || !openId) {
        return null;
      }

      return {
        openId,
        appId: (appId as string) || "laws-collective",
        name: (name as string) || "",
      };
    } catch (error) {
      console.warn("[Auth] Session verification failed", String(error));
      return null;
    }
  }

  private parseCookies(cookieHeader: string | undefined) {
    if (!cookieHeader) {
      return new Map<string, string>();
    }

    const parsed = parseCookieHeader(cookieHeader);
    return new Map(Object.entries(parsed));
  }

  /**
   * Authenticate a request and return the user
   */
  async authenticateRequest(req: Request): Promise<User> {
    const cookies = this.parseCookies(req.headers.cookie);
    const sessionCookie = cookies.get(COOKIE_NAME);
    const session = await this.verifySession(sessionCookie);

    if (!session) {
      throw ForbiddenError("Invalid session cookie");
    }

    const user = await db.getUserByOpenId(session.openId);

    if (!user) {
      throw ForbiddenError("User not found");
    }

    return user;
  }
}

export const standaloneAuth = new StandaloneAuthService();
