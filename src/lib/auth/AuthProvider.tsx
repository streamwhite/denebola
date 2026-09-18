import { createContext, useContext, useEffect, useState } from "react";
import type { AuthClient, Session } from "@/lib/auth/types";
import { createSessionManager } from "@/lib/auth/session";
import { secureStorage } from "@/lib/storage/secureStorage";

type AuthState = { status: "loading" | "authenticated" | "anonymous"; session: Session | null; login: AuthClient["login"]; logout: () => Promise<void> };
const AuthContext = createContext<AuthState | null>(null);
export const useAuth = () => { const value = useContext(AuthContext); if (!value) throw new Error("useAuth must be used inside AuthProvider"); return value; };

export function AuthProvider({ client, children }: { client: AuthClient; children: React.ReactNode }) {
  const manager = createSessionManager(secureStorage);
  const [session, setSession] = useState<Session | null>(null);
  const [status, setStatus] = useState<AuthState["status"]>("loading");
  useEffect(() => { manager.restore().then((value) => { setSession(value); setStatus(value ? "authenticated" : "anonymous"); }).catch(() => setStatus("anonymous")); }, []);
  async function login(email: string, password: string) { const value = await client.login(email, password); await manager.save(value); setSession(value); setStatus("authenticated"); return value; }
  async function logout() { await client.logout(); await manager.clear(); setSession(null); setStatus("anonymous"); }
  return <AuthContext.Provider value={{ status, session, login, logout }}>{children}</AuthContext.Provider>;
}
