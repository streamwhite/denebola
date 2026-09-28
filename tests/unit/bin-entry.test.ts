import { mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { afterAll, describe, expect, it } from "vitest";
import { isEntryPoint } from "../../packages/mobile-template/bin/entry.mjs";

const workDir = mkdtempSync(join(tmpdir(), "entry-"));
afterAll(() => rmSync(workDir, { recursive: true, force: true }));

describe("isEntryPoint", () => {
  it("matches an exact entry path", () => {
    const file = join(workDir, "cli.mjs");
    writeFileSync(file, "");
    expect(isEntryPoint(pathToFileURL(file).href, file)).toBe(true);
  });

  it("matches when invoked through a package-manager symlink", () => {
    const real = join(workDir, "real.mjs");
    const pkgDir = join(workDir, "pkg", "bin");
    const link = join(pkgDir, "linked.mjs");
    writeFileSync(real, "");
    mkdirSync(pkgDir, { recursive: true });
    symlinkSync(real, link);

    expect(isEntryPoint(pathToFileURL(real).href, link)).toBe(true);
  });

  it("does not match a different module or a missing argv", () => {
    const file = join(workDir, "cli.mjs");
    expect(isEntryPoint(pathToFileURL(file).href, join(workDir, "other.mjs"))).toBe(false);
    expect(isEntryPoint(pathToFileURL(file).href, undefined)).toBe(false);
  });
});
