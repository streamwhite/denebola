import * as Linking from "expo-linking";
import { handleDeepLink } from "./handler";
import type { DeepLinkConfig } from "./parseDeepLink";

export function subscribeToDeepLinks(config: DeepLinkConfig) {
  const subscription = Linking.addEventListener("url", ({ url }) => { handleDeepLink(url, config); });
  return () => subscription.remove();
}
