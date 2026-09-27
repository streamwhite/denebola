import { describe, expect, it } from "vitest";
import { createCredentialStore } from "@/lib/storage/credentials";
import { createKeyRotation, isRotationDue, rotationKey } from "@/lib/storage/rotation";
import { createMemoryStorage } from "@/lib/storage/memoryStorage";

describe("createKeyRotation", () => {
  it("writes, reads and rotates with metadata", async () => {
    const storage = createMemoryStorage();
    const rotation = createKeyRotation({ storage, currentVersion: 2 });

    await rotation.write("token", "secret-1");
    expect(await rotation.read("token")).toMatchObject({ value: "secret-1", version: 2 });

    const next = await rotation.rotate("token", async (current) => `${current?.value}-next`);
    expect(next.value).toBe("secret-1-next");
    expect(next.version).toBe(3);
    expect(await storage.get(rotationKey("token"))).toEqual(next);
  });

  it("flags rotation as due when missing or old", () => {
    expect(isRotationDue(null, 1_000, 5_000)).toBe(true);
    expect(isRotationDue({ value: "x", version: 1, rotatedAt: 1_000 }, 1_000, 5_000)).toBe(true);
    expect(isRotationDue({ value: "x", version: 1, rotatedAt: 4_500 }, 1_000, 5_000)).toBe(false);
  });

  it("removes a secret", async () => {
    const storage = createMemoryStorage();
    const rotation = createKeyRotation({ storage });

    await rotation.write("token", "secret");
    await rotation.remove("token");

    expect(await rotation.read("token")).toBeNull();
  });
});

describe("createCredentialStore", () => {
  it("saves, loads and clears credentials independently of the session", async () => {
    const store = createCredentialStore(createMemoryStorage());

    expect(await store.has()).toBe(false);
    await store.save({ username: "user", password: "pass" });
    expect(await store.has()).toBe(true);
    expect(await store.load()).toEqual({ username: "user", password: "pass" });

    await store.clear();
    expect(await store.load()).toBeNull();
  });
});
