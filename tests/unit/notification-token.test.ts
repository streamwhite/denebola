import { describe, expect, it, vi } from "vitest";
import { createPushTokenManager } from "@/lib/notifications/token";
import { toPushToken } from "@/lib/notifications/types";

describe("createPushTokenManager", () => {
  it("registers the device token with the backend", async () => {
    const register = vi.fn(async () => undefined);
    const token = toPushToken("abc", "android");
    const manager = createPushTokenManager({ getToken: async () => token, registrar: { register } });

    expect(await manager.register()).toEqual(token);
    expect(register).toHaveBeenCalledWith(token);
  });

  it("is a no-op without a token and revokes only when one exists", async () => {
    const register = vi.fn(async () => undefined);
    const revoke = vi.fn(async () => undefined);
    const manager = createPushTokenManager({ getToken: async () => null, registrar: { register, revoke } });

    expect(await manager.register()).toBeNull();
    await manager.revoke();
    expect(revoke).not.toHaveBeenCalled();
  });

  it("revokes a stored token", async () => {
    const revoke = vi.fn(async () => undefined);
    const token = toPushToken("abc", "ios");
    const manager = createPushTokenManager({ getToken: async () => token, registrar: { register: vi.fn(), revoke } });

    await manager.revoke();

    expect(revoke).toHaveBeenCalledWith(token);
  });
});
