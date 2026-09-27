import NetInfo, { type NetInfoState } from "@react-native-community/netinfo";
import { createContext, useContext, useEffect, useState } from "react";
import { connectivityStatus, isMetered, isOnline, type ConnectivityStatus, type NetworkState } from "./networkCore";

export type NetworkContextValue = { state: NetworkState; status: ConnectivityStatus; isOnline: boolean; isMetered: boolean };
type NetworkSource = { addEventListener: (listener: (state: NetInfoState) => void) => () => void; fetch: () => Promise<NetInfoState> };

const NetworkContext = createContext<NetworkContextValue>({ state: { isConnected: true, isInternetReachable: true, type: "unknown" }, status: "unknown", isOnline: true, isMetered: false });

export const useNetwork = () => useContext(NetworkContext);

export function useIsOffline(): boolean {
  return !useNetwork().isOnline;
}

export function NetworkProvider({ children, source = NetInfo as unknown as NetworkSource }: { children: React.ReactNode; source?: NetworkSource }) {
  const [state, setState] = useState<NetworkContextValue["state"]>({ isConnected: true, isInternetReachable: true, type: "unknown" });

  useEffect(() => {
    let active = true;
    const apply = (next: NetInfoState) => {
      if (active) setState({ isConnected: next.isConnected ?? false, isInternetReachable: next.isInternetReachable ?? false, type: (next.type as NetworkState["type"]) ?? "unknown" });
    };
    source.fetch().then(apply).catch(() => undefined);
    const unsubscribe = source.addEventListener(apply);
    return () => {
      active = false;
      unsubscribe();
    };
  }, [source]);

  const value: NetworkContextValue = { state, status: connectivityStatus(state), isOnline: isOnline(state), isMetered: isMetered(state) };
  return <NetworkContext.Provider value={value}>{children}</NetworkContext.Provider>;
}
