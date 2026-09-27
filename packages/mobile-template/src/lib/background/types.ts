export type BackgroundTaskRunner = () => Promise<void>;

export type BackgroundTaskOptions = {
  name: string;
  minimumIntervalMs?: number;
  requiresNetwork?: boolean;
  requiresCharging?: boolean;
};

// Contract over expo-background-task / expo-task-manager; injected so background natives stay opt-in.
export interface BackgroundTaskAdapter {
  register(options: BackgroundTaskOptions, run: BackgroundTaskRunner): Promise<void>;
  unregister(name: string): Promise<void>;
}

export type BackgroundFetchOptions = { minimumIntervalMs?: number; requiresNetwork?: boolean };

export interface BackgroundFetchAdapter {
  register(run: BackgroundTaskRunner, options?: BackgroundFetchOptions): Promise<void>;
  unregister(): Promise<void>;
}

export type BackgroundLocationAccuracy = "low" | "balanced" | "high";

export type BackgroundLocationOptions = {
  accuracy?: BackgroundLocationAccuracy;
  distanceIntervalMeters?: number;
  timeIntervalMs?: number;
  foregroundService?: boolean;
};

export type LocationSample = { latitude: number; longitude: number; timestamp: number; accuracy?: number };

export interface BackgroundLocationAdapter {
  start(listener: (sample: LocationSample) => void, options?: BackgroundLocationOptions): Promise<void>;
  stop(): Promise<void>;
}
