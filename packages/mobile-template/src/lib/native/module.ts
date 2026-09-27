export type NativeCall = { method: string; args: unknown[] };

// Platform-agnostic contract over a native module (Expo Modules API, iOS/Android bridge).
export type NativeModuleAdapter = {
  has(method: string): boolean;
  call<T>(method: string, ...args: unknown[]): Promise<T>;
};

export function createMemoryNativeModule(
  methods: Record<string, (...args: unknown[]) => unknown> = {},
): NativeModuleAdapter & { calls: () => NativeCall[] } {
  const calls: NativeCall[] = [];
  return {
    has: (method) => method in methods,
    async call<T>(method: string, ...args: unknown[]): Promise<T> {
      calls.push({ method, args });
      const handler = methods[method];
      if (!handler) throw new Error(`Unknown native method: ${method}`);
      return (await handler(...args)) as T;
    },
    calls: () => calls.map((entry) => ({ ...entry })),
  };
}
