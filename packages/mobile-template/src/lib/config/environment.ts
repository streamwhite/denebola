export type AppEnvironment = "development" | "preview" | "production";

export const APP_ENV_VAR = "EXPO_PUBLIC_APP_ENV";
const ENVIRONMENTS: readonly AppEnvironment[] = ["development", "preview", "production"];

export function resolveEnvironment(value: string | undefined, isDev: boolean): AppEnvironment {
  const normalized = value?.trim().toLowerCase();
  return ENVIRONMENTS.find((candidate) => candidate === normalized) ?? (isDev ? "development" : "production");
}

const isDev = (globalThis as { __DEV__?: boolean }).__DEV__ ?? process.env.NODE_ENV !== "production";

export const environment: AppEnvironment = resolveEnvironment(process.env.EXPO_PUBLIC_APP_ENV, isDev);
export const isProduction: boolean = environment === "production";
