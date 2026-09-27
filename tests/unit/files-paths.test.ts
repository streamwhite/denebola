import { describe, expect, it } from "vitest";
import { fileExtension, fileNameFromUrl, joinPath, temporaryFileName } from "@/lib/files/paths";

describe("file paths", () => {
  it("joins directories and names without duplicating separators", () => {
    expect(joinPath("/docs/", "/a.txt")).toBe("/docs/a.txt");
    expect(joinPath("/docs", "a.txt")).toBe("/docs/a.txt");
  });

  it("reads extensions and ignores dotfiles", () => {
    expect(fileExtension("report.PDF")).toBe(".pdf");
    expect(fileExtension("archive.tar.gz")).toBe(".gz");
    expect(fileExtension("noext")).toBe("");
    expect(fileExtension(".gitignore")).toBe("");
  });

  it("derives a file name from a url", () => {
    expect(fileNameFromUrl("https://x/a/b%20c.pdf")).toBe("b c.pdf");
    expect(fileNameFromUrl("not a url")).toBe("download");
  });

  it("generates unique temporary names", () => {
    const first = temporaryFileName("tmp", ".jpg");
    const second = temporaryFileName("tmp", ".jpg");

    expect(first).toMatch(/^tmp-.+\.jpg$/);
    expect(second).not.toBe(first);
  });
});
