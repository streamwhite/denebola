import type { AppEnvironment } from "../config/environment";
import type { SerializedError } from "./serializeError";

export type LogLevel = "silent" | "error" | "warn" | "info" | "debug" | "trace";
export type ConsoleOutput = "pretty" | "json" | "none";

export type LogEntry = {
  level: LogLevel;
  time: string;
  namespace: string;
  message: string;
  environment: AppEnvironment;
  context: Record<string, unknown>;
  error?: SerializedError;
};

export type LogSink = { write: (entry: LogEntry) => void };

export type LoggerContext = {
  userId?: string;
  requestId?: string;
  traceId?: string;
  metadata?: Record<string, unknown>;
};

export type Logger = {
  readonly namespace: string;
  readonly level: LogLevel;
  debug(message: string, metadata?: Record<string, unknown>): void;
  info(message: string, metadata?: Record<string, unknown>): void;
  warn(message: string, metadata?: Record<string, unknown>): void;
  trace(message: string, metadata?: Record<string, unknown>): void;
  error(message: string, metadata?: Record<string, unknown>): void;
  error(message: string, error: unknown, metadata?: Record<string, unknown>): void;
  child(namespace: string, metadata?: Record<string, unknown>): Logger;
  withContext(context: LoggerContext): Logger;
};

export type LoggerOptions = {
  namespace?: string;
  level?: LogLevel;
  environment?: AppEnvironment;
  context?: LoggerContext;
  sinks?: LogSink[];
  redact?: boolean;
  console?: ConsoleOutput;
};
