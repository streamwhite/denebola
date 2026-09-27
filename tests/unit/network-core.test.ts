import { describe, expect, it } from "vitest";
import { connectivityStatus, INITIAL_NETWORK_STATE, isMetered, isOnline, toNetworkState } from "@/lib/network/networkCore";

describe("toNetworkState", () => {
  it("defaults reachability to the connection state and normalizes the type", () => {
    expect(toNetworkState({ isConnected: true, type: "wifi" })).toEqual({ isConnected: true, isInternetReachable: true, type: "wifi" });
    expect(toNetworkState({ isConnected: true, isInternetReachable: false, type: "vpn" })).toEqual({ isConnected: true, isInternetReachable: false, type: "unknown" });
    expect(toNetworkState({})).toEqual({ isConnected: false, isInternetReachable: false, type: "unknown" });
  });
});

describe("connectivity", () => {
  it("is offline when not connected or not reachable", () => {
    expect(isOnline(toNetworkState({ isConnected: true, isInternetReachable: true }))).toBe(true);
    expect(isOnline(toNetworkState({ isConnected: true, isInternetReachable: false }))).toBe(false);
    expect(connectivityStatus(toNetworkState({ isConnected: false }))).toBe("offline");
    expect(connectivityStatus(INITIAL_NETWORK_STATE)).toBe("online");
  });

  it("treats cellular as metered", () => {
    expect(isMetered(toNetworkState({ isConnected: true, type: "cellular" }))).toBe(true);
    expect(isMetered(toNetworkState({ isConnected: true, type: "wifi" }))).toBe(false);
  });
});
