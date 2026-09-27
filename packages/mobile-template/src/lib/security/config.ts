export type CertificatePinning = { hosts: readonly string[] };

export type SecurityConfig = {
  allowCleartext: boolean;
  certificatePinning: CertificatePinning;
  minTlsVersion: "1.2" | "1.3";
  redactLogs: boolean;
  screenshotPrevention: boolean;
};

export const DEFAULT_SECURITY_CONFIG: SecurityConfig = {
  allowCleartext: false,
  certificatePinning: { hosts: [] },
  minTlsVersion: "1.2",
  redactLogs: true,
  screenshotPrevention: false,
};

export type SecurityIssueSeverity = "error" | "warning";
export type SecurityIssue = { code: string; message: string; severity: SecurityIssueSeverity };

export function normalizeSecurityConfig(partial: Partial<SecurityConfig> = {}): SecurityConfig {
  return { ...DEFAULT_SECURITY_CONFIG, ...partial, certificatePinning: { hosts: partial.certificatePinning?.hosts ?? [] } };
}

// Flags unsafe configuration; cleartext is an error in production, everything else a warning.
export function auditSecurityConfig(config: SecurityConfig, isProduction = false): SecurityIssue[] {
  const issues: SecurityIssue[] = [];
  if (config.allowCleartext) issues.push({ code: "cleartext", message: "Cleartext HTTP traffic is enabled", severity: isProduction ? "error" : "warning" });
  if (!config.redactLogs) issues.push({ code: "redact-logs", message: "Log redaction is disabled", severity: "warning" });
  if (isProduction && config.certificatePinning.hosts.length === 0) issues.push({ code: "no-pinning", message: "No certificate pinning hosts configured", severity: "warning" });
  return issues;
}

export function hasSecurityErrors(issues: readonly SecurityIssue[]): boolean {
  return issues.some((issue) => issue.severity === "error");
}
