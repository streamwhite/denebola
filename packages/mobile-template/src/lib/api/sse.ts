export type ServerSentEvent = { event: string; data: string; id?: string; retry?: number };

const DATA_PREFIX = "data:";
const EVENT_PREFIX = "event:";
const ID_PREFIX = "id:";
const RETRY_PREFIX = "retry:";

function parseBlock(block: string): ServerSentEvent | null {
  let event = "message";
  let id: string | undefined;
  let retry: number | undefined;
  const data: string[] = [];
  for (const line of block.split("\n")) {
    if (line.startsWith(DATA_PREFIX)) data.push(line.slice(DATA_PREFIX.length).trimStart());
    else if (line.startsWith(EVENT_PREFIX)) event = line.slice(EVENT_PREFIX.length).trim();
    else if (line.startsWith(ID_PREFIX)) id = line.slice(ID_PREFIX.length).trim();
    else if (line.startsWith(RETRY_PREFIX)) retry = Number(line.slice(RETRY_PREFIX.length).trim());
  }
  if (data.length === 0 && event === "message") return null;
  return { event, data: data.join("\n"), ...(id !== undefined ? { id } : {}), ...(retry !== undefined ? { retry } : {}) };
}

export function parseSSEChunk(chunk: string): ServerSentEvent[] {
  return chunk
    .split(/\n\n/)
    .map(parseBlock)
    .filter((event): event is ServerSentEvent => event !== null);
}

export type SSEOptions = { method?: "GET" | "POST"; headers?: Record<string, string>; body?: string; signal?: AbortSignal; onEvent: (event: ServerSentEvent) => void };

export async function subscribeToSSE(url: string, options: SSEOptions): Promise<void> {
  const response = await fetch(url, { method: options.method ?? "GET", headers: { Accept: "text/event-stream", ...options.headers }, body: options.body, signal: options.signal });
  if (!response.ok || !response.body) throw new Error(`SSE connection failed: ${response.status}`);
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const boundary = buffer.lastIndexOf("\n\n");
    if (boundary === -1) continue;
    for (const event of parseSSEChunk(buffer.slice(0, boundary))) options.onEvent(event);
    buffer = buffer.slice(boundary + 2);
  }
}

export type StreamRequestOptions = { headers?: Record<string, string>; body?: string; signal?: AbortSignal; onChunk: (chunk: string) => void };

// Generic line/JSON streaming for chunked responses (e.g. a JSONL progress endpoint).
export async function streamResponse(url: string, options: StreamRequestOptions): Promise<void> {
  const response = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json", ...options.headers }, body: options.body, signal: options.signal });
  if (!response.ok || !response.body) throw new Error(`Stream failed: ${response.status}`);
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    options.onChunk(decoder.decode(value, { stream: true }));
  }
}
