#!/usr/bin/env node
// Applies versioned migrations to framework-generated consumer files.
// Safe by design: it plans first, refuses to write on conflict or missing files, backs up
// every changed file, and records applied migration ids. Business files are never touched
// because only paths declared by a migration are considered.
import { createHash } from "node:crypto";
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { pathToFileURL } from "node:url";

export const STATE_FILE = ".mobile-template-migrations.json";
export const BACKUP_SUFFIX = ".bak";
const DEFAULT_MIGRATIONS = new URL("../migrations/index.mjs", import.meta.url);

export function checksum(content) {
  return createHash("sha256").update(content).digest("hex");
}

export function planMigrations({ migrations, applied, read }) {
  const actions = [];
  for (const migration of migrations) {
    if (applied.includes(migration.id)) continue;
    for (const file of migration.files) {
      const current = read(file.path);
      if (current === null) {
        actions.push({ id: migration.id, path: file.path, status: "missing" });
        continue;
      }
      const next = file.transform(current);
      const status = checksum(current) === file.previousChecksum ? "apply" : current === next ? "uptodate" : "conflict";
      actions.push({ id: migration.id, path: file.path, status, next });
    }
  }
  return { actions, conflicts: actions.filter((action) => action.status === "conflict" || action.status === "missing") };
}

function parseArgs(argv) {
  const index = argv.indexOf("--migrations");
  return { dryRun: argv.includes("--dry-run"), migrationsPath: index >= 0 ? argv[index + 1] : null };
}

function readState(cwd) {
  const file = resolve(cwd, STATE_FILE);
  if (!existsSync(file)) return [];
  try {
    const value = JSON.parse(readFileSync(file, "utf8"));
    return Array.isArray(value.applied) ? value.applied : [];
  } catch {
    return [];
  }
}

async function loadMigrations(path) {
  const target = path ? pathToFileURL(resolve(path)) : DEFAULT_MIGRATIONS;
  const module = await import(target.href);
  return module.migrations ?? [];
}

function completedIds(migrations, actions, applied) {
  return migrations
    .filter((migration) => !applied.includes(migration.id))
    .filter((migration) => migration.files.every((file) => {
      const action = actions.find((item) => item.id === migration.id && item.path === file.path);
      return action && action.status !== "conflict" && action.status !== "missing";
    }))
    .map((migration) => migration.id);
}

async function main() {
  const { dryRun, migrationsPath } = parseArgs(process.argv.slice(2));
  const cwd = process.cwd();
  const migrations = await loadMigrations(migrationsPath);
  const applied = readState(cwd);
  const read = (path) => {
    const file = resolve(cwd, path);
    return existsSync(file) ? readFileSync(file, "utf8") : null;
  };
  const { actions, conflicts } = planMigrations({ migrations, applied, read });

  if (actions.length === 0) {
    console.log("No migrations to apply.");
    return;
  }
  for (const action of actions) console.log(`${action.status.padEnd(9)} ${action.path}  (${action.id})`);

  if (dryRun) {
    console.log(`\nDry run: ${actions.filter((action) => action.status === "apply").length} file(s) would change.`);
    return;
  }
  if (conflicts.length > 0) {
    console.error(`\nAborted: ${conflicts.length} file(s) conflict or are missing. No changes written.`);
    process.exitCode = 1;
    return;
  }

  for (const action of actions.filter((item) => item.status === "apply")) {
    const file = resolve(cwd, action.path);
    mkdirSync(dirname(file), { recursive: true });
    if (existsSync(file) && !existsSync(`${file}${BACKUP_SUFFIX}`)) copyFileSync(file, `${file}${BACKUP_SUFFIX}`);
    writeFileSync(file, action.next);
  }
  const ids = completedIds(migrations, actions, applied);
  writeFileSync(resolve(cwd, STATE_FILE), `${JSON.stringify({ applied: [...applied, ...ids] }, null, 2)}\n`);
  console.log(`\nApplied ${ids.length} migration(s). Backups use ${BACKUP_SUFFIX}.`);
}

const invoked = process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href;
if (invoked) main().catch((error) => { console.error(error); process.exitCode = 1; });
