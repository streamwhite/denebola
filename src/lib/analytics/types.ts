export type Analytics = { track: (name: string, properties?: Record<string, unknown>) => void; identify: (userId: string, properties?: Record<string, unknown>) => void; screen: (name: string) => void };
export const noopAnalytics: Analytics = { track: () => undefined, identify: () => undefined, screen: () => undefined };
