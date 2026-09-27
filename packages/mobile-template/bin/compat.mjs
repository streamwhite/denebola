#!/usr/bin/env node
// Minimal semver + compatibility helpers shared by the CLI binaries.
// Mirrors the runtime contract in src/lib/version so the CLI needs no build step.
const SEMVER = /(\d+)(?:\.(\d+))?(?:\.(\d+))?/;

export function parseSemver(range) {
  const match = String(range ?? "").match(SEMVER);
  if (!match) return null;
  return { major: Number(match[1]), minor: Number(match[2] ?? 0), patch: Number(match[3] ?? 0) };
}

export function isNewer(candidate, current) {
  const next = parseSemver(candidate);
  const base = parseSemver(current);
  return next !== null && base !== null && (next.major - base.major || next.minor - base.minor || next.patch - base.patch) > 0;
}

export function isBreaking(from, to) {
  const before = parseSemver(from);
  const after = parseSemver(to);
  return before !== null && after !== null && after.major > before.major;
}

export function sameLine(a, b) {
  const x = parseSemver(a);
  const y = parseSemver(b);
  return x !== null && y !== null && x.major === y.major && x.minor === y.minor;
}
