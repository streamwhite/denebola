export type ErrorReporter = {
  report: (error: unknown, context?: Record<string, unknown>) => void;
};

export const noopErrorReporter: ErrorReporter = { report: () => undefined };

export function toError(value: unknown): Error {
  if (value instanceof Error) return value;
  return new Error(typeof value === "string" ? value : "Unknown error");
}

export function reportError(reporter: ErrorReporter | undefined, error: unknown, context?: Record<string, unknown>): void {
  (reporter ?? noopErrorReporter).report(error, context);
}
