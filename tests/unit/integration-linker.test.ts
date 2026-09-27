import { describe, expect, it } from "vitest";
import { createAppLinker, createMemoryLinkingAdapter } from "@/lib/integration/linker";
import type { UrlPolicy } from "@/lib/integration/urls";

const policy: UrlPolicy = { schemes: ["https", "myapp"], hosts: ["example.com"] };

describe("createAppLinker", () => {
  it("opens only allowed, openable targets", async () => {
    const adapter = createMemoryLinkingAdapter(["https://example.com/x"]);
    const linker = createAppLinker(adapter, policy);

    expect(await linker.open("https://example.com/x")).toBe(true);
    expect(adapter.opened()).toEqual(["https://example.com/x"]);

    expect(await linker.open("https://evil.com/x")).toBe(false);
    expect(await linker.open("myapp://x")).toBe(false);
    expect(adapter.opened()).toHaveLength(1);
  });

  it("reports whether a target can be opened", async () => {
    const adapter = createMemoryLinkingAdapter(["myapp://target"]);
    const linker = createAppLinker(adapter, policy);

    expect(await linker.canOpen("myapp://target")).toBe(true);
    expect(await linker.canOpen("https://evil.com")).toBe(false);
  });
});
