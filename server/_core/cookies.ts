import type { CookieOptions, Request } from "express";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

function isIpAddress(host: string) {
  // Basic IPv4 check and IPv6 presence detection.
  if (!host) return false;
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return true;
  return host.includes(":");
}

function isSecureRequest(req: Request) {
  // Check direct protocol
  if (req.protocol === "https") return true;
  
  // Check x-forwarded-proto header (common in proxied environments)
  const forwardedProto = req.headers["x-forwarded-proto"];
  if (forwardedProto) {
    const protoList = Array.isArray(forwardedProto)
      ? forwardedProto
      : forwardedProto.split(",");
    if (protoList.some(proto => proto.trim().toLowerCase() === "https")) {
      return true;
    }
  }
  
  // Check if request came through a secure connection (trust proxy)
  if (req.secure) return true;
  
  return false;
}

function isLocalhost(req: Request) {
  const hostname = req.hostname || 'localhost';
  return LOCAL_HOSTS.has(hostname) || isIpAddress(hostname);
}

export function getSessionCookieOptions(
  req: Request
): Pick<CookieOptions, "domain" | "httpOnly" | "path" | "sameSite" | "secure"> {
  const isLocal = isLocalhost(req);
  const isSecure = isSecureRequest(req);
  
  console.log("[Cookie] isLocal:", isLocal, "isSecure:", isSecure, "hostname:", req.hostname, "protocol:", req.protocol);
  
  // For localhost development
  if (isLocal) {
    return {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: isSecure,
    };
  }
  
  // For production/mobile:
  // Use sameSite=lax instead of none to avoid third-party cookie issues on mobile
  // This works because the OAuth callback and API calls are same-site
  return {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: true,
  };
}
