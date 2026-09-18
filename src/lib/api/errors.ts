const RETRYABLE_STATUS_MIN = 500;
const RETRYABLE_STATUS_MAX = 599;

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details: unknown;
  readonly retryable: boolean;

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
    this.retryable = status >= RETRYABLE_STATUS_MIN && status <= RETRYABLE_STATUS_MAX;
  }
}

export async function normalizeApiError(response: Response): Promise<ApiError> {
  const body = await response.json().catch(() => ({}));
  const data = body as { code?: string; message?: string; details?: unknown };
  return new ApiError(response.status, data.code ?? "UNKNOWN_ERROR", data.message ?? "Request failed", data.details);
}
