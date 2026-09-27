import type { LogLevel } from "./types";

const LEVELS: readonly LogLevel[] = ["silent", "error", "warn", "info", "debug", "trace"];

export function resolveLogLevel(value: string | undefined, fallback: LogLevel): LogLevel {
  const normalized = value?.trim().toLowerCase();
  return LEVELS.find((candidate) => candidate === normalized) ?? fallback;
}
