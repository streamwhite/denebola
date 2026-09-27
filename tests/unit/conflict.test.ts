import { describe, expect, it } from "vitest";
import { lastWriteWins, resolveConflict, resolveWith } from "@/lib/database/conflict";

type Record = { value: string; updatedAt: number };

const client: Record = { value: "client", updatedAt: 200 };
const server: Record = { value: "server", updatedAt: 100 };

describe("resolveConflict", () => {
  it("picks the newest write by default", () => {
    expect(resolveConflict(client, server)).toEqual(client);
    expect(lastWriteWins(server, client)).toEqual(client);
  });

  it("honors explicit client and server strategies", () => {
    expect(resolveConflict(client, server, "client-wins")).toEqual(client);
    expect(resolveConflict(client, server, "server-wins")).toEqual(server);
  });

  it("supports a custom merge function", () => {
    const merged = resolveWith(client, server, (left, right) => ({ ...left, value: `${right.value}+${left.value}` }));
    expect(merged.value).toBe("server+client");
  });
});
