import { existsSync, readFileSync, readdirSync } from "node:fs";
import { isBuiltin } from "node:module";
import { join, relative, resolve, sep } from "node:path";
import { describe, expect, it } from "vitest";
import { templateVersion } from "@/lib/version/version";

const PACKAGES_DIR = join(process.cwd(), "packages");
const TEMPLATE_DIR = join(PACKAGES_DIR, "mobile-template");
const GENERATED_PROJECT_DIR = "template";
const SOURCE_EXTENSIONS = /\.(ts|tsx|js|mjs)$/;
const REGISTRY_URL = /https?:\/\/[^"']*registry/;
const IMPORT_PATTERN = /(?:^|\n)[ \t]*(?:import[\s{*][^"']*?from\s*|import\s*|export[^"']*?from\s*|require\(\s*|from\s*)["']([^"']+)["']/g;

type Manifest = { name: string; version: string; private?: boolean; license?: string; main?: string; bin?: Record<string, string>; files?: string[]; exports?: Record<string, unknown>; publishConfig?: { access?: string; registry?: string }; dependencies?: Record<string, string>; peerDependencies?: Record<string, string>; optionalDependencies?: Record<string, string>; devDependencies?: Record<string, string> };

const packageDirs = readdirSync(PACKAGES_DIR).map((name) => join(PACKAGES_DIR, name));
const readManifest = (dir: string): Manifest => JSON.parse(readFileSync(join(dir, "package.json"), "utf8"));

function listSourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (entry.name === "node_modules" || entry.name === GENERATED_PROJECT_DIR) return [];
    const child = join(dir, entry.name);
    if (entry.isDirectory()) return listSourceFiles(child);
    return SOURCE_EXTENSIONS.test(entry.name) ? [child] : [];
  });
}

function importedSpecifiers(file: string): string[] {
  return [...readFileSync(file, "utf8").matchAll(IMPORT_PATTERN)].map((match) => match[1]);
}

function packageNameOf(specifier: string): string {
  const [scope, name] = specifier.split("/");
  return specifier.startsWith("@") ? `${scope}/${name}` : scope;
}

function exportTargets(manifest: Manifest): string[] {
  return Object.values(manifest.exports ?? {}).flatMap((entry) =>
    typeof entry === "string" ? [entry] : Object.values(entry as Record<string, string>),
  );
}

describe("publishable packages", () => {
  it.each(packageDirs)("%s ships its entry points without being private", (dir) => {
    const manifest = readManifest(dir);

    expect(manifest.private).not.toBe(true);
    // Valid npm name, scoped (@scope/name) or unscoped (name).
    expect(manifest.name).toMatch(/^(?:@[^/]+\/)?[a-z0-9][a-z0-9._-]*$/);
    expect(manifest.version).toMatch(/^\d+\.\d+\.\d+/);
    expect(manifest.files?.length ?? 0).toBeGreaterThan(0);
    if (manifest.main) {
      expect(manifest.files?.some((entry) => manifest.main === entry || manifest.main?.startsWith(`${entry}/`))).toBe(true);
    }
    for (const bin of Object.values(manifest.bin ?? {})) {
      expect(manifest.files?.some((entry) => bin === entry || bin.startsWith(`${entry}/`))).toBe(true);
    }
    for (const target of exportTargets(manifest)) expect(existsSync(join(dir, target))).toBe(true);
  });

  it.each(packageDirs)("%s only imports files inside its own package root", (dir) => {
    for (const file of listSourceFiles(dir)) {
      for (const specifier of importedSpecifiers(file)) {
        if (!specifier.startsWith(".")) continue;
        const target = relative(dir, resolve(file, "..", specifier));
        expect(target.startsWith(`..${sep}`) || target === "..", `${file} imports ${specifier}`).toBe(false);
      }
    }
  });

  it.each(packageDirs)("%s declares every package it imports", (dir) => {
    const manifest = readManifest(dir);
    const declared = new Set([...Object.keys(manifest.dependencies ?? {}), ...Object.keys(manifest.peerDependencies ?? {}), ...Object.keys(manifest.devDependencies ?? {})]);

    for (const file of listSourceFiles(dir)) {
      for (const specifier of importedSpecifiers(file)) {
        if (specifier.startsWith(".") || isBuiltin(specifier)) continue;
        expect(declared.has(packageNameOf(specifier)), `${file} imports ${specifier}`).toBe(true);
      }
    }
  });

  it.each(packageDirs)("%s never hard-codes a registry URL", (dir) => {
    expect(readFileSync(join(dir, "package.json"), "utf8")).not.toMatch(REGISTRY_URL);
  });

  it.each(packageDirs)("%s publishes with a plain npm publish", (dir) => {
    const manifest = readManifest(dir);

    expect(manifest.license).toBeTruthy();
    expect(manifest.publishConfig?.access).toBe("public");
    for (const field of ["dependencies", "peerDependencies", "optionalDependencies"] as const) {
      const specs = Object.values(manifest[field] ?? {});
      expect(specs.some((spec) => spec.startsWith("workspace:")), `${dir} ${field} uses the workspace protocol`).toBe(false);
    }
  });
});

describe("runtime package dependencies", () => {
  const runtime = readManifest(TEMPLATE_DIR);
  const bundled = ["expo", "expo-router", "expo-constants", "expo-linking", "expo-secure-store", "expo-splash-screen", "expo-status-bar", "expo-localization", "expo-local-authentication", "@tanstack/react-query", "react-intl", "@react-native-community/netinfo", "@react-native-community/slider", "zustand"];

  it.each(bundled)("bundles %s so a package update raises that dependency", (name) => {
    expect(runtime.dependencies?.[name], `${name} must be a dependency of ${runtime.name}`).toBeTruthy();
  });

  it("keeps react and react-native as peer dependencies so the app has a single instance", () => {
    expect(runtime.peerDependencies).toHaveProperty("react");
    expect(runtime.peerDependencies).toHaveProperty("react-native");
    expect(runtime.dependencies ?? {}).not.toHaveProperty("react");
    expect(runtime.dependencies ?? {}).not.toHaveProperty("react-native");
  });

  it("constrains react and react-native to the release line of the bundled Expo SDK", () => {
    // Open-ended ranges let npm auto-install a newer react-native next to the bundled Expo SDK.
    for (const peer of ["react", "react-native"]) {
      expect(runtime.peerDependencies?.[peer], `${peer} must not be an open-ended range`).not.toMatch(/^[><=^]/);
    }
  });
});

describe("template metadata", () => {
  it("exposes the published version through templateVersion", () => {
    expect(templateVersion).toBe(readManifest(TEMPLATE_DIR).version);
    expect(templateVersion).toMatch(/^\d+\.\d+\.\d+/);
  });
});

describe("registry configuration", () => {
  const PRIVATE_REGISTRY = "https://registry.piaosiyuan.cn/js/";
  const PUBLIC_REGISTRY = "https://registry.npmjs.org/";

  it("resolves installs from npm (pnpm)", () => {
    const workspace = readFileSync(join(process.cwd(), "pnpm-workspace.yaml"), "utf8");

    expect(workspace).toContain("registries:");
    expect(workspace).toMatch(/default:\s*https:\/\/registry\.npmjs\.org\//);
  });

  it("publishes the unscoped packages to the private registry via an explicit registry", () => {
    const release = readFileSync(join(process.cwd(), "scripts/release.mjs"), "utf8");
    const workflow = readFileSync(join(process.cwd(), ".github/workflows/release.yml"), "utf8");

    expect(release).toContain(PRIVATE_REGISTRY);
    expect(workflow).toContain(PRIVATE_REGISTRY);
  });

  it("keeps npm config secret-free", () => {
    const npmrc = readFileSync(join(process.cwd(), ".npmrc"), "utf8");
    const directives = npmrc
      .split("\n")
      .filter((line) => !line.trim().startsWith("#"))
      .join("\n");

    expect(npmrc).toContain(PUBLIC_REGISTRY);
    // Secrets must come from the environment, never the repository.
    expect(directives).not.toMatch(/_authToken|password|:\s*npm_/i);
  });
});


describe("native toolchain versions", () => {
  // Reanimated and Worklets must move together; Reanimated 4.7 needs Worklets 0.13.x.
  // Pin both to the Expo SDK's bundled versions so a caret range cannot split the pair.
  const bundled = JSON.parse(readFileSync(join(process.cwd(), "node_modules/expo/bundledNativeModules.json"), "utf8"));
  const manifests = [readManifest(join(process.cwd())), readManifest(join(process.cwd(), "packages/create-mobile-app/template"))];

  it.each(["react-native-reanimated", "react-native-worklets"])("pins %s to the bundled Expo SDK version", (name) => {
    for (const manifest of manifests) {
      expect(manifest.dependencies?.[name], `${manifest.name} must declare ${name}`).toBe(bundled[name]);
    }
  });
});

