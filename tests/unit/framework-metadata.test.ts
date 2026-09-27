import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { framework } from "@/lib/version/version";

const manifest = JSON.parse(readFileSync(join(process.cwd(), "packages/mobile-template/package.json"), "utf8"));

describe("framework metadata", () => {
  it("reports the runtime package identity and its integrated Expo version line", () => {
    expect(framework.name).toBe(manifest.name);
    expect(framework.version).toBe(manifest.version);
    expect(framework.expo).toBe(manifest.dependencies.expo);
  });

  it("reports the pinned React and React Native peer ranges", () => {
    expect(framework.react).toBe(manifest.peerDependencies.react);
    expect(framework.reactNative).toBe(manifest.peerDependencies["react-native"]);
  });
});
