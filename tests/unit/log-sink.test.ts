import { describe, expect, it } from "vitest";
import { createMemoryLogSink, createPersistentLogSink, formatLogEntries } from "@/lib/logging/sinks";
import type { LogEntry } from "@/lib/logging/types";
import { createMemoryStorage } from "@/lib/storage/memoryStorage";

function entry(message: string): LogEntry {
  return { level: "info", time: new Date(0).toISOString(), namespace: "app", message, environment: "development", context: {} };
}

describe("createMemoryLogSink", () => {
  it("rotates out the oldest entries past the limit", () => {
    const sink = createMemoryLogSink({ maxEntries: 2 });

    sink.write(entry("a"));
    sink.write(entry("b"));
    sink.write(entry("c"));

    expect(sink.entries().map((item) => item.message)).toEqual(["b", "c"]);
  });
});

describe("formatLogEntries", () => {
  it("serializes entries as JSON lines", () => {
    expect(formatLogEntries([entry("a"), entry("b")])).toBe(`${JSON.stringify(entry("a"))}\n${JSON.stringify(entry("b"))}`);
  });
});

describe("createPersistentLogSink", () => {
  it("flushes to storage and restores into a new sink", async () => {
    const storage = createMemoryStorage();
    const source = createPersistentLogSink({ storage });

    source.write(entry("a"));
    source.write(entry("b"));
    await source.flush();

    const restored = createPersistentLogSink({ storage });
    await restored.restore();

    expect(restored.entries().map((item) => item.message)).toEqual(["a", "b"]);
  });

  it("clears both memory and storage", async () => {
    const storage = createMemoryStorage();
    const sink = createPersistentLogSink({ storage });

    sink.write(entry("a"));
    await sink.flush();
    sink.clear();
    await sink.flush();

    const restored = createPersistentLogSink({ storage });
    await restored.restore();
    expect(restored.entries()).toEqual([]);
  });
});