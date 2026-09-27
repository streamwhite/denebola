export type CrashContext = Record<string, unknown>;

// Contract over Sentry/Crashlytics; the vendor is chosen by the app, not the framework.
export interface CrashReporter {
  capture(error: unknown, context?: CrashContext): void;
}

export const noopCrashReporter: CrashReporter = { capture: () => undefined };

export function createMemoryCrashReporter(): CrashReporter & { captured: () => unknown[] } {
  const captured: unknown[] = [];
  return {
    capture(error) {
      captured.push(error);
    },
    captured: () => [...captured],
  };
}
