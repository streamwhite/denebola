import { beforeEach, describe, expect, it, vi } from "vitest";

const secure = vi.hoisted(() => ({ store: new Map<string, string>() }));

vi.mock("expo-secure-store", () => ({
  getItemAsync: async (key: string) => secure.store.get(key) ?? null,
  setItemAsync: async (key: string, value: string) => {
    secure.store.set(key, value);
  },
  deleteItemAsync: async (key: string) => {
    secure.store.delete(key);
  },
}));

import { createEncryptedStorageCipher, passthroughCipher, type Cipher } from "@/lib/storage/crypto";
import { createSecureKV, type SecureStoreBackend } from "@/lib/storage/secureKV";
import { SECURE_INDEX_KEY, secureStorage } from "@/lib/storage/secureStorage";

function memoryBackend(): SecureStoreBackend & { values: Map<string, string> } {
  const values = new Map<string, string>();
  return {
    values,
    getItem: async (key) => values.get(key) ?? null,
    setItem: async (key, value) => {
      values.set(key, value);
    },
    deleteItem: async (key) => {
      values.delete(key);
    },
  };
}

describe("crypto", () => {
  it("defaults to an identity cipher and returns the supplied cipher unchanged", async () => {
    expect(await passthroughCipher.encrypt("secret", "key")).toBe("secret");
    expect(await passthroughCipher.decrypt("secret", "key")).toBe("secret");

    const custom: Cipher = { encrypt: async (text) => `x${text}`, decrypt: async (text) => text.slice(1) };
    expect(createEncryptedStorageCipher(custom)).toBe(custom);
  });
});

describe("createSecureKV", () => {
  it("round-trips JSON values and returns null for a missing key", async () => {
    const backend = memoryBackend();
    const kv = createSecureKV({ store: backend });

    await expect(kv.get("user")).resolves.toBeNull();
    await kv.set("user", { id: "1", roles: ["admin"] });

    expect(backend.values.get("user")).toBe('{"id":"1","roles":["admin"]}');
    await expect(kv.get("user")).resolves.toEqual({ id: "1", roles: ["admin"] });

    await kv.remove("user");
    await expect(kv.get("user")).resolves.toBeNull();
  });

  it("encrypts on write and decrypts on read with the master key", async () => {
    const backend = memoryBackend();
    const cipher: Cipher = {
      encrypt: vi.fn(async (text: string, key: string) => `enc(${key}):${text}`),
      decrypt: vi.fn(async (text: string, key: string) => text.replace(`enc(${key}):`, "")),
    };
    const kv = createSecureKV({ store: backend, cipher, key: "master" });

    await kv.set("token", "abc");
    expect(backend.values.get("token")).toBe('enc(master):"abc"');
    await expect(kv.get("token")).resolves.toBe("abc");
    expect(cipher.encrypt).toHaveBeenCalledWith('"abc"', "master");
    expect(cipher.decrypt).toHaveBeenCalledWith('enc(master):"abc"', "master");
  });
});

describe("secureStorage", () => {
  beforeEach(() => {
    secure.store.clear();
  });

  it("stores, reads and removes JSON values", async () => {
    await secureStorage.set("session", { token: "t" });
    await expect(secureStorage.get("session")).resolves.toEqual({ token: "t" });
    await expect(secureStorage.get("missing")).resolves.toBeNull();

    await secureStorage.remove("session");
    await expect(secureStorage.get("session")).resolves.toBeNull();
  });

  it("clears only the keys it wrote and forgets its index", async () => {
    secure.store.set("external", "keep");
    await secureStorage.set("a", 1);
    await secureStorage.set("b", 2);

    await secureStorage.clear();

    expect(secure.store.get("external")).toBe("keep");
    expect(secure.store.has("a")).toBe(false);
    expect(secure.store.has("b")).toBe(false);
    expect(secure.store.has(SECURE_INDEX_KEY)).toBe(false);
  });
});
