import { describe, expect, it } from "vitest";
import { createMemoryFilePicker, createMemoryFileSystem, createMemoryOpenFileAdapter, createMemoryShareAdapter } from "@/lib/files/memory";

describe("createMemoryFileSystem", () => {
  it("writes, reads, lists and removes files", async () => {
    const fs = createMemoryFileSystem({ "/docs/a.txt": "a" });

    await fs.writeText("/docs/b.txt", "b");

    expect(await fs.readText("/docs/a.txt")).toBe("a");
    expect(await fs.exists("/docs/b.txt")).toBe(true);
    expect((await fs.list("/docs")).sort()).toEqual(["/docs/a.txt", "/docs/b.txt"]);
    expect(await fs.info("/docs/a.txt")).toMatchObject({ uri: "/docs/a.txt", size: 1 });

    await fs.remove("/docs/a.txt");
    expect(await fs.exists("/docs/a.txt")).toBe(false);
  });

  it("rejects reading a missing file", async () => {
    const fs = createMemoryFileSystem();
    await expect(fs.readText("/missing")).rejects.toThrow("File not found");
  });
});

describe("memory picker/share/open adapters", () => {
  it("returns queued picks once", async () => {
    const picker = createMemoryFilePicker([{ uri: "/a", name: "a" }]);

    expect(await picker.pick()).toEqual([{ uri: "/a", name: "a" }]);
    expect(await picker.pick()).toEqual([]);
  });

  it("records shares", async () => {
    const share = createMemoryShareAdapter();

    await share.share({ uri: "/a", title: "A" });

    expect(share.shared).toEqual([{ uri: "/a", title: "A" }]);
  });

  it("records opened files", async () => {
    const open = createMemoryOpenFileAdapter();

    expect(await open.open("/a")).toBe(true);
    expect(open.opened).toEqual(["/a"]);
  });
});
