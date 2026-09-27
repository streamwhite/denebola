import { createContext, useContext } from "react";
import { noopPerformanceMonitor, type PerformanceMonitor } from "./performance";

const PerformanceMonitorContext = createContext<PerformanceMonitor>(noopPerformanceMonitor);

export function PerformanceMonitorProvider({ monitor = noopPerformanceMonitor, children }: { monitor?: PerformanceMonitor; children: React.ReactNode }) {
  return <PerformanceMonitorContext.Provider value={monitor}>{children}</PerformanceMonitorContext.Provider>;
}

export const usePerformanceMonitor = () => useContext(PerformanceMonitorContext);
