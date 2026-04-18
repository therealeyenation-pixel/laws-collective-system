export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

const OAUTH_PORTAL_URL = import.meta.env.VITE_OAUTH_PORTAL_URL || "";
const APP_ID = import.meta.env.VITE_APP_ID || "";

// Generate login URL - uses Manus OAuth for authentication (supports Google sign-in)
export const getLoginUrl = (returnPath?: string) => {
  // If OAuth portal is configured, use Manus OAuth flow
  if (OAUTH_PORTAL_URL && APP_ID) {
    const currentOrigin = window.location.origin;
    const callbackUrl = `${currentOrigin}/manus-oauth/callback`;
    const state = btoa(returnPath ? `${currentOrigin}${returnPath}` : `${currentOrigin}/dashboard`);
    return `${OAUTH_PORTAL_URL}?app_id=${APP_ID}&redirect_uri=${encodeURIComponent(callbackUrl)}&state=${state}`;
  }
  // Fallback to standalone login page
  const loginPath = "/login";
  if (returnPath && returnPath !== "/login") {
    return `${loginPath}?returnTo=${encodeURIComponent(returnPath)}`;
  }
  return loginPath;
};
