const RETRYABLE_STATUS_MIN = 500;
const RETRYABLE_STATUS_MAX = 599;

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details: unknown;
  readonly retryable: boolean;
  readonly requestId?: string;

  constructor(status: number, code: string, message: string, details?: unknown, requestId?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
    this.retryable = status >= RETRYABLE_STATUS_MIN && status <= RETRYABLE_STATUS_MAX;
    this.requestId = requestId;
  }
}

export async function normalizeApiError(response: Response, requestId?: string): Promise<ApiError> {
  const body = await response.json().catch(() => ({}));
  const data = body as { code?: string; message?: string; details?: unknown };
  return new ApiError(response.status, data.code ?? "UNKNOWN_ERROR", data.message ?? "Request failed", data.details, requestId);
}

export function normalizeNetworkError(error: unknown, timedOut: boolean): ApiError {
  if (error instanceof ApiError) return error;
  const aborted = error instanceof Error && error.name === "AbortError";
  if (timedOut && aborted) return new ApiError(0, "TIMEOUT", "Request timed out");
  return new ApiError(0, "NETWORK_ERROR", "Network request failed");
}
