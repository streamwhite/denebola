import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";

const TEMPLATE_PACKAGE = "@your-scope/mobile-template";
const UPDATE_BIN = join(process.cwd(), "packages/mobile-template/bin/update.mjs");
const OFFLINE_REGISTRY = "http://127.0.0.1:9";
const workDir = mkdtempSync(join(tmpdir(), "update-"));
let fixtures = 0;

function writeInstalled(root: string, name: string, manifest: Record<string, unknown>) {
  const dir = join(root, "node_modules", ...name.split("/"));
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "package.json"), JSON.stringify(manifest));
}

function makeFixture(versions: { expo: string; react: string; reactNative: string }) {
  const root = join(workDir, `fixture-${fixtures++}`);
  mkdirSync(root, { recursive: true });
  writeInstalled(root, TEMPLATE_PACKAGE, {
    name: TEMPLATE_PACKAGE,
    version: "0.1.0",
    dependencies: { expo: "~57.0.23" },
    peerDependencies: { react: "~19.2.0", "react-native": "~0.86.0" },
  });
  writeInstalled(root, "expo", { name: "expo", version: versions.expo });
  writeInstalled(root, "react", { name: "react", version: versions.react });
  writeInstalled(root, "react-native", { name: "react-native", version: versions.reactNative });
  return root;
}

function runUpdate(root: string) {
  return execFileSync(process.execPath, [UPDATE_BIN], {
    cwd: root,
    encoding: "utf8",
    env: { ...process.env, NPM_CONFIG_REGISTRY: OFFLINE_REGISTRY },
  });
}

afterAll(() => rmSync(workDir, { recursive: true, force: true }));

describe("mobile-template-update", () => {
  it("reports health, upgrade type, compatibility and a dry-run plan", () => {
    const out = runUpdate(makeFixture({ expo: "57.0.23", react: "19.2.4", reactNative: "0.86.3" }));

    expect(out).toContain("Project health");
    expect(out).toContain("Upgrade");
    expect(out).toContain("up-to-date");
    expect(out).toContain("native stack matches the template line");
    expect(out).toContain("Dry run");
  });

  it("requires a native rebuild when the installed native stack drifts", () => {
    const out = runUpdate(makeFixture({ expo: "58.0.0", react: "19.2.4", reactNative: "0.87.1" }));

    expect(out).toContain("native rebuild required");
    expect(out).toContain("expo: expected ~57.0.23, installed 58.0.0");
  });

  it("fails when the runtime package is not installed", () => {
    const root = join(workDir, `empty-${fixtures++}`);
    mkdirSync(root, { recursive: true });

    let status = 0;
    try {
      runUpdate(root);
    } catch (error) {
      status = (error as { status?: number }).status ?? 0;
    }

    expect(status).not.toBe(0);
  });
});
