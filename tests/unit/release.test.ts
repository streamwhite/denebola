import { describe, expect, it } from "vitest";
import { decideUpdate } from "@/lib/release/channel";
import { isReleaseProfile, RELEASE_PROFILE_CONFIG, resolveReleaseProfile } from "@/lib/release/profiles";
import { selectRollbackTarget } from "@/lib/release/rollback";
import { DEFAULT_RUNTIME_VERSION_POLICY, isRuntimeCompatible, resolveRuntimeVersion } from "@/lib/release/runtimeVersion";
import { signingConfig } from "@/lib/release/signing";

describe("release profiles", () => {
  it("maps profiles to channel, environment and distribution", () => {
    expect(RELEASE_PROFILE_CONFIG.preview).toEqual({
      profile: "preview",
      channel: "staging",
      environment: "preview",
      distribution: "internal",
      developmentClient: false,
    });
    expect(RELEASE_PROFILE_CONFIG.production.distribution).toBe("store");
    expect(RELEASE_PROFILE_CONFIG.development.developmentClient).toBe(true);
  });

  it("recognizes known profiles and rejects unknown values", () => {
    expect(isReleaseProfile("production")).toBe(true);
    expect(isReleaseProfile("staging")).toBe(false);
    expect(resolveReleaseProfile("preview")?.channel).toBe("staging");
    expect(resolveReleaseProfile("staging")).toBeNull();
  });
});

describe("runtime version", () => {
  it("uses the native version for nativeVersion policy and app version otherwise", () => {
    expect(DEFAULT_RUNTIME_VERSION_POLICY).toBe("nativeVersion");
    expect(resolveRuntimeVersion("nativeVersion", "1.2.3")).toBe("1");
    expect(resolveRuntimeVersion("appVersion", "1.2.3")).toBe("1.2.3");
  });

  it("compares binary and update runtime versions", () => {
    expect(isRuntimeCompatible("1", "1")).toBe(true);
    expect(isRuntimeCompatible("1", "2")).toBe(false);
  });
});

describe("OTA update gating", () => {
  const binary = { channel: "production" as const, runtimeVersion: "1" };

  it("allows a matching channel and runtime", () => {
    expect(decideUpdate(binary, { channel: "production", runtimeVersion: "1", createdAt: 1 })).toEqual({ allowed: true, reason: "ok" });
  });

  it("rejects channel and runtime mismatches", () => {
    expect(decideUpdate(binary, { channel: "staging", runtimeVersion: "1", createdAt: 1 }).reason).toBe("channel-mismatch");
    expect(decideUpdate(binary, { channel: "production", runtimeVersion: "2", createdAt: 1 }).reason).toBe("runtime-mismatch");
  });

  it("always allows an explicit rollback", () => {
    expect(decideUpdate(binary, { channel: "staging", runtimeVersion: "9", createdAt: 1, rollback: true })).toEqual({ allowed: true, reason: "rollback" });
  });
});

describe("rollback selection", () => {
  const current = { id: "c", channel: "production", runtimeVersion: "1", createdAt: 30 };

  it("picks the most recent compatible earlier update", () => {
    const history = [
      { id: "a", channel: "production", runtimeVersion: "1", createdAt: 10 },
      { id: "b", channel: "production", runtimeVersion: "1", createdAt: 20 },
      { id: "x", channel: "staging", runtimeVersion: "1", createdAt: 25 },
      { id: "y", channel: "production", runtimeVersion: "2", createdAt: 26 },
    ];
    expect(selectRollbackTarget(current, history)?.target.id).toBe("b");
  });

  it("returns null when no compatible earlier update exists", () => {
    expect(selectRollbackTarget(current, [])).toBeNull();
  });
});

describe("signing config", () => {
  it("defaults to remote credentials and supports local overrides", () => {
    expect(signingConfig("ios").credentialsSource).toBe("remote");
    expect(signingConfig("android", "local")).toEqual({ platform: "android", profile: "production", credentialsSource: "local" });
  });
});
