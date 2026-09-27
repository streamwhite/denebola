export type DependencyPolicy = {
  blocked: readonly string[];
  allowed?: readonly string[];
};

export type DependencyViolation = { name: string; reason: "blocked" | "not-allowed" };

export type DependencyAuditResult = { ok: boolean; violations: DependencyViolation[] };

// Package-prefix aware matching: a policy entry "@scope" also covers "@scope/pkg".
function matches(name: string, pattern: string): boolean {
  return name === pattern || name.startsWith(`${pattern}/`);
}

// Audits resolved dependency names against a policy (blocklist, optional allowlist).
export function auditDependencies(dependencies: Record<string, unknown>, policy: DependencyPolicy): DependencyAuditResult {
  const violations = Object.keys(dependencies).flatMap((name): DependencyViolation[] => {
    if (policy.blocked.some((pattern) => matches(name, pattern))) return [{ name, reason: "blocked" }];
    if (policy.allowed && !policy.allowed.some((pattern) => matches(name, pattern))) return [{ name, reason: "not-allowed" }];
    return [];
  });
  return { ok: violations.length === 0, violations };
}
