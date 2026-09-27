import { createContext, useContext, useEffect, useRef } from "react";
import { useGlobalSearchParams, usePathname, useSegments } from "expo-router";

export type NavigationState = { pathname: string; segments: string[]; params: Record<string, string | string[]> };
export type RouteChangeHandler = (state: NavigationState) => void;

const RouteChangeContext = createContext<RouteChangeHandler | null>(null);

export const useNavigationState = (): NavigationState => {
  const segments = useSegments();
  return { pathname: usePathname(), segments: [...segments], params: useGlobalSearchParams() };
};

export function NavigationStateProvider({ onRouteChange, children }: { onRouteChange?: RouteChangeHandler; children: React.ReactNode }) {
  const state = useNavigationState();
  const previous = useRef<string | null>(null);

  useEffect(() => {
    if (previous.current === state.pathname) return;
    previous.current = state.pathname;
    onRouteChange?.(state);
  }, [state, onRouteChange]);

  return <RouteChangeContext.Provider value={onRouteChange ?? null}>{children}</RouteChangeContext.Provider>;
}
