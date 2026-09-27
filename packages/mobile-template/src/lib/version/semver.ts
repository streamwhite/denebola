export type Semver = { major: number; minor: number; patch: number };

const SEMVER = /(\d+)(?:\.(\d+))?(?:\.(\d+))?/;

// Minimal, tolerant semver parse: `~57.0.23`, `>=10.0.0`, `57` all reduce to their numbers.
export function parseSemver(range: string | undefined): Semver | null {
  const match = String(range ?? "").match(SEMVER);
  if (!match) return null;
  return { major: Number(match[1]), minor: Number(match[2] ?? 0), patch: Number(match[3] ?? 0) };
}

export function compareSemver(a: Semver, b: Semver): number {
  return a.major - b.major || a.minor - b.minor || a.patch - b.patch;
}

export function isNewer(candidate: string | undefined, current: string | undefined): boolean {
  const next = parseSemver(candidate);
  const base = parseSemver(current);
  return next !== null && base !== null && compareSemver(next, base) > 0;
}

// Breaks only when the major line changes; minors and patches are additive.
export function isBreaking(from: string | undefined, to: string | undefined): boolean {
  const before = parseSemver(from);
  const after = parseSemver(to);
  return before !== null && after !== null && after.major > before.major;
}

export type ChangeSeverity = "breaking" | "feature" | "fix";

export function classifyChange(from: string | undefined, to: string | undefined): ChangeSeverity {
  const before = parseSemver(from);
  const after = parseSemver(to);
  if (!before || !after || compareSemver(after, before) <= 0) return "fix";
  if (after.major > before.major) return "breaking";
  return after.minor > before.minor ? "feature" : "fix";
}
