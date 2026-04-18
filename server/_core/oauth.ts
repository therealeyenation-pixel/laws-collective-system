import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";
import { standaloneAuth } from "./standaloneAuth";

function getQueryParam(req: Request, key: string): string | undefined {
  const value = req.query[key];
  return typeof value === "string" ? value : undefined;
}

export function registerOAuthRoutes(app: Express) {
  // Manus OAuth callback - handles the authorization code exchange
  app.get("/api/oauth/callback", async (req: Request, res: Response) => {
    try {
      const code = getQueryParam(req, "code");
      const state = getQueryParam(req, "state");

      if (!code || !state) {
        console.error("[OAuth] Missing code or state in callback");
        res.redirect(302, "/login?error=missing_params");
        return;
      }

      console.log("[OAuth] Exchanging code for token...");
      
      // Exchange the authorization code for an access token
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      
      // Get user info from the token
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
      
      console.log("[OAuth] Got user info:", { openId: userInfo.openId, name: userInfo.name });

      // Upsert user in database
      const signedInAt = new Date();
      await db.upsertUser({
        openId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? "manus_oauth",
        lastSignedIn: signedInAt,
      });

      // Create session token
      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS,
      });

      // Set session cookie
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      // Decode the state to get the original redirect URI
      let redirectTo = "/dashboard";
      try {
        const decodedState = atob(state);
        // Extract the path from the decoded state URL
        const stateUrl = new URL(decodedState);
        if (stateUrl.pathname && stateUrl.pathname !== "/" && stateUrl.pathname !== "/manus-oauth/callback") {
          redirectTo = stateUrl.pathname;
        }
      } catch (e) {
        console.log("[OAuth] Could not decode state, redirecting to dashboard");
      }

      console.log("[OAuth] Login successful, redirecting to:", redirectTo);
      res.redirect(302, redirectTo);
    } catch (error) {
      console.error("[OAuth] Callback error:", error);
      res.redirect(302, "/login?error=oauth_failed");
    }
  });

  // Also handle the manus-oauth callback path (used by Manus hosting platform)
  app.get("/manus-oauth/callback", async (req: Request, res: Response) => {
    try {
      const code = getQueryParam(req, "code");
      const state = getQueryParam(req, "state");

      if (!code || !state) {
        console.error("[OAuth] Missing code or state in manus-oauth callback");
        res.redirect(302, "/login?error=missing_params");
        return;
      }

      console.log("[OAuth] Manus OAuth callback - exchanging code for token...");
      
      // Exchange the authorization code for an access token
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      
      // Get user info from the token
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
      
      console.log("[OAuth] Got user info:", { openId: userInfo.openId, name: userInfo.name });

      // Upsert user in database
      const signedInAt = new Date();
      await db.upsertUser({
        openId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? "manus_oauth",
        lastSignedIn: signedInAt,
      });

      // Create session token
      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS,
      });

      // Set session cookie
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      // Decode the state to get the original redirect URI
      let redirectTo = "/dashboard";
      try {
        const decodedState = atob(state);
        const stateUrl = new URL(decodedState);
        if (stateUrl.pathname && stateUrl.pathname !== "/" && stateUrl.pathname !== "/manus-oauth/callback") {
          redirectTo = stateUrl.pathname;
        }
      } catch (e) {
        console.log("[OAuth] Could not decode state, redirecting to dashboard");
      }

      console.log("[OAuth] Login successful, redirecting to:", redirectTo);
      res.redirect(302, redirectTo);
    } catch (error) {
      console.error("[OAuth] Manus OAuth callback error:", error);
      res.redirect(302, "/login?error=oauth_failed");
    }
  });

  // Standalone login endpoint for direct API access (email/password)
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        res.status(400).json({ error: "Email and password are required" });
        return;
      }

      const user = await standaloneAuth.loginUser(email, password);
      const sessionToken = await standaloneAuth.createSessionToken(user.openId, {
        name: user.name || "",
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      res.json({ success: true, user: { id: user.id, name: user.name, email: user.email } });
    } catch (error) {
      console.error("[Auth] Login failed", error);
      res.status(401).json({ error: error instanceof Error ? error.message : "Login failed" });
    }
  });

  // Standalone register endpoint
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const { email, password, name } = req.body;
      
      if (!email || !password) {
        res.status(400).json({ error: "Email and password are required" });
        return;
      }

      const user = await standaloneAuth.registerUser(email, password, name);
      const sessionToken = await standaloneAuth.createSessionToken(user.openId, {
        name: user.name || "",
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      res.json({ success: true, user: { id: user.id, name: user.name, email: user.email } });
    } catch (error) {
      console.error("[Auth] Registration failed", error);
      res.status(400).json({ error: error instanceof Error ? error.message : "Registration failed" });
    }
  });
}
