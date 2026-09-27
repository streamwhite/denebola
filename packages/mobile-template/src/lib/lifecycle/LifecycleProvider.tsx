import { createContext, useContext, useEffect, useState } from "react";
import { getLifecycleState, subscribeToLifecycle } from "./appLifecycle";
import type { LifecycleState } from "./lifecycleState";

const LifecycleContext = createContext<LifecycleState>("active");

export function LifecycleProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<LifecycleState>(getLifecycleState);
  useEffect(() => subscribeToLifecycle(setState), []);
  return <LifecycleContext.Provider value={state}>{children}</LifecycleContext.Provider>;
}

export const useAppLifecycle = () => useContext(LifecycleContext);
