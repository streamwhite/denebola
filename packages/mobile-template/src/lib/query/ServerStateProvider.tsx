import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useNetwork } from "../network/NetworkProvider";
import type { QueryPersister } from "./persister";

export function ServerStateProvider({ persister, onReconnect, children }: { persister?: QueryPersister; onReconnect?: () => void; children: React.ReactNode }) {
  const client = useQueryClient();
  const { isOnline } = useNetwork();

  useEffect(() => {
    if (!persister) return;
    persister.restore(client).catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client, persister]);

  useEffect(() => {
    if (!persister) return;
    const unsubscribe = client.getQueryCache().subscribe(() => {
      void persister.persist(client).catch(() => undefined);
    });
    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client, persister]);

  useEffect(() => {
    if (isOnline) onReconnect?.();
  }, [isOnline, onReconnect]);

  return <>{children}</>;
}
