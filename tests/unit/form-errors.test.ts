import { describe, expect, it } from "vitest";
import { ApiError } from "@/lib/api/errors";
import { mapFieldErrors } from "@/lib/forms/errors";

describe("mapFieldErrors", () => {
  it("maps string and array details onto the requested fields", () => {
    const error = new ApiError(422, "VALIDATION", "Invalid", { email: "Already taken", password: ["Too short", "Too weak"] });

    expect(mapFieldErrors(error, ["email", "password"])).toEqual({ email: "Already taken", password: "Too short" });
  });

  it("ignores fields without a message and errors that are not ApiError", () => {
    const error = new ApiError(422, "VALIDATION", "Invalid", { email: "Already taken" });

    expect(mapFieldErrors(error, ["email", "name"])).toEqual({ email: "Already taken" });
    expect(mapFieldErrors(new Error("boom"), ["email"])).toEqual({});
  });
});
