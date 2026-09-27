export const DEFAULT_BRIGHTNESS = 0.5;

export interface BrightnessAdapter {
  get(): Promise<number>;
  set(value: number): Promise<void>;
}

export function clampBrightness(value: number): number {
  if (Number.isNaN(value)) return DEFAULT_BRIGHTNESS;
  return Math.min(1, Math.max(0, value));
}

export function createMemoryBrightness(initial = DEFAULT_BRIGHTNESS): BrightnessAdapter {
  let value = clampBrightness(initial);
  return {
    async get() {
      return value;
    },
    async set(next) {
      value = clampBrightness(next);
    },
  };
}
