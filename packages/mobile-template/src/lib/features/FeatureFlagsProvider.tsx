import { createContext, useContext, useMemo } from "react";
import { createFeatureFlags, type FeatureFlags } from "./flags";

const FeatureFlagsContext = createContext<FeatureFlags>(createFeatureFlags());

export function FeatureFlagsProvider({ flags, children }: { flags?: FeatureFlags; children: React.ReactNode }) {
  const value = useMemo(() => createFeatureFlags(flags), [flags]);
  return <FeatureFlagsContext.Provider value={value}>{children}</FeatureFlagsContext.Provider>;
}

export const useFeatureFlags = () => useContext(FeatureFlagsContext);

export function useFeatureFlag(name: string, fallback = false): boolean {
  return useFeatureFlags()[name] ?? fallback;
}
