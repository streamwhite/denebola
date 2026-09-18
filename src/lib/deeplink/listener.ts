import * as Linking from "expo-linking";
import { handleDeepLink } from "@/lib/deeplink/handler";

export function subscribeToDeepLinks() {
  const subscription = Linking.addEventListener("url", ({ url }) => { handleDeepLink(url); });
  return () => subscription.remove();
}
