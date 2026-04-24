export function getAuthSecret() {
  return (
    process.env.NEXTAUTH_SECRET ??
    process.env.AUTH_SECRET ??
    (process.env.NODE_ENV === "development"
      ? "stockpilot-dev-secret-change-me"
      : "")
  );
}

export function getBaseUrl() {
  return (
    process.env.NEXTAUTH_URL ??
    process.env.APP_URL ??
    "http://localhost:3000"
  );
}

export function getResendConfig() {
  return {
    apiKey: process.env.RESEND_API_KEY ?? "",
    from: process.env.RESEND_FROM_EMAIL ?? "",
  };
}

export function getGoogleOAuthConfig() {
  return {
    clientId: process.env.GOOGLE_CLIENT_ID ?? "",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
  };
}

export function isGoogleOAuthEnabled() {
  const config = getGoogleOAuthConfig();
  return Boolean(config.clientId && config.clientSecret);
}
