#!/usr/bin/env node
// Automated package release: verifies, bumps versions, updates the changelog, publishes and tags.
//
//   node scripts/release.mjs patch            # bump patch, verify, publish (dry-run by default)
//   node scripts/release.mjs minor --publish  # bump minor and really publish
//   node scripts/release.mjs 1.2.0 --publish --tag
//
// Flags:
//   --publish   actually publish (without it, everything runs with `npm publish --dry-run`)
//   --tag       create a git tag `vX.Y.Z` after a successful publish
//   --no-commit commit the version bump (default: commit only when --publish is set)
//   --skip-checks  skip tests/typecheck (not recommended)
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { isBreaking, isNewer } from "../packages/mobile-template/bin/compat.mjs";

const REPO_ROOT = fileURLToPath(new URL("..", import.meta.url));
const PACKAGES = ["packages/mobile-template", "packages/create-mobile-app"];
const CHANGELOG = "CHANGELOG.md";
const BUMP_TYPES = ["patch", "minor", "major"];
// Packages publish to the public npm registry; override with NPM_REGISTRY_URL (e.g. a private mirror).
const REGISTRY = process.env.NPM_REGISTRY_URL ?? "https://registry.npmjs.org/";

const argv = process.argv.slice(2);
const bump = argv.find((arg) => !arg.startsWith("--"));
const publish = argv.includes("--publish");
const tag = argv.includes("--tag");
const skipChecks = argv.includes("--skip-checks");
// Commit the version bump when really publishing; dry-runs stay local unless --commit is passed.
const commit = argv.includes("--no-commit") ? false : argv.includes("--commit") || publish;

function run(command, args, options = {}) {
  return execFileSync(command, args, { cwd: REPO_ROOT, stdio: "inherit", ...options });
}

function capture(command, args) {
  return execFileSync(command, args, { cwd: REPO_ROOT, encoding: "utf8" }).trim();
}

function manifestPath(dir) {
  return join(REPO_ROOT, dir, "package.json");
}

function readManifest(dir) {
  return JSON.parse(readFileSync(manifestPath(dir), "utf8"));
}

function writeManifest(dir, manifest) {
  writeFileSync(manifestPath(dir), `${JSON.stringify(manifest, null, 2)}\n`);
}

export function nextVersion(current, bump) {
  const [major, minor, patch] = current.split(".").map(Number);
  if (bump === "major") return `${major + 1}.0.0`;
  if (bump === "minor") return `${major}.${minor + 1}.0`;
  if (bump === "patch") return `${major}.${minor}.${patch + 1}`;
  if (/^\d+\.\d+\.\d+$/.test(bump)) return bump;
  throw new Error(`Unknown bump: ${bump}. Use patch, minor, major or an explicit x.y.z.`);
}

// Moves the Unreleased changelog section under the new version and opens a fresh Unreleased block.
export function releaseChangelog(content, version) {
  const marker = "## [Unreleased]";
  const index = content.indexOf(marker);
  if (index === -1) return `${content}\n## [${version}]\n`;
  const head = content.slice(0, index);
  const rest = content.slice(index + marker.length);
  const nextSection = rest.search(/\n## \[/);
  const body = (nextSection === -1 ? rest : rest.slice(0, nextSection)).trim();
  const tail = nextSection === -1 ? "" : rest.slice(nextSection);
  const released = body.length > 0 ? `${marker}\n\n## [${version}]\n\n${body}\n${tail}` : `${marker}\n\n## [${version}]\n${tail}`;
  return `${head}${released}`.replace(/\n{3,}/g, "\n\n");
}

export function assertVersionOrder(current, next) {
  if (!isNewer(next, current)) throw new Error(`New version ${next} is not newer than ${current}`);
}

function verify() {
  if (skipChecks) return;
  console.log("==> tests");
  run("pnpm", ["test:packages"]);
  console.log("==> typecheck");
  run("pnpm", ["typecheck"]);
  console.log("==> publishability");
  run("pnpm", ["publish:dry-run"]);
}

function bumpAll(version) {
  for (const dir of PACKAGES) {
    const manifest = readManifest(dir);
    manifest.version = version;
    writeManifest(dir, manifest);
  }
  const changelogPath = join(REPO_ROOT, CHANGELOG);
  const changelog = readFileSync(changelogPath, "utf8");
  writeFileSync(changelogPath, releaseChangelog(changelog, version));
}

function publishAll() {
  for (const dir of PACKAGES) {
    const args = ["publish", "--access", "public", "--registry", REGISTRY];
    if (!publish) args.push("--dry-run");
    console.log(`==> npm publish (${publish ? "real" : "dry-run"}) to ${REGISTRY} in ${dir}`);
    run("npm", args, { cwd: join(REPO_ROOT, dir) });
  }
}

function tagRelease(version) {
  const name = `v${version}`;
  if (capture("git", ["tag", "--list", name])) {
    console.log(`==> tag ${name} already exists`);
    return;
  }
  console.log(`==> git tag ${name}`);
  run("git", ["tag", "-a", name, "-m", `Release ${name}`]);
}

function commitRelease(version) {
  console.log("==> git commit version bump");
  run("git", ["add", ...PACKAGES.map((dir) => join(dir, "package.json")), CHANGELOG]);
  run("git", ["commit", "-m", `chore(release): ${version}`]);
}

function main() {
  if (!bump) throw new Error("Usage: node scripts/release.mjs <patch|minor|major|x.y.z> [--publish] [--tag]");
  const current = readManifest(PACKAGES[0]).version;
  const version = nextVersion(current, bump);
  assertVersionOrder(current, version);

  console.log(`==> release ${current} -> ${version} (${isBreaking(current, version) ? "breaking" : BUMP_TYPES.includes(bump) ? bump : "explicit"})`);
  verify();
  bumpAll(version);
  publishAll();
  if (commit) commitRelease(version);
  if (tag) tagRelease(version);
  console.log(`==> done${publish ? "" : " (dry-run; re-run with --publish to upload)"}`);
}

const invoked = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (invoked) {
  try {
    main();
  } catch (error) {
    console.error(`release failed: ${error.message}`);
    process.exitCode = 1;
  }
}
