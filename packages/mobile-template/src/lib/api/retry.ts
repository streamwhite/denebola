import { ApiError } from "./errors";

export type RetryPolicy = {
  attempts: number;
  baseDelayMs: number;
  maxDelayMs: number;
  retryOn?: (error: unknown, attempt: number) => boolean;
};

export const DEFAULT_RETRY: RetryPolicy = { attempts: 2, baseDelayMs: 300, maxDelayMs: 5_000 };

export function backoffDelay(attempt: number, policy: Pick<RetryPolicy, "baseDelayMs" | "maxDelayMs">): number {
  const exponential = policy.baseDelayMs * 2 ** Math.max(0, attempt - 1);
  return Math.min(exponential, policy.maxDelayMs);
}

// Network/timeout errors (status 0) and 5xx are safe to retry; 4xx are not.
export function shouldRetry(error: unknown): boolean {
  return error instanceof ApiError && (error.status === 0 || error.retryable);
}

export async function runWithRetry<T>(run: (attempt: number) => Promise<T>, policy: RetryPolicy, sleep: (ms: number) => Promise<void> = delay): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= policy.attempts + 1; attempt += 1) {
    try {
      return await run(attempt);
    } catch (error) {
      lastError = error;
      const retryable = (policy.retryOn ?? shouldRetry)(error, attempt);
      if (!retryable || attempt > policy.attempts) break;
      await sleep(backoffDelay(attempt, policy));
    }
  }
  throw lastError;
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
