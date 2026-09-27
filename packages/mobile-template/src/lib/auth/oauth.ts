import type { Session } from "./types";

export type OAuthProviderConfig = {
  id: string;
  /** Authorization endpoint (OIDC discovery or provider URL). */
  authorizationEndpoint: string;
  tokenEndpoint?: string;
  clientId: string;
  scopes?: string[];
  redirectUri: string;
  usePkce?: boolean;
  extraParams?: Record<string, string>;
};

export type OAuthTokenResponse = { accessToken: string; refreshToken?: string; expiresIn?: number; idToken?: string };

// Pure builder for the authorization request, kept separate from expo-auth-session so it can
// be unit-tested and reused when the app swaps in a different browser/session implementation.
export function buildAuthorizationUrl(config: OAuthProviderConfig, state: string, codeChallenge?: string): string {
  const params = new URLSearchParams({ client_id: config.clientId, response_type: "code", redirect_uri: config.redirectUri, scope: (config.scopes ?? ["openid", "profile", "email"]).join(" "), state });
  if (config.usePkce !== false && codeChallenge) {
    params.set("code_challenge", codeChallenge);
    params.set("code_challenge_method", "S256");
  }
  for (const [key, value] of Object.entries(config.extraParams ?? {})) params.set(key, value);
  return `${config.authorizationEndpoint}?${params.toString()}`;
}

export function toSession(token: OAuthTokenResponse, user: Session["user"]): Session {
  return {
    user,
    accessToken: token.accessToken,
    ...(token.refreshToken ? { refreshToken: token.refreshToken } : {}),
    ...(token.expiresIn ? { expiresAt: Date.now() + token.expiresIn * 1_000 } : {}),
  };
}

export function isPkceSupported(config: OAuthProviderConfig): boolean {
  return config.usePkce !== false;
}
