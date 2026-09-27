import { isNewer, parseSemver } from "./semver";

export type CompatibilityEntry = {
  framework: string;
  expo: string;
  react: string;
  reactNative: string;
};

// Supported framework release lines and the native stack each integrates.
// A new entry is added when a release raises the bundled Expo/React Native line.
export const VERSION_MATRIX: readonly CompatibilityEntry[] = [
  { framework: "0.1", expo: "~57.0.0", react: "~19.2.0", reactNative: "~0.86.0" },
];

export type ProjectStack = {
  framework: string;
  expo?: string;
  react?: string;
  reactNative?: string;
};

export type CompatibilityIssue = { dependency: string; expected: string; actual: string };

export type CompatibilityResult = {
  supported: boolean;
  entry: CompatibilityEntry | null;
  issues: CompatibilityIssue[];
  nativeRebuild: boolean;
};

function differs(expected: string | undefined, actual: string | undefined): boolean {
  const a = parseSemver(expected);
  const b = parseSemver(actual);
  if (!a || !b) return false;
  return a.major !== b.major || a.minor !== b.minor;
}

// Matches the project's framework line to a matrix row and flags native-stack drift.
export function checkCompatibility(stack: ProjectStack): CompatibilityResult {
  const line = parseSemver(stack.framework);
  const entry = line ? (VERSION_MATRIX.find((row) => parseSemver(row.framework)?.minor === line.minor) ?? null) : null;
  if (!entry) return { supported: false, entry: null, issues: [{ dependency: "framework", expected: VERSION_MATRIX.map((row) => row.framework).join(", "), actual: stack.framework }], nativeRebuild: true };

  const issues: CompatibilityIssue[] = (
    [
      ["expo", entry.expo, stack.expo],
      ["react", entry.react, stack.react],
      ["react-native", entry.reactNative, stack.reactNative],
    ] as const
  )
    .filter(([, expected, actual]) => differs(expected, actual))
    .map(([dependency, expected, actual]) => ({ dependency, expected, actual: actual ?? "not installed" }));

  return { supported: issues.length === 0, entry, issues, nativeRebuild: issues.length > 0 };
}

export function latestCompatibleLine(): string {
  return VERSION_MATRIX[VERSION_MATRIX.length - 1]?.framework ?? "0.0";
}

export function upgradeAvailable(current: string): boolean {
  return isNewer(latestCompatibleLine(), current);
}
