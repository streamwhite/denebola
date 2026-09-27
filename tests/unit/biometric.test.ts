import { describe, expect, it, vi } from "vitest";
import { noopBiometric, unlockWithBiometrics, type BiometricAdapter } from "@/lib/auth/biometric";

function adapter(overrides: Partial<BiometricAdapter>): BiometricAdapter {
  return { isAvailable: async () => ({ available: true, enrolled: true, types: ["face"] }), authenticate: async () => true, ...overrides };
}

describe("unlockWithBiometrics", () => {
  it("authenticates when biometrics are available and enrolled", async () => {
    const authenticate = vi.fn(async () => true);

    await expect(unlockWithBiometrics(adapter({ authenticate }), "Unlock")).resolves.toBe(true);
    expect(authenticate).toHaveBeenCalledWith("Unlock");
  });

  it("fails when the user rejects authentication", async () => {
    await expect(unlockWithBiometrics(adapter({ authenticate: async () => false }), "Unlock")).resolves.toBe(false);
  });

  it("allows access without biometrics unless required", async () => {
    const unavailable = adapter({ isAvailable: async () => ({ available: false, enrolled: false, types: ["none"] }) });

    await expect(unlockWithBiometrics(unavailable, "Unlock")).resolves.toBe(true);
    await expect(unlockWithBiometrics(unavailable, "Unlock", true)).resolves.toBe(false);
    await expect(unlockWithBiometrics(noopBiometric, "Unlock", true)).resolves.toBe(false);
  });
});
