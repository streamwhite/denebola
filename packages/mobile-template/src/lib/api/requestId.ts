const COUNTER_LIMIT = 1_000_000;

let counter = 0;

function randomId(): string {
  const cryptoRef = globalThis.crypto as { randomUUID?: () => string } | undefined;
  if (typeof cryptoRef?.randomUUID === "function") return cryptoRef.randomUUID();
  counter = (counter + 1) % COUNTER_LIMIT;
  return `${Date.now().toString(36)}-${counter.toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function createRequestId(prefix = "req"): string {
  return `${prefix}_${randomId()}`;
}

export const REQUEST_ID_HEADER = "X-Request-Id";
export const CORRELATION_ID_HEADER = "X-Correlation-Id";

export function readHeader(headers: Headers, name: string): string | null {
  return headers.get(name);
}
