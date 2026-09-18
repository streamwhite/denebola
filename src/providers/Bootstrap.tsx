import { useEffect, useState } from "react";
import * as SplashScreen from "expo-splash-screen";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";

void SplashScreen.preventAutoHideAsync();
export function Bootstrap({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  useEffect(() => { Promise.resolve().then(() => setReady(true)).catch((value) => setError(value instanceof Error ? value : new Error("Startup failed"))); }, []);
  useEffect(() => { if (ready || error) void SplashScreen.hideAsync(); }, [ready, error]);
  if (error) return <ErrorState title={error.message} onRetry={() => setError(null)} />;
  if (!ready) return <LoadingState className="flex-1" />;
  return <>{children}</>;
}
