export type BiometricType = "face" | "fingerprint" | "iris" | "none";

export type BiometricAvailability = { available: boolean; enrolled: boolean; types: BiometricType[] };

export interface BiometricAdapter {
  isAvailable(): Promise<BiometricAvailability>;
  authenticate(reason: string): Promise<boolean>;
}

export const noopBiometric: BiometricAdapter = {
  isAvailable: async () => ({ available: false, enrolled: false, types: ["none"] }),
  authenticate: async () => false,
};

// Gate a sensitive action behind biometrics; resolves true when the platform has no biometrics
// (so callers do not lock users out) unless `required` is set.
export async function unlockWithBiometrics(adapter: BiometricAdapter, reason: string, required = false): Promise<boolean> {
  const availability = await adapter.isAvailable().catch(() => ({ available: false, enrolled: false, types: ["none"] as BiometricType[] }));
  if (!availability.available || !availability.enrolled) return !required;
  return adapter.authenticate(reason).catch(() => false);
}
