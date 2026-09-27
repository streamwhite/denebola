import { router } from "expo-router";
import { buildPath, type QueryParams } from "./navigationCore";

const PRESENTATION_MODAL = "modal" as const;

export const modalScreenOptions = { presentation: PRESENTATION_MODAL };

export const navigation = {
  push: (path: string, params?: QueryParams) => router.push(buildPath(path, params) as never),
  replace: (path: string, params?: QueryParams) => router.replace(buildPath(path, params) as never),
  back: () => router.back(),
  dismiss: () => router.dismiss(),
  canGoBack: () => router.canGoBack(),
  href: buildPath,
};

export function openModal(path: string, params?: QueryParams): void {
  navigation.push(path, params);
}
