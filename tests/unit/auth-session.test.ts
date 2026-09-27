import { describe, expect, it } from "vitest";
import { createSessionManager, isSessionExpired } from "@/lib/auth/session";
import { createMemoryStorage } from "@/lib/storage/memoryStorage";

const session = { user: { id: "1", email: "user@example.com" }, accessToken: "token" };

describe("session manager", () => {
  it("restores and clears a persisted session", async () => {
    const manager = createSessionManager(createMemoryStorage());

    await manager.save(session);
    expect(await manager.restore()).toEqual(session);
    await manager.clear();
    expect(await manager.restore()).toBeNull();
  });
});

describe("isSessionExpired", () => {
  it("treats missing sessions and past expiry as expired", () => {
    expect(isSessionExpired(null)).toBe(true);
    expect(isSessionExpired({ ...session, expiresAt: 1_000 }, 2_000)).toBe(true);
    expect(isSessionExpired({ ...session, expiresAt: 5_000 }, 2_000)).toBe(false);
    expect(isSessionExpired(session, 2_000)).toBe(false);
  });
});
