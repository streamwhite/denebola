import { describe, expect, it } from "vitest";
import { parseSSEChunk } from "@/lib/api/sse";

describe("parseSSEChunk", () => {
  it("parses data, event and id fields", () => {
    const events = parseSSEChunk("event: token\ndata: hello\nid: 1\n\ndata: world\n\n");

    expect(events).toEqual([
      { event: "token", data: "hello", id: "1" },
      { event: "message", data: "world" },
    ]);
  });

  it("joins multi-line data and keeps retry values", () => {
    const events = parseSSEChunk("data: line1\ndata: line2\nretry: 3000\n\n");

    expect(events[0]).toEqual({ event: "message", data: "line1\nline2", retry: 3000 });
  });

  it("ignores blocks without data or event", () => {
    expect(parseSSEChunk(": comment\n\n")).toEqual([]);
  });
});
