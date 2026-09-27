import { describe, expect, it, vi } from "vitest";
import { orderStartupSteps, runStartup } from "@/lib/lifecycle/startup";

describe("orderStartupSteps", () => {
  it("orders steps after their dependencies", () => {
    const ordered = orderStartupSteps([
      { name: "render", run: () => undefined, dependsOn: ["query"] },
      { name: "config", run: () => undefined },
      { name: "query", run: () => undefined, dependsOn: ["config"] },
    ]);

    expect(ordered.map((step) => step.name)).toEqual(["config", "query", "render"]);
  });

  it("rejects unknown and circular dependencies", () => {
    expect(() => orderStartupSteps([{ name: "a", run: () => undefined, dependsOn: ["missing"] }])).toThrow("Unknown startup dependency");
    expect(() =>
      orderStartupSteps([
        { name: "a", run: () => undefined, dependsOn: ["b"] },
        { name: "b", run: () => undefined, dependsOn: ["a"] },
      ]),
    ).toThrow("Circular");
  });
});

describe("runStartup", () => {
  it("runs steps in dependency order", async () => {
    const calls: string[] = [];

    const result = await runStartup([
      { name: "b", run: () => { calls.push("b"); }, dependsOn: ["a"] },
      { name: "a", run: () => { calls.push("a"); } },
    ]);

    expect(calls).toEqual(["a", "b"]);
    expect(result.steps).toEqual(["a", "b"]);
    expect(result.errors).toEqual([]);
  });

  it("continues past optional failures and stops at a required one", async () => {
    const onError = vi.fn();

    const result = await runStartup(
      [
        { name: "start", run: () => undefined },
        { name: "optional", run: () => Promise.reject(new Error("x")), optional: true },
        { name: "required", run: () => { throw new Error("boom"); } },
        { name: "after", run: () => undefined },
      ],
      { onError },
    );

    expect(result.steps).toEqual(["start"]);
    expect(result.errors.map((entry) => entry.name)).toEqual(["optional", "required"]);
    expect(onError).toHaveBeenCalledTimes(2);
  });
});
