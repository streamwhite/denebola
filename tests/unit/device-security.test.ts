import { describe, expect, it } from "vitest";
import { readDeviceSecurityState } from "@/lib/device/securityState";

describe("readDeviceSecurityState", () => {
  it("defaults to insecure when nothing is reported", () => {
    expect(readDeviceSecurityState()).toEqual({
      isRooted: false,
      isJailbroken: false,
      hasScreenLock: false,
      isBiometricEnrolled: false,
      isCompromised: false,
      isSecure: false,
    });
  });

  it("derives the compromised flag from root/jailbreak", () => {
    const state = readDeviceSecurityState({ isRooted: true, hasScreenLock: true });

    expect(state.isCompromised).toBe(true);
    expect(state.isSecure).toBe(false);
  });

  it("treats a locked, unrooted device as secure", () => {
    expect(readDeviceSecurityState({ hasScreenLock: true, isBiometricEnrolled: true }).isSecure).toBe(true);
  });
});
