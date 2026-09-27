import { parseDeepLink, type DeepLinkConfig } from "../deeplink/parseDeepLink";
import { err, ok, type Result } from "../utils/result";

export type DeepLinkError = "invalid-url" | "untrusted-scheme" | "disallowed-path";

// Validates an incoming deep link against the configured scheme and allowed paths, returning a
// typed error instead of navigating on an untrusted payload.
export function validateDeepLink(value: string, config: DeepLinkConfig): Result<{ pathname: string }, DeepLinkError> {
  let scheme: string;
  try {
    scheme = new URL(value).protocol.replace(":", "");
  } catch {
    return err("invalid-url");
  }
  if (scheme !== config.scheme) return err("untrusted-scheme");
  const parsed = parseDeepLink(value, config);
  return parsed ? ok(parsed) : err("disallowed-path");
}
