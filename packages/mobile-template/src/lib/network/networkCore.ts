export type ConnectionType = "wifi" | "cellular" | "ethernet" | "none" | "unknown";
export type NetworkState = { isConnected: boolean; isInternetReachable: boolean; type: ConnectionType };
export type ConnectivityStatus = "online" | "offline" | "unknown";

export const INITIAL_NETWORK_STATE: NetworkState = { isConnected: true, isInternetReachable: true, type: "unknown" };

export function toNetworkState(input: { isConnected?: boolean | null; isInternetReachable?: boolean | null; type?: string | null }): NetworkState {
  const isConnected = input.isConnected ?? false;
  const isInternetReachable = input.isInternetReachable ?? isConnected;
  return { isConnected, isInternetReachable, type: normalizeType(input.type) };
}

export function isOnline(state: NetworkState): boolean {
  return state.isConnected && state.isInternetReachable;
}

export function connectivityStatus(state: NetworkState): ConnectivityStatus {
  if (!state.isConnected) return "offline";
  if (!state.isInternetReachable) return "offline";
  return "online";
}

export function isMetered(state: NetworkState): boolean {
  return state.type === "cellular";
}

function normalizeType(value: string | null | undefined): ConnectionType {
  if (value === "wifi" || value === "cellular" || value === "ethernet" || value === "none") return value;
  return "unknown";
}
