import { describe, expect, it } from "vitest";
import { createFileCache } from "@/lib/files/fileCache";
import type { FileStore } from "@/lib/files/files";
import { createMemoryStorage } from "@/lib/storage/memoryStorage";

function createFakeStore() {
  const downloads: string[] = [];
  const removed: string[] = [];
  const store: FileStore = {
    async download(url) {
      downloads.push(url);
      return `file:///cache/${encodeURIComponent(url)}`;
    },
    async remove(uri) {
      removed.push(uri);
    },
  };
  return { store, downloads, removed };
}

describe("createFileCache", () => {
  it("downloads a remote file once and reuses the local uri", async () => {
    const fake = createFakeStore();
    const cache = createFileCache({ store: fake.store, storage: createMemoryStorage() });

    expect(await cache.resolve("https://x/a.pdf")).toBe("file:///cache/https%3A%2F%2Fx%2Fa.pdf");
    expect(await cache.resolve("https://x/a.pdf")).toBe("file:///cache/https%3A%2F%2Fx%2Fa.pdf");

    expect(fake.downloads).toEqual(["https://x/a.pdf"]);
  });

  it("invalidates the cached file and clears the store", async () => {
    const fake = createFakeStore();
    const cache = createFileCache({ store: fake.store, storage: createMemoryStorage() });
    const uri = await cache.resolve("https://x/a.pdf");

    await cache.invalidate("https://x/a.pdf");
    expect(fake.removed).toEqual([uri]);

    await cache.resolve("https://x/a.pdf");
    await cache.clear();
    expect(fake.removed).toHaveLength(2);
  });
});
