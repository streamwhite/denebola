import { describe, expect, it } from "vitest";
import { serializeError } from "@/lib/logging/serializeError";

describe("serializeError", () => {
  it("keeps name, message and stack of an Error", () => {
    const serialized = serializeError(new TypeError("bad input"));

    expect(serialized).toMatchObject({ name: "TypeError", message: "bad input" });
    expect(serialized.stack).toBeTruthy();
  });

  it("serializes cause chains and non-Error values", () => {
    const serialized = serializeError(new Error("outer", { cause: new Error("inner") }));

    expect(serialized.cause).toMatchObject({ name: "Error", message: "inner" });
    expect(serializeError("plain reason")).toMatchObject({ name: "Error", message: "plain reason" });
  });
});