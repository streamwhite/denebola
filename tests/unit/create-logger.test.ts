import { describe, expect, it } from "vitest";
import { createLogger } from "@/lib/logging/createLogger";
import { createMemoryLogSink } from "@/lib/logging/sinks";
import type { LogLevel } from "@/lib/logging/types";

function setup(level: LogLevel = "debug") {
  const sink = createMemoryLogSink({ maxEntries: 10 });
  const logger = createLogger({ namespace: "orders", level, sinks: [sink], console: "none", environment: "development" });
  return { sink, logger };
}

describe("createLogger", () => {
  it("writes structured entries with time, namespace, level and environment", () => {
    const { sink, logger } = setup();

    logger.info("loaded", { count: 2 });

    const [entry] = sink.entries();
    expect(entry).toMatchObject({ level: "info", namespace: "orders", message: "loaded", environment: "development", context: { count: 2 } });
    expect(Number.isNaN(Date.parse(entry.time))).toBe(false);
  });

  it("filters entries below the configured level", () => {
    const { sink, logger } = setup("warn");

    logger.info("hidden");
    logger.warn("shown");

    expect(sink.entries().map((entry) => entry.message)).toEqual(["shown"]);
  });

  it("supports child namespaces and inherits context", () => {
    const { sink, logger } = setup();

    logger.withContext({ requestId: "r1", userId: "u1" }).child("detail", { step: "load" }).info("go");

    expect(sink.entries()[0]).toMatchObject({ namespace: "orders:detail", context: { requestId: "r1", userId: "u1", step: "load" } });
  });

  it("redacts sensitive metadata", () => {
    const { sink, logger } = setup();

    logger.info("auth", { accessToken: "secret", email: "user@example.com" });

    expect(sink.entries()[0].context).toEqual({ accessToken: "[redacted]", email: "user@example.com" });
  });

  it("serializes errors and keeps metadata in both call forms", () => {
    const { sink, logger } = setup();

    logger.error("failed", new Error("boom"), { orderId: "1" });
    logger.error("plain", { orderId: "2" });

    const [withError, withoutError] = sink.entries();
    expect(withError.error).toMatchObject({ name: "Error", message: "boom" });
    expect(withError.context).toEqual({ orderId: "1" });
    expect(withoutError.error).toBeUndefined();
    expect(withoutError.context).toEqual({ orderId: "2" });
  });

  it("can skip redaction and console output entirely", () => {
    const sink = createMemoryLogSink();
    const logger = createLogger({ sinks: [sink], console: "none", redact: false });

    logger.info("raw", { token: "secret" });

    expect(sink.entries()[0].context).toEqual({ token: "secret" });
  });
});