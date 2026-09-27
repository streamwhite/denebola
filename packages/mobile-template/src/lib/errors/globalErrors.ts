import { type ErrorReporter, reportError } from "./reporter";

type GlobalHandler = (error: unknown, isFatal?: boolean) => void;
type ErrorUtilsLike = { getGlobalHandler?: () => GlobalHandler | undefined; setGlobalHandler?: (handler: GlobalHandler) => void };
type ProcessLike = { on?: (event: string, listener: (reason: unknown) => void) => void; off?: (event: string, listener: (reason: unknown) => void) => void };
export type GlobalErrorTarget = { ErrorUtils?: ErrorUtilsLike; process?: ProcessLike };

export function installGlobalErrorHandler(reporter: ErrorReporter, target: GlobalErrorTarget = globalThis as unknown as GlobalErrorTarget): () => void {
  const errorUtils = target.ErrorUtils;
  const previous = errorUtils?.getGlobalHandler?.();
  errorUtils?.setGlobalHandler?.((error, isFatal) => {
    reportError(reporter, error, { source: "globalHandler", isFatal: Boolean(isFatal) });
    previous?.(error, isFatal);
  });

  const onRejection = (reason: unknown) => reportError(reporter, reason, { source: "unhandledRejection" });
  target.process?.on?.("unhandledRejection", onRejection);

  return () => {
    target.process?.off?.("unhandledRejection", onRejection);
    if (previous) errorUtils?.setGlobalHandler?.(previous);
  };
}
