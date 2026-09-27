export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type ApiRequestOptions = {
  method?: HttpMethod;
  headers?: HeadersInit;
  body?: BodyInit | null;
  query?: Record<string, string | number | boolean | null | undefined>;
  signal?: AbortSignal;
  timeoutMs?: number;
  retry?: boolean | import("./retry").RetryPolicy;
  requestId?: string;
  correlationId?: string;
  skipAuth?: boolean;
  authRetry?: boolean;
  expect?: "json" | "text" | "none";
};

export type ApiRequestContext = {
  requestId: string;
  correlationId?: string;
  attempt: number;
  url: string;
};

export type ApiResponse<T> = {
  data: T;
  status: number;
  headers: Headers;
  requestId: string;
};
