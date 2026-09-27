import { createLogger } from "./createLogger";
import type { Logger } from "./types";

export const logger: Logger = createLogger();

export { createLogger } from "./createLogger";
export { resolveLogLevel } from "./level";
export { createMemoryLogSink, createPersistentLogSink, formatLogEntries } from "./sinks";
export type { MemoryLogSink, PersistentLogSink } from "./sinks";
export { serializeError } from "./serializeError";
export type { SerializedError } from "./serializeError";
export type { ConsoleOutput, LogEntry, Logger, LoggerContext, LoggerOptions, LogLevel, LogSink } from "./types";
