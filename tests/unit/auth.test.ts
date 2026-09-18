import { describe, expect, it } from "vitest";
import { createSessionManager } from "@/lib/auth/session";
import { createMemoryStorage } from "@/lib/storage/memoryStorage";

describe("session manager", () => {
  it("restores and clears a persisted session", async () => {
    const manager = createSessionManager(createMemoryStorage());
    const session = { user: { id: "1", email: "user@example.com" }, accessToken: "token" };

    await manager.save(session);
    expect(await manager.restore()).toEqual(session);
    await manager.clear();
    expect(await manager.restore()).toBeNull();
  });
});
