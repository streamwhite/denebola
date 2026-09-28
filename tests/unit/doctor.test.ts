import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";

const TEMPLATE_PACKAGE = "denebola";
const DOCTOR_BIN = join(process.cwd(), "packages/mobile-template/bin/doctor.mjs");
// A registry that refuses connections immediately, so the doctor stays offline and deterministic.
const OFFLINE_REGISTRY = "http://127.0.0.1:9";
const workDir = mkdtempSync(join(tmpdir(), "doctor-"));
let fixtures = 0;

function writeInstalled(root: string, name: string, manifest: Record<string, unknown>) {
  const dir = join(root, "node_modules", ...name.split("/"));
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "package.json"), JSON.stringify(manifest));
}

function runDoctor(versions: { expo: string; react: string; reactNative: string }) {
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
  return execFileSync(process.execPath, [DOCTOR_BIN], {
    cwd: root,
    encoding: "utf8",
    env: { ...process.env, NPM_CONFIG_REGISTRY: OFFLINE_REGISTRY },
  });
}

afterAll(() => rmSync(workDir, { recursive: true, force: true }));

describe("denebola-doctor", () => {
  it("reports the expected and installed React and React Native lines", () => {
    const out = runDoctor({ expo: "57.0.23", react: "19.2.4", reactNative: "0.86.3" });

    expect(out).toContain("react expected");
    expect(out).toContain("~19.2.0");
    expect(out).toContain("react-native expected");
    expect(out).toContain("~0.86.0");
  });

  it("says no rebuild is needed when the installed native stack matches", () => {
    const out = runDoctor({ expo: "57.0.23", react: "19.2.4", reactNative: "0.86.3" });

    expect(out).toContain("not required for JavaScript-only changes");
  });

  it("requires a rebuild when the installed Expo line drifts from the template", () => {
    const out = runDoctor({ expo: "58.0.0", react: "19.2.4", reactNative: "0.87.1" });

    expect(out).toContain("required: installed native stack drifts from the template");
  });
});
