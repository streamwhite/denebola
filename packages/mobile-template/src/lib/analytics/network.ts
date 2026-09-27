import type { PerformanceMonitor } from "../performance/performance";

export type NetworkRequestInfo = {
  method: string;
  url: string;
  status?: number;
  ok?: boolean;
  durationMs: number;
  requestId?: string;
  error?: unknown;
};

// Contract for network observability; feed it from the API client or a fetch wrapper.
export interface NetworkTracker {
  record(info: NetworkRequestInfo): void;
}

export const noopNetworkTracker: NetworkTracker = { record: () => undefined };

export const NETWORK_SPAN_PREFIX = "network";

export function createMemoryNetworkTracker(): NetworkTracker & { requests: () => NetworkRequestInfo[] } {
  const requests: NetworkRequestInfo[] = [];
  return {
    record(info) {
      requests.push(info);
    },
    requests: () => [...requests],
  };
}

// Reuses the performance pipeline so network spans show up next to other timings.
export function createPerformanceNetworkTracker(monitor: PerformanceMonitor, prefix = NETWORK_SPAN_PREFIX): NetworkTracker {
  return {
    record(info) {
      const endedAt = Date.now();
      monitor.record({ name: `${prefix} ${info.method}`, durationMs: info.durationMs, startedAt: endedAt - info.durationMs, endedAt });
    },
  };
}
