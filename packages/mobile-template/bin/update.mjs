#!/usr/bin/env node
// `denebola-update` is the guided sync command: it reports health, checks native
// compatibility, classifies the version change, and plans framework-file migrations.
// It never writes unless `--apply` is passed, and it delegates writes to the migrate engine,
// which refuses to overwrite consumer-edited files.
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { isBreaking, isNewer, sameLine } from "./compat.mjs";
import { isEntryPoint } from "./entry.mjs";
import { healthRows, latestPublished, readStack, TEMPLATE_PACKAGE } from "./health.mjs";
import { planMigrations } from "./migrate.mjs";

const DEFAULT_MIGRATIONS = new URL("../migrations/index.mjs", import.meta.url);
const MIGRATE_BIN = fileURLToPath(new URL("./migrate.mjs", import.meta.url));

export function classifyUpgrade(current, latest) {
  if (!isNewer(latest, current)) return "up-to-date";
  return isBreaking(current, latest) ? "breaking" : "minor";
}

export function compatibilityIssues(stack) {
  const expectedExpo = stack.template.dependencies?.expo;
  const expectedNative = stack.template.peerDependencies?.["react-native"];
  const issues = [];
  if (!sameLine(expectedExpo, stack.expo?.version)) issues.push({ dependency: "expo", expected: expectedExpo, actual: stack.expo?.version ?? "not installed" });
  if (!sameLine(expectedNative, stack.reactNative?.version)) issues.push({ dependency: "react-native", expected: expectedNative, actual: stack.reactNative?.version ?? "not installed" });
  return issues;
}

async function loadMigrations() {
  const module = await import(DEFAULT_MIGRATIONS.href);
  return module.migrations ?? [];
}

function readState(cwd) {
  const file = resolve(cwd, ".denebola-migrations.json");
  if (!existsSync(file)) return [];
  try {
    const value = JSON.parse(readFileSync(file, "utf8"));
    return Array.isArray(value.applied) ? value.applied : [];
  } catch {
    return [];
  }
}

async function main() {
  const argv = process.argv.slice(2);
  const apply = argv.includes("--apply");
  const cwd = process.cwd();
  const stack = readStack(cwd);
  if (!stack) {
    console.error(`${TEMPLATE_PACKAGE} is not installed. Run: pnpm add ${TEMPLATE_PACKAGE}`);
    process.exit(1);
  }

  const latest = await latestPublished();
  console.log("Project health");
  for (const [label, value] of healthRows(stack, latest)) console.log(`  ${label.padEnd(22)} ${value}`);

  const classification = classifyUpgrade(stack.template.version, latest);
  console.log(`\nUpgrade\n  ${classification}  ${stack.template.version} -> ${latest}`);

  const issues = compatibilityIssues(stack);
  console.log(`\nCompatibility\n  ${issues.length === 0 ? "native stack matches the template line" : "native rebuild required"}`);
  for (const issue of issues) console.log(`  ${issue.dependency}: expected ${issue.expected}, installed ${issue.actual}`);

  const migrations = await loadMigrations();
  const applied = readState(cwd);
  const read = (path) => {
    const file = resolve(cwd, path);
    return existsSync(file) ? readFileSync(file, "utf8") : null;
  };
  const { actions, conflicts } = planMigrations({ migrations, applied, read });
  console.log(`\nMigrations\n  ${migrations.length === 0 ? "none registered" : `${actions.length} planned, ${conflicts.length} conflict`}`);
  for (const action of actions) console.log(`  ${action.status.padEnd(9)} ${action.path}  (${action.id})`);

  if (!apply) {
    console.log("\nDry run. Re-run with --apply to run migrations after upgrading the package.");
    return;
  }
  if (conflicts.length > 0) {
    console.log("\nSkipped: resolve conflicts first. No changes written.");
    process.exitCode = 1;
    return;
  }
  execFileSync(process.execPath, [MIGRATE_BIN, ...argv.filter((arg) => arg.startsWith("--migrations"))], { cwd, stdio: "inherit" });
}

const invoked = isEntryPoint(import.meta.url);
if (invoked) main().catch((error) => { console.error(error); process.exitCode = 1; });
