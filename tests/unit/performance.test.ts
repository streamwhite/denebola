import { describe, expect, it } from "vitest";
import { measure, measureSync, type PerformanceMonitor, type PerformanceSpan } from "@/lib/performance/performance";

function recordingMonitor() {
  const spans: PerformanceSpan[] = [];
  const monitor: PerformanceMonitor = { record: (span) => spans.push(span) };
  return { monitor, spans };
}

describe("performance helpers", () => {
  it("records a span around a synchronous call and returns its value", () => {
    const { monitor, spans } = recordingMonitor();

    expect(measureSync("build", () => 42, monitor)).toBe(42);
    expect(spans).toHaveLength(1);
    expect(spans[0]).toMatchObject({ name: "build" });
    expect(spans[0].durationMs).toBeGreaterThanOrEqual(0);
  });

  it("records a span even when the measured call throws", () => {
    const { monitor, spans } = recordingMonitor();

    expect(() => measureSync("fail", () => {
      throw new Error("boom");
    }, monitor)).toThrow("boom");
    expect(spans).toHaveLength(1);
  });

  it("measures async work", async () => {
    const { monitor, spans } = recordingMonitor();

    await expect(measure("fetch", async () => "ok", monitor)).resolves.toBe("ok");
    expect(spans[0].name).toBe("fetch");
  });
});
