import * as LocalAuthentication from "expo-local-authentication";
import type { BiometricAdapter, BiometricAvailability, BiometricType } from "./biometric";

const FACTOR_TYPES: Record<number, BiometricType> = {
  [LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION]: "face",
  [LocalAuthentication.AuthenticationType.FINGERPRINT]: "fingerprint",
  [LocalAuthentication.AuthenticationType.IRIS]: "iris",
};

export function createExpoBiometricAdapter(): BiometricAdapter {
  return {
    async isAvailable(): Promise<BiometricAvailability> {
      const [available, enrolled, types] = await Promise.all([
        LocalAuthentication.hasHardwareAsync(),
        LocalAuthentication.isEnrolledAsync(),
        LocalAuthentication.supportedAuthenticationTypesAsync(),
      ]);
      return { available, enrolled, types: types.map((type) => FACTOR_TYPES[type] ?? "none") };
    },
    async authenticate(reason: string): Promise<boolean> {
      const result = await LocalAuthentication.authenticateAsync({ promptMessage: reason, cancelLabel: "Cancel" });
      return result.success;
    },
  };
}
