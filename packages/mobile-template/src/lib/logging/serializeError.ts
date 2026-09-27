export type SerializedError = { name: string; message: string; stack?: string; cause?: unknown };

function serializeCause(cause: unknown): unknown {
  return cause instanceof Error ? serializeError(cause) : cause;
}

export function serializeError(value: unknown): SerializedError {
  const error = value instanceof Error ? value : new Error(typeof value === "string" ? value : "Unknown error");
  return {
    name: error.name,
    message: error.message,
    ...(error.stack ? { stack: error.stack } : {}),
    ...(error.cause !== undefined ? { cause: serializeCause(error.cause) } : {}),
  };
}
