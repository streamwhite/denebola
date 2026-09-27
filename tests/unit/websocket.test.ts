import { describe, expect, it, vi } from "vitest";
import { createWebSocketClient, type WebSocketStatus } from "@/lib/api/websocket";

type Handler = (event: unknown) => void;

class FakeSocket {
  onopen: Handler | null = null;
  onmessage: Handler | null = null;
  onerror: Handler | null = null;
  onclose: Handler | null = null;
  sent: string[] = [];
  closed: { code?: number; reason?: string } | null = null;
  constructor(readonly url: string) {}
  send(data: string) {
    this.sent.push(data);
  }
  close(code?: number, reason?: string) {
    this.closed = { code, reason };
  }
  open() {
    this.onopen?.({});
  }
  message(data: unknown) {
    this.onmessage?.({ data });
  }
  drop(code = 1006, reason = "") {
    this.onclose?.({ code, reason });
  }
}

function setup(options: Record<string, unknown> = {}) {
  const sockets: FakeSocket[] = [];
  const statuses: WebSocketStatus[] = [];
  const messages: unknown[] = [];
  const client = createWebSocketClient({
    url: "wss://api.test/socket",
    reconnect: false,
    onStatus: (status) => statuses.push(status),
    onMessage: (data) => messages.push(data),
    socketFactory: (url) => {
      const socket = new FakeSocket(url);
      sockets.push(socket);
      return socket as unknown as WebSocket;
    },
    ...options,
  });
  return { client, sockets, statuses, messages };
}

describe("createWebSocketClient", () => {
  it("connects, reports open status and parses JSON messages", () => {
    const { client, sockets, statuses, messages } = setup();
    const socket = sockets[0];

    socket.open();
    socket.message('{"type":"ping"}');
    socket.message("plain");

    expect(statuses).toEqual(["connecting", "open"]);
    expect(client.status()).toBe("open");
    expect(messages).toEqual([{ type: "ping" }, "plain"]);
  });

  it("serializes objects on send", () => {
    const { client, sockets } = setup();
    sockets[0].open();

    client.send({ hello: "world" });
    client.send("raw");

    expect(sockets[0].sent).toEqual(['{"hello":"world"}', "raw"]);
  });

  it("does not reconnect after a user close", () => {
    const { client, sockets, statuses } = setup();
    sockets[0].open();

    client.close();

    expect(sockets[0].closed).toEqual({ code: 1000, reason: "" });
    expect(statuses[statuses.length - 1]).toBe("open");
  });

  it("reports reconnecting status when reconnect is enabled", () => {
    vi.useFakeTimers();
    const { sockets, statuses } = setup({ reconnect: true, baseDelayMs: 1, maxDelayMs: 1 });
    sockets[0].open();
    sockets[0].drop();

    expect(statuses).toContain("reconnecting");
    vi.runOnlyPendingTimers();
    expect(sockets).toHaveLength(2);
    vi.useRealTimers();
  });
});
