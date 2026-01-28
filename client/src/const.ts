export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Generate login URL - uses standalone login page
export const getLoginUrl = (returnPath?: string) => {
  // For standalone deployment, use local login page
  const loginPath = "/login";
  if (returnPath && returnPath !== "/login") {
    return `${loginPath}?returnTo=${encodeURIComponent(returnPath)}`;
  }
  return loginPath;
};
