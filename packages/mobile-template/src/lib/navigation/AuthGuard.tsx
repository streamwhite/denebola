import { Redirect } from "expo-router";
import { LoadingState } from "../../components/feedback/LoadingState";
import { useAuth } from "../auth/AuthProvider";

const DEFAULT_REDIRECT = "/login";

export function AuthGuard({ redirectTo = DEFAULT_REDIRECT, children }: { redirectTo?: string; children: React.ReactNode }) {
  const { status } = useAuth();
  if (status === "loading") return <LoadingState className="flex-1" />;
  if (status !== "authenticated") return <Redirect href={redirectTo as never} />;
  return <>{children}</>;
}
