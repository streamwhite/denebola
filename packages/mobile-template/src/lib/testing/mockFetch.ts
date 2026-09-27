export type MockRequest = { url: string; method: string; body?: unknown };
export type MockResponse = { status?: number; body?: unknown; headers?: Record<string, string> };

export function jsonResponse(body: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json", ...headers } });
}

function urlOf(input: Parameters<typeof fetch>[0]): string {
  if (typeof input === "string") return input;
  if (input instanceof URL) return input.toString();
  return (input as { url: string }).url;
}

// Drop-in `fetch` replacement for API client tests; the handler owns routing and responses.
export function createMockFetch(handler: (request: MockRequest) => MockResponse | Promise<MockResponse>): typeof fetch {
  return (async (input: Parameters<typeof fetch>[0], init?: Parameters<typeof fetch>[1]) => {
    const response = await handler({ url: urlOf(input), method: (init?.method ?? "GET").toUpperCase(), body: init?.body });
    return jsonResponse(response.body ?? null, response.status ?? 200, response.headers);
  }) as typeof fetch;
}
