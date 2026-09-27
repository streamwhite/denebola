import { describe, expect, it, vi } from "vitest";
import { installGlobalErrorHandler } from "@/lib/errors/globalErrors";
import type { ErrorReporter } from "@/lib/errors/reporter";

function fakeTarget() {
  let handler: ((error: unknown, isFatal?: boolean) => void) | undefined = () => undefined;
  const listeners: Array<(reason: unknown) => void> = [];
  return {
    target: {
      ErrorUtils: {
        getGlobalHandler: () => handler,
        setGlobalHandler: (next: (error: unknown, isFatal?: boolean) => void) => {
          handler = next;
        },
      },
      process: {
        on: (_event: string, listener: (reason: unknown) => void) => listeners.push(listener),
        off: (_event: string, listener: (reason: unknown) => void) => {
          const index = listeners.indexOf(listener);
          if (index >= 0) listeners.splice(index, 1);
        },
      },
    },
    emit: (error: unknown, isFatal?: boolean) => handler?.(error, isFatal),
    reject: (reason: unknown) => listeners.forEach((listener) => listener(reason)),
    handler: () => handler,
  };
}

describe("installGlobalErrorHandler", () => {
  it("reports fatal errors and unhandled rejections", () => {
    const reporter: ErrorReporter = { report: vi.fn() };
    const fake = fakeTarget();

    installGlobalErrorHandler(reporter, fake.target);
    fake.emit(new Error("boom"), true);
    fake.reject("rejected");

    expect(reporter.report).toHaveBeenCalledWith(expect.any(Error), { source: "globalHandler", isFatal: true });
    expect(reporter.report).toHaveBeenCalledWith("rejected", { source: "unhandledRejection" });
  });

  it("chains the previous handler and uninstalls cleanly", () => {
    const previous = vi.fn();
    const fake = fakeTarget();
    fake.target.ErrorUtils.setGlobalHandler(previous);

    const uninstall = installGlobalErrorHandler({ report: vi.fn() }, fake.target);
    uninstall();
    fake.emit(new Error("boom"));

    expect(fake.handler()).toBe(previous);
    expect(previous).toHaveBeenCalled();
  });
});
