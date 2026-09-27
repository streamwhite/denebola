import { describe, expect, it, vi } from "vitest";
import { createMemoryShareIntentAdapter, parseIncomingFiles, parseShareIntent } from "@/lib/integration/shareIntent";

describe("parseShareIntent", () => {
  it("extracts text, url and incoming files", () => {
    expect(parseShareIntent({ text: "hi", files: [{ uri: "/a", name: "a.pdf", size: 3 }] })).toEqual({
      text: "hi",
      files: [{ uri: "/a", name: "a.pdf", size: 3 }],
    });
    expect(parseShareIntent({ url: "https://example.com" })).toEqual({ url: "https://example.com" });
  });

  it("rejects empty or invalid intents", () => {
    expect(parseShareIntent({})).toBeNull();
    expect(parseShareIntent("nope")).toBeNull();
  });
});

describe("parseIncomingFiles", () => {
  it("keeps only entries with a uri", () => {
    expect(parseIncomingFiles([{ uri: "/a" }, { name: "no-uri" }, "x"])).toEqual([{ uri: "/a" }]);
    expect(parseIncomingFiles("nope")).toEqual([]);
  });
});

describe("createMemoryShareIntentAdapter", () => {
  it("returns the initial intent and streams later ones", async () => {
    const adapter = createMemoryShareIntentAdapter({ text: "cold" });
    const listener = vi.fn();

    expect(await adapter.getInitialIntent()).toEqual({ text: "cold" });

    adapter.subscribe(listener);
    adapter.emit({ files: [{ uri: "/a" }] });

    expect(listener).toHaveBeenCalledWith({ files: [{ uri: "/a" }] });
  });
});
