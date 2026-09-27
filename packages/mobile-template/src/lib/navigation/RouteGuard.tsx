import { Redirect } from "expo-router";

export function RouteGuard({ when, redirectTo, children }: { when: boolean; redirectTo: string; children: React.ReactNode }) {
  if (when) return <>{children}</>;
  return <Redirect href={redirectTo as never} />;
}
