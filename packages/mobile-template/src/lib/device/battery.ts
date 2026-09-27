export type BatteryState = "unknown" | "unplugged" | "charging" | "full";

export type BatteryInfo = { level: number | null; state: BatteryState; lowPowerMode: boolean };

export const INITIAL_BATTERY_INFO: BatteryInfo = { level: null, state: "unknown", lowPowerMode: false };

export const LOW_BATTERY_THRESHOLD = 0.2;

export interface BatteryAdapter {
  get(): Promise<BatteryInfo>;
  subscribe(listener: (info: BatteryInfo) => void): () => void;
}

export function batteryLevelPercent(level: number | null): number | null {
  return level === null ? null : Math.round(level * 100);
}

export function isLowBattery(info: BatteryInfo, threshold = LOW_BATTERY_THRESHOLD): boolean {
  return info.level !== null && info.level <= threshold;
}

export const noopBattery: BatteryAdapter = {
  get: async () => INITIAL_BATTERY_INFO,
  subscribe: () => () => undefined,
};

export function createMemoryBattery(initial: BatteryInfo = INITIAL_BATTERY_INFO) {
  let info = initial;
  const listeners = new Set<(info: BatteryInfo) => void>();
  return {
    async get(): Promise<BatteryInfo> {
      return info;
    },
    subscribe(listener: (info: BatteryInfo) => void): () => void {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    emit(next: BatteryInfo): void {
      info = next;
      for (const listener of listeners) listener(next);
    },
  };
}
