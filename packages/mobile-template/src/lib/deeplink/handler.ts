import { router } from "expo-router";
import { parseDeepLink, type DeepLinkConfig } from "./parseDeepLink";

export function handleDeepLink(value: string, config: DeepLinkConfig): boolean {
  const parsed = parseDeepLink(value, config);
  if (!parsed) return false;
  router.push(parsed.pathname as never);
  return true;
}
