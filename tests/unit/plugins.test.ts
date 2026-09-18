import { describe, expect, it } from "vitest";
import { createPluginRegistry } from "@/lib/plugins/registry";

describe("plugin registry", () => {
  it("initializes plugins in registration order", async () => {
    const calls: string[] = [];
    const registry = createPluginRegistry({ logger: { info: (value) => calls.push(value) } });
    registry.register({ id: "first", name: "First", capabilities: [], initialize: async () => calls.push("initialized") });
    await registry.initialize();
    expect(calls).toEqual(["initialized"]);
  });
});
