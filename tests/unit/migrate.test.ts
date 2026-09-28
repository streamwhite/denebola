import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";

const MIGRATE_BIN = join(process.cwd(), "packages/mobile-template/bin/migrate.mjs");
const OLD_CONTENT = "export default function RootLayout() { return <Stack /> }\n";
const NEW_CONTENT = "export default function RootLayout() { return <Stack screenOptions={{ headerShown: false }} /> }\n";
const workDir = mkdtempSync(join(tmpdir(), "migrate-"));
let fixtures = 0;

const checksum = (content: string) => createHash("sha256").update(content).digest("hex");

function migrationFixture(previousChecksum: string) {
  return `export const migrations = [{ id: "2026-01-layout", description: "test", files: [{ path: "src/app/_layout.tsx", previousChecksum: ${JSON.stringify(previousChecksum)}, transform: (content) => content.replace("<Stack />", "<Stack screenOptions={{ headerShown: false }} />") }] }];\n`;
}

function makeFixture(previousChecksum: string) {
  const root = join(workDir, `fixture-${fixtures++}`);
  mkdirSync(join(root, "src/app"), { recursive: true });
  writeFileSync(join(root, "src/app/_layout.tsx"), OLD_CONTENT);
  const migrationsPath = join(root, "migrations.mjs");
  writeFileSync(migrationsPath, migrationFixture(previousChecksum));
  return { root, migrationsPath };
}

function run(root: string, migrationsPath: string, extra: string[] = []) {
  return execFileSync(process.execPath, [MIGRATE_BIN, "--migrations", migrationsPath, ...extra], { cwd: root, encoding: "utf8" });
}

const readLayout = (root: string) => readFileSync(join(root, "src/app/_layout.tsx"), "utf8");

afterAll(() => rmSync(workDir, { recursive: true, force: true }));

describe("denebola-migrate", () => {
  it("reports planned changes without writing during a dry run", () => {
    const { root, migrationsPath } = makeFixture(checksum(OLD_CONTENT));

    const out = run(root, migrationsPath, ["--dry-run"]);

    expect(out).toContain("apply");
    expect(out).toContain("Dry run");
    expect(readLayout(root)).toBe(OLD_CONTENT);
  });

  it("applies the migration, backs up the file and records the applied id", () => {
    const { root, migrationsPath } = makeFixture(checksum(OLD_CONTENT));

    run(root, migrationsPath);

    expect(readLayout(root)).toBe(NEW_CONTENT);
    expect(readFileSync(`${join(root, "src/app/_layout.tsx")}.bak`, "utf8")).toBe(OLD_CONTENT);
    expect(JSON.parse(readFileSync(join(root, ".denebola-migrations.json"), "utf8")).applied).toEqual(["2026-01-layout"]);
  });

  it("is idempotent once a migration has been applied", () => {
    const { root, migrationsPath } = makeFixture(checksum(OLD_CONTENT));
    run(root, migrationsPath);

    expect(run(root, migrationsPath)).toContain("No migrations to apply.");
  });

  it("refuses to overwrite a consumer edit and writes nothing", () => {
    const { root, migrationsPath } = makeFixture(checksum(OLD_CONTENT));
    const edited = "export default function RootLayout() { return <Stack /> } // consumer edit\n";
    writeFileSync(join(root, "src/app/_layout.tsx"), edited);

    let status = 0;
    try {
      run(root, migrationsPath);
    } catch (error) {
      status = (error as { status?: number }).status ?? 0;
    }

    expect(status).not.toBe(0);
    expect(readLayout(root)).toBe(edited);
    expect(existsSync(join(root, ".denebola-migrations.json"))).toBe(false);
  });
});
