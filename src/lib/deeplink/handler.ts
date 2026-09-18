import { parseDeepLink } from "@/lib/deeplink/parseDeepLink";
import { router } from "expo-router";

export function handleDeepLink(value: string) { const parsed = parseDeepLink(value); if (!parsed) return false; router.push(parsed.pathname as never); return true; }
