import { describe, expect, it } from "vitest";
import { loginSchema } from "@/schemas/auth";

describe("login schema", () => {
  it("rejects invalid credentials and accepts a valid email", () => {
    expect(loginSchema.safeParse({ email: "bad", password: "" }).success).toBe(false);
    expect(loginSchema.safeParse({ email: "user@example.com", password: "password" }).success).toBe(true);
  });
});
