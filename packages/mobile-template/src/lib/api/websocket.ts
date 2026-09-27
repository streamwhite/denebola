export type WebSocketStatus = "connecting" | "open" | "closed" | "reconnecting";

export type WebSocketHandlers = {
  onOpen?: () => void;
  onMessage?: (data: unknown) => void;
  onClose?: (event: { code: number; reason: string }) => void;
  onError?: (error: unknown) => void;
  onStatus?: (status: WebSocketStatus) => void;
};

export type WebSocketClientOptions = WebSocketHandlers & {
  url: string;
  protocols?: string | string[];
  reconnect?: boolean;
  baseDelayMs?: number;
  maxDelayMs?: number;
  socketFactory?: (url: string, protocols?: string | string[]) => WebSocket;
};

export type WebSocketClient = {
  send: (data: string | object) => void;
  close: (code?: number, reason?: string) => void;
  status: () => WebSocketStatus;
};

const DEFAULT_BASE_DELAY_MS = 500;
const DEFAULT_MAX_DELAY_MS = 10_000;
const NORMAL_CLOSURE = 1000;

export function createWebSocketClient(options: WebSocketClientOptions): WebSocketClient {
  const factory = options.socketFactory ?? ((url, protocols) => new WebSocket(url, protocols));
  let socket: WebSocket | null = null;
  let status: WebSocketStatus = "closed";
  let attempts = 0;
  let closedByUser = false;

  function setStatus(next: WebSocketStatus) {
    status = next;
    options.onStatus?.(next);
  }

  function connect() {
    setStatus(attempts === 0 ? "connecting" : "reconnecting");
    socket = factory(options.url, options.protocols);
    socket.onopen = () => {
      attempts = 0;
      setStatus("open");
      options.onOpen?.();
    };
    socket.onmessage = (event: MessageEvent) => options.onMessage?.(parsePayload(event.data));
    socket.onerror = (error: Event) => options.onError?.(error);
    socket.onclose = (event: CloseEvent) => {
      const reconnecting = options.reconnect !== false && !closedByUser;
      setStatus(reconnecting ? "reconnecting" : "closed");
      options.onClose?.({ code: event.code, reason: event.reason });
      if (reconnecting) scheduleReconnect();
    };
  }

  function scheduleReconnect() {
    attempts += 1;
    const delay = Math.min((options.baseDelayMs ?? DEFAULT_BASE_DELAY_MS) * 2 ** (attempts - 1), options.maxDelayMs ?? DEFAULT_MAX_DELAY_MS);
    setTimeout(() => {
      if (!closedByUser) connect();
    }, delay);
  }

  connect();
  return {
    send: (data) => socket?.send(typeof data === "string" ? data : JSON.stringify(data)),
    close: (code = NORMAL_CLOSURE, reason = "") => {
      closedByUser = true;
      socket?.close(code, reason);
    },
    status: () => status,
  };
}

function parsePayload(data: unknown): unknown {
  if (typeof data !== "string") return data;
  try {
    return JSON.parse(data);
  } catch {
    return data;
  }
}
