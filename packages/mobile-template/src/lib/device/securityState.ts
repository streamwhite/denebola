export type DeviceSecurityInput = {
  isRooted?: boolean;
  isJailbroken?: boolean;
  hasScreenLock?: boolean;
  isBiometricEnrolled?: boolean;
};

export type DeviceSecurityState = {
  isRooted: boolean;
  isJailbroken: boolean;
  hasScreenLock: boolean;
  isBiometricEnrolled: boolean;
  isCompromised: boolean;
  isSecure: boolean;
};

// Normalizes raw platform signals into a defensible security posture: `compromised` means the
// device is rooted/jailbroken; `secure` additionally requires a screen lock.
export function readDeviceSecurityState(input: DeviceSecurityInput = {}): DeviceSecurityState {
  const isRooted = input.isRooted ?? false;
  const isJailbroken = input.isJailbroken ?? false;
  const hasScreenLock = input.hasScreenLock ?? false;
  const isBiometricEnrolled = input.isBiometricEnrolled ?? false;
  const isCompromised = isRooted || isJailbroken;
  return { isRooted, isJailbroken, hasScreenLock, isBiometricEnrolled, isCompromised, isSecure: hasScreenLock && !isCompromised };
}

export interface DeviceSecurityAdapter {
  read(): Promise<DeviceSecurityState>;
}
