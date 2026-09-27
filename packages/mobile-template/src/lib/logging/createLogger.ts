import { createConsola, LogLevels } from "consola";
import { environment as runtimeEnvironment, type AppEnvironment } from "../config/environment";
import { resolveLogLevel } from "./level";
import { redact } from "./redact";
import { serializeError } from "./serializeError";
import type { ConsoleOutput, LogEntry, Logger, LoggerContext, LoggerOptions, LogLevel } from "./types";

const LEVELS: Record<LogLevel, number> = {
  silent: LogLevels.silent,
  error: LogLevels.error,
  warn: LogLevels.warn,
  info: LogLevels.info,
  debug: LogLevels.debug,
  trace: LogLevels.trace,
};

function defaultLevel(environment: AppEnvironment): LogLevel {
  return resolveLogLevel(process.env.EXPO_PUBLIC_LOG_LEVEL, environment === "production" ? "info" : "debug");
}

function defaultConsole(environment: AppEnvironment): ConsoleOutput {
  return environment === "production" ? "json" : "pretty";
}

function isErrorLike(value: unknown): boolean {
  return value instanceof Error || (typeof value === "object" && value !== null && "message" in value && "name" in value);
}

export function createLogger(options: LoggerOptions = {}): Logger {
  const environment = options.environment ?? runtimeEnvironment;
  const level = options.level ?? defaultLevel(environment);
  const namespace = options.namespace ?? "";
  const consoleOutput = options.console ?? defaultConsole(environment);
  const sinks = options.sinks ?? [];
  const redactEnabled = options.redact ?? true;
  const context = options.context ?? {};
  const consola = createConsola({ level: LEVELS[level], formatOptions: { date: true, colors: environment !== "production" } });

  function fields(metadata?: Record<string, unknown>): Record<string, unknown> {
    return {
      ...(context.userId ? { userId: context.userId } : {}),
      ...(context.requestId ? { requestId: context.requestId } : {}),
      ...(context.traceId ? { traceId: context.traceId } : {}),
      ...context.metadata,
      ...metadata,
    };
  }

  function output(entry: LogEntry): void {
    if (consoleOutput === "none") return;
    if (consoleOutput === "json") {
      const line = JSON.stringify(entry);
      if (entry.level === "error") console.error(line);
      else if (entry.level === "warn") console.warn(line);
      else console.log(line);
      return;
    }
    const label = entry.namespace ? `[${entry.namespace}] ${entry.message}` : entry.message;
    const payload = { ...entry.context, ...(entry.error ? { error: entry.error } : {}) };
    const method = entry.level === "error" ? "error" : entry.level === "warn" ? "warn" : entry.level === "debug" ? "debug" : entry.level === "trace" ? "trace" : "info";
    consola[method](label, payload);
  }

  function write(entryLevel: LogLevel, message: string, error: unknown, metadata?: Record<string, unknown>): void {
    if (LEVELS[entryLevel] > LEVELS[level]) return;
    const raw = fields(metadata);
    const clean = redactEnabled ? (redact(raw) as Record<string, unknown>) : raw;
    const serialized = error === undefined ? undefined : serializeError(error);
    const entry: LogEntry = {
      level: entryLevel,
      time: new Date().toISOString(),
      namespace,
      message,
      environment,
      context: clean,
      ...(serialized ? { error: serialized } : {}),
    };
    for (const sink of sinks) sink.write(entry);
    output(entry);
  }

  function build(nextNamespace: string, nextContext: LoggerContext, nextLevel: LogLevel): Logger {
    return createLogger({ namespace: nextNamespace, level: nextLevel, environment, context: nextContext, sinks, redact: redactEnabled, console: consoleOutput });
  }

  function logError(message: string, metadata?: Record<string, unknown>): void;
  function logError(message: string, error: unknown, metadata?: Record<string, unknown>): void;
  function logError(message: string, errorOrMetadata?: unknown, metadata?: Record<string, unknown>): void {
    const hasError = metadata !== undefined || isErrorLike(errorOrMetadata);
    write("error", message, hasError ? errorOrMetadata : undefined, hasError ? metadata : (errorOrMetadata as Record<string, unknown> | undefined));
  }

  return {
    namespace,
    level,
    debug: (message, metadata) => write("debug", message, undefined, metadata),
    info: (message, metadata) => write("info", message, undefined, metadata),
    warn: (message, metadata) => write("warn", message, undefined, metadata),
    trace: (message, metadata) => write("trace", message, undefined, metadata),
    error: logError,
    child: (childNamespace, metadata) => build(namespace ? `${namespace}:${childNamespace}` : childNamespace, { ...context, metadata: { ...context.metadata, ...metadata } }, level),
    withContext: (next) => build(namespace, { ...context, ...next, metadata: { ...context.metadata, ...next.metadata } }, level),
  };
}
