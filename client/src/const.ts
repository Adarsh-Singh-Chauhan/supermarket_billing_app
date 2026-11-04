export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

const getOAuthConfig = () => ({
  portalUrl: import.meta.env.VITE_OAUTH_PORTAL_URL?.trim() ?? "",
  appId: import.meta.env.VITE_APP_ID?.trim() ?? "",
});

export const isOAuthConfigured = () => {
  const { portalUrl, appId } = getOAuthConfig();
  return Boolean(portalUrl && appId);
};

// Generate login URL at runtime so redirect URI reflects the current origin.
export const getLoginUrl = () => {
  const { portalUrl, appId } = getOAuthConfig();
  if (!portalUrl || !appId) {
    throw new Error("Sign-in is not configured for this deployment.");
  }

  const portal = new URL(portalUrl);
  if (portal.protocol !== "https:") {
    throw new Error("The sign-in portal must use HTTPS.");
  }

  const redirectUri = `${window.location.origin}/api/oauth/callback`;
  const state = btoa(redirectUri);
  const url = new URL("/app-auth", portal);
  url.searchParams.set("appId", appId);
  url.searchParams.set("redirectUri", redirectUri);
  url.searchParams.set("state", state);
  url.searchParams.set("type", "signIn");

  return url.toString();
};
