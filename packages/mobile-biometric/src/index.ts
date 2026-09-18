export type BiometricAdapter = { isAvailable: () => Promise<boolean>; authenticate: (reason: string) => Promise<boolean> };
