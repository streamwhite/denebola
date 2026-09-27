import { QueryClient, type QueryClientConfig } from "@tanstack/react-query";
import { queryDefaults } from "../query/queryClientCore";

export function createQueryClient(config: QueryClientConfig = {}): QueryClient {
  const { defaultOptions, ...rest } = config;
  const defaults = queryDefaults();
  return new QueryClient({
    ...rest,
    defaultOptions: {
      queries: { ...defaults.queries, ...defaultOptions?.queries },
      mutations: { ...defaults.mutations, ...defaultOptions?.mutations },
    },
  });
}
