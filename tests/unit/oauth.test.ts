import { describe, expect, it } from "vitest";
import { buildAuthorizationUrl, isPkceSupported, toSession } from "@/lib/auth/oauth";

const config = {
  id: "google",
  authorizationEndpoint: "https://accounts.example.com/auth",
  clientId: "client-1",
  redirectUri: "myapp://callback",
  scopes: ["openid", "email"],
};

describe("buildAuthorizationUrl", () => {
  it("builds a code-flow URL with PKCE and state", () => {
    const url = new URL(buildAuthorizationUrl(config, "state-1", "challenge-1"));

    expect(url.origin + url.pathname).toBe("https://accounts.example.com/auth");
    expect(url.searchParams.get("client_id")).toBe("client-1");
    expect(url.searchParams.get("response_type")).toBe("code");
    expect(url.searchParams.get("redirect_uri")).toBe("myapp://callback");
    expect(url.searchParams.get("scope")).toBe("openid email");
    expect(url.searchParams.get("state")).toBe("state-1");
    expect(url.searchParams.get("code_challenge")).toBe("challenge-1");
    expect(url.searchParams.get("code_challenge_method")).toBe("S256");
  });

  it("omits PKCE and merges extra params when configured", () => {
    const url = new URL(buildAuthorizationUrl({ ...config, usePkce: false, extraParams: { prompt: "login" } }, "s", "c"));

    expect(url.searchParams.get("code_challenge")).toBeNull();
    expect(url.searchParams.get("prompt")).toBe("login");
    expect(isPkceSupported({ ...config, usePkce: false })).toBe(false);
  });
});

describe("toSession", () => {
  it("maps a token response to a session with expiry", () => {
    const session = toSession({ accessToken: "a", refreshToken: "r", expiresIn: 60 }, { id: "1", email: "u@example.com" });

    expect(session.accessToken).toBe("a");
    expect(session.refreshToken).toBe("r");
    expect(session.expiresAt).toBeGreaterThan(Date.now());
  });
});
