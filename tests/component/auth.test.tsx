import { act, renderHook, waitFor } from "@testing-library/react-native";
import { AuthProvider, useAuth } from "@/lib/auth/AuthProvider";
import type { AuthClient, Session } from "@/lib/auth/types";
import { createMemoryStorage } from "@/lib/storage/memoryStorage";

const session: Session = {
  user: { id: "1", email: "user@example.com", roles: ["admin"], permissions: ["orders:write"] },
  accessToken: "token",
};

function client(overrides: Partial<AuthClient> = {}): AuthClient {
  return {
    login: async () => session,
    logout: async () => undefined,
    restore: async () => null,
    ...overrides,
  };
}

function wrapper(authClient: AuthClient, storage = createMemoryStorage()) {
  return ({ children }: { children: React.ReactNode }) => (
    <AuthProvider client={authClient} storage={storage}>
      {children}
    </AuthProvider>
  );
}

test("restores a persisted session on mount", async () => {
  const storage = createMemoryStorage();
  await storage.set("auth.session", session);
  const { result } = await renderHook(() => useAuth(), { wrapper: wrapper(client(), storage) });

  await waitFor(() => expect(result.current.status).toBe("authenticated"));
  expect(result.current.user).toEqual(session.user);
});

test("logs in, exposes RBAC checks and logs out", async () => {
  const { result } = await renderHook(() => useAuth(), { wrapper: wrapper(client()) });
  await waitFor(() => expect(result.current.status).toBe("anonymous"));

  await act(async () => {
    await result.current.login({ email: "user@example.com", password: "pw" });
  });
  expect(result.current.status).toBe("authenticated");
  expect(result.current.can({ roles: ["admin"], permissions: ["orders:write"] })).toBe(true);
  expect(result.current.hasPermission("orders:read")).toBe(false);

  await act(async () => {
    await result.current.logout();
  });
  expect(result.current.status).toBe("anonymous");
  expect(result.current.user).toBeNull();
});

test("refreshes the session through the client", async () => {
  const refreshed: Session = { ...session, accessToken: "fresh" };
  const authClient = client({ login: async () => session, refresh: async () => refreshed });
  const storage = createMemoryStorage();
  const { result } = await renderHook(() => useAuth(), { wrapper: wrapper(authClient, storage) });
  await waitFor(() => expect(result.current.status).toBe("anonymous"));

  await act(async () => {
    await result.current.login({ email: "user@example.com", password: "pw" });
  });
  await act(async () => {
    await result.current.refresh();
  });

  expect(result.current.session?.accessToken).toBe("fresh");
  expect((await storage.get<Session>("auth.session"))?.accessToken).toBe("fresh");
});

test("reports unimplemented actions instead of failing silently", async () => {
  const { result } = await renderHook(() => useAuth(), { wrapper: wrapper(client()) });
  await waitFor(() => expect(result.current.status).toBe("anonymous"));

  await expect(result.current.register({ email: "a@b.com", password: "pw" })).rejects.toThrow("register");
});
