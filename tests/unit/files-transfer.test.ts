import { describe, expect, it } from "vitest";
import { createMemoryFilePicker, createMemoryFileSystem, createMemoryShareAdapter } from "@/lib/files/memory";
import { exportFile, importFile, importTextFile, writeTextFile } from "@/lib/files/transfer";

describe("file transfer helpers", () => {
  it("exports a file through the share adapter", async () => {
    const share = createMemoryShareAdapter();

    await exportFile({ uri: "/docs/report.pdf", mimeType: "application/pdf" }, share);

    expect(share.shared).toEqual([{ uri: "/docs/report.pdf", title: "Export", mimeType: "application/pdf" }]);
  });

  it("imports the first picked file", async () => {
    const picker = createMemoryFilePicker([{ uri: "/in.txt", name: "in.txt" }]);

    expect(await importFile(picker)).toEqual({ uri: "/in.txt", name: "in.txt" });
    expect(await importFile(picker)).toBeNull();
  });

  it("imports and reads a text file", async () => {
    const fs = createMemoryFileSystem({ "/in.txt": "hello" });
    const picker = createMemoryFilePicker([{ uri: "/in.txt", name: "in.txt" }]);

    expect(await importTextFile(picker, fs)).toEqual({ file: { uri: "/in.txt", name: "in.txt" }, text: "hello" });
  });

  it("writes a text file", async () => {
    const fs = createMemoryFileSystem();

    expect(await writeTextFile(fs, "/out.txt", "data")).toBe("/out.txt");
    expect(await fs.readText("/out.txt")).toBe("data");
  });
});
