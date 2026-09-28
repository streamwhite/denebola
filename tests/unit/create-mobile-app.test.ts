import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, relative } from "node:path";
import { afterAll, describe, expect, it } from "vitest";

const TEMPLATE_PACKAGE = "denebola";
const CREATE_BIN = join(process.cwd(), "packages/create-mobile-app/bin/create.js");
const DOCTOR_BIN = join(process.cwd(), "packages/mobile-template/bin/doctor.mjs");
const PLACEHOLDERS = /\{\{(name|packageName|appId|scheme)\}\}/;
const PROJECT_NAME = "fixture-app";
const workDir = mkdtempSync(join(tmpdir(), "create-mobile-app-"));
const projectDir = join(workDir, PROJECT_NAME);

function runCreate(...args: string[]) {
  return execFileSync(process.execPath, [CREATE_BIN, ...args], { cwd: workDir, encoding: "utf8" });
}

function listFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const child = join(dir, entry.name);
    return entry.isDirectory() ? listFiles(child) : [child];
  });
}

function read(relativePath: string) {
  return readFileSync(join(projectDir, relativePath), "utf8");
}

afterAll(() => rmSync(workDir, { recursive: true, force: true }));

describe("create-mobile-app", () => {
  it("scaffolds a project that installs the runtime package plus the Expo tooling it must own", () => {
    expect(runCreate(PROJECT_NAME)).toContain(`Created ${PROJECT_NAME}`);

    const manifest = JSON.parse(read("package.json"));
    expect(manifest.name).toBe(PROJECT_NAME);
    expect(manifest.dependencies[TEMPLATE_PACKAGE]).toMatch(/^\^\d+\.\d+\.\d+$/);
    expect(manifest.scripts["denebola:doctor"]).toBe("denebola-doctor");
    expect(manifest.scripts["denebola:migrate"]).toBe("denebola-migrate");
    expect(manifest.scripts.test).toBe("vitest run");
    for (const tool of ["expo", "expo-router", "react", "react-native", "nativewind", "react-intl", "@tanstack/react-query", "react-hook-form", "zod"]) {
      expect(manifest.dependencies).toHaveProperty(tool);
    }
    expect(manifest.devDependencies).toHaveProperty("vitest");
  });

  it("writes the generated entry files, resolving every placeholder", () => {
    const files = listFiles(projectDir).map((file) => relative(projectDir, file));

    expect(files).toEqual(
      expect.arrayContaining([
        "app.config.ts",
        "babel.config.js",
        "metro.config.js",
        ".env.example",
        "src/app/_layout.tsx",
        "src/app/settings.tsx",
        "src/messages.ts",
        "src/features/home/HomeScreen.tsx",
        "src/features/settings/SettingsScreen.tsx",
        "src/lib/api.ts",
        "tests/messages.test.ts",
      ]),
    );

    for (const file of files.filter((value) => /\.(ts|tsx|js|mjs|json)$/.test(value))) {
      const content = readFileSync(join(projectDir, file), "utf8");
      expect(content, file).not.toMatch(PLACEHOLDERS);
      expect(content, file).not.toContain("../../../");
    }
  });

  it("derives a valid app id and scheme even when the project name has invalid characters", () => {
    const dashed = "My-Cool.App";
    const dashedDir = join(workDir, dashed);
    execFileSync(process.execPath, [CREATE_BIN, dashed], { cwd: workDir, encoding: "utf8" });

    const config = readFileSync(join(dashedDir, "app.config.ts"), "utf8");
    const appId = /bundleIdentifier: "([^"]+)"/.exec(config)?.[1] ?? "";
    const scheme = /scheme: "([^"]+)"/.exec(config)?.[1] ?? "";

    // Java package rules: alphanumeric segments, each starting with a letter.
    expect(appId).toBe("com.example.mycoolapp");
    expect(appId.split(".").every((segment) => /^[a-z][a-z0-9]*$/.test(segment))).toBe(true);
    expect(appId).not.toContain("-");
    expect(scheme).toBe("mycoolapp");
    expect(JSON.parse(readFileSync(join(dashedDir, "package.json"), "utf8")).name).toBe("my-cool-app");
  });

  it("wires the provider and the config plugin to the runtime package", () => {
    expect(read("src/app/_layout.tsx")).toContain(`from "${TEMPLATE_PACKAGE}"`);
    expect(read("app.config.ts")).toContain(`"${TEMPLATE_PACKAGE}"`);
  });

  it("scans the runtime package source so framework className utilities are generated", () => {
    // Without this the framework components render unstyled: tailwind never sees their classes.
    const tailwind = read("tailwind.config.js");
    expect(tailwind).toContain(TEMPLATE_PACKAGE);
    expect(tailwind).toContain("src/**/*.{js,jsx,ts,tsx}");
    expect(tailwind).toContain("content:");
  });

  it("wires app-owned messages into the provider so UI text stays externalized", () => {
    expect(read("src/app/_layout.tsx")).toContain('import { appMessages } from "../messages"');
    expect(read("src/app/_layout.tsx")).toContain("locale={{ source: appMessages }}");
    expect(read("src/messages.ts")).toContain('"home.title"');
  });

  it("refuses to overwrite a non-empty directory", () => {
    expect(() => runCreate(PROJECT_NAME)).toThrow();
  });

  it("reports the missing runtime package before dependencies are installed", () => {
    let stderr = "";
    try {
      execFileSync(process.execPath, [DOCTOR_BIN], { cwd: projectDir, encoding: "utf8" });
    } catch (error) {
      stderr = String((error as { stderr?: string }).stderr ?? "");
    }

    expect(stderr).toContain("is not installed");
  });
});
