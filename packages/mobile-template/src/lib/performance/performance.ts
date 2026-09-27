export type PerformanceSpan = { name: string; durationMs: number; startedAt: number; endedAt: number };

export type PerformanceMonitor = {
  record: (span: PerformanceSpan) => void;
};

export const noopPerformanceMonitor: PerformanceMonitor = { record: () => undefined };

const now = () => Date.now();

function span(name: string, startedAt: number): PerformanceSpan {
  const endedAt = now();
  return { name, startedAt, endedAt, durationMs: endedAt - startedAt };
}

export function measureSync<T>(name: string, run: () => T, monitor: PerformanceMonitor = noopPerformanceMonitor): T {
  const startedAt = now();
  try {
    return run();
  } finally {
    monitor.record(span(name, startedAt));
  }
}

export async function measure<T>(name: string, run: () => Promise<T>, monitor: PerformanceMonitor = noopPerformanceMonitor): Promise<T> {
  const startedAt = now();
  try {
    return await run();
  } finally {
    monitor.record(span(name, startedAt));
  }
}
