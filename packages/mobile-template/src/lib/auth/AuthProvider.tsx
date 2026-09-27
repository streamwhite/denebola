import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { secureStorage } from "../storage/secureStorage";
import type { Storage } from "../storage/types";
import { can, canAny, hasAnyRole, hasPermission, hasRole, type AccessRequirement } from "./rbac";
import { createSessionManager, isSessionExpired } from "./session";
import type { AuthStatus, LoginCredentials, OAuthProviderId, ProfileUpdate, RegisterInput, Session, User } from "./types";

export type AuthState = {
  status: AuthStatus;
  session: Session | null;
  user: User | null;
  login: (credentials: LoginCredentials | string, password?: string) => Promise<Session>;
  logout: () => Promise<void>;
  register: (input: RegisterInput) => Promise<Session>;
  requestPasswordReset: (email: string) => Promise<void>;
  confirmPasswordReset: (token: string, password: string) => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  refresh: () => Promise<Session | null>;
  restore: () => Promise<Session | null>;
  updateProfile: (profile: ProfileUpdate) => Promise<User>;
  loginWithOAuth: (provider: OAuthProviderId, redirectUri: string) => Promise<Session | null>;
  can: (requirement: AccessRequirement) => boolean;
  canAny: (requirements: readonly AccessRequirement[]) => boolean;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: readonly string[]) => boolean;
  hasPermission: (permission: string) => boolean;
};

const AuthContext = createContext<AuthState | null>(null);
export const useAuth = () => { const value = useContext(AuthContext); if (!value) throw new Error("useAuth must be used inside AuthProvider"); return value; };

export function AuthProvider({ client, storage = secureStorage, children }: { client: import("./types").AuthClient; storage?: Storage; children: React.ReactNode }) {
  const manager = useMemo(() => createSessionManager(storage), [storage]);
  const [session, setSession] = useState<Session | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");

  const apply = useCallback((value: Session | null) => {
    setSession(value);
    setStatus(value ? "authenticated" : "anonymous");
  }, []);

  const restore = useCallback(async () => {
    const stored = await manager.restore();
    if (!stored || isSessionExpired(stored)) {
      if (stored) await manager.clear();
      apply(null);
      return null;
    }
    apply(stored);
    return stored;
  }, [manager, apply]);

  useEffect(() => {
    restore().catch(() => apply(null));
  }, [restore]);

  const persist = useCallback(async (value: Session | null): Promise<Session | null> => {
    if (value) await manager.save(value);
    else await manager.clear();
    apply(value);
    return value;
  }, [manager, apply]);

  const persistSession = useCallback(
    async (value: Session): Promise<Session> => (await persist(value)) ?? value,
    [persist],
  );

  const refresh = useCallback(async () => {
    if (!session || !client.refresh) return session;
    const next = await client.refresh(session);
    await persist(next);
    return next;
  }, [session, client, persist]);

  function requireClient<F>(method: F | undefined, name: string): NonNullable<F> {
    if (!method) throw new Error(`AuthClient.${name} is not implemented`);
    return method as NonNullable<F>;
  }

  const value: AuthState = {
    status,
    session,
    user: session?.user ?? null,
    login: async (credentials, password) => persistSession(await client.login(credentials, password)),
    logout: async () => {
      await client.logout().catch(() => undefined);
      await persist(null);
    },
    register: async (input) => persistSession(await requireClient(client.register, "register")(input)),
    requestPasswordReset: (email) => requireClient(client.requestPasswordReset, "requestPasswordReset")(email),
    confirmPasswordReset: (token, password) => requireClient(client.confirmPasswordReset, "confirmPasswordReset")(token, password),
    verifyEmail: (token) => requireClient(client.verifyEmail, "verifyEmail")(token),
    refresh,
    restore,
    updateProfile: async (profile) => {
      const user = await requireClient(client.updateProfile, "updateProfile")(profile);
      if (session) await persist({ ...session, user: { ...session.user, ...user } });
      return user;
    },
    loginWithOAuth: async (provider, redirectUri) => persist(await requireClient(client.loginWithOAuth, "loginWithOAuth")(provider, redirectUri)),
    // (persist returns Session | null; loginWithOAuth resolves a Session | null by contract)
    can: (requirement) => can(session?.user, requirement),
    canAny: (requirements) => canAny(session?.user, requirements),
    hasRole: (role) => hasRole(session?.user, role),
    hasAnyRole: (roles) => hasAnyRole(session?.user, roles),
    hasPermission: (permission) => hasPermission(session?.user, permission),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
