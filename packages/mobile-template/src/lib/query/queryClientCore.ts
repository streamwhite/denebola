import type { QueryClientConfig } from "@tanstack/react-query";
import { ApiError } from "../api/errors";

export const QUERY_RETRY_ATTEMPTS = 2;
export const MUTATION_RETRY_ATTEMPTS = 0;
export const DEFAULT_STALE_TIME_MS = 30_000;
export const DEFAULT_GC_TIME_MS = 5 * 60 * 1_000;
export const DEFAULT_PAGE_SIZE = 20;

// Retry network errors (status 0) and 5xx; never retry 4xx (auth/validation).
export function retryOnApiError(failureCount: number, error: unknown): boolean {
  if (failureCount >= QUERY_RETRY_ATTEMPTS) return false;
  if (error instanceof ApiError) return error.status === 0 || error.retryable;
  return true;
}

export function queryDefaults(): NonNullable<QueryClientConfig["defaultOptions"]> {
  return {
    queries: {
      retry: retryOnApiError,
      staleTime: DEFAULT_STALE_TIME_MS,
      gcTime: DEFAULT_GC_TIME_MS,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: MUTATION_RETRY_ATTEMPTS,
    },
  };
}
