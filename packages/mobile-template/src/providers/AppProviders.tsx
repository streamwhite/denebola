import { QueryClientProvider, type QueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ToastProvider } from "../components/overlays/ToastProvider";
import { ApiProvider } from "../lib/api/ApiProvider";
import type { ApiClient } from "../lib/api/client";
import { createQueryClient } from "../lib/api/queryClient";
import { FeatureFlagsProvider } from "../lib/features/FeatureFlagsProvider";
import type { FeatureFlags } from "../lib/features/flags";
import { AppIntlProvider, DEFAULT_LOCALE } from "../lib/i18n/locale";
import { mergeMessages, messages } from "../lib/i18n/messages";
import { useLocaleController, type LocaleControllerOptions } from "../lib/i18n/useLocaleController";
import { LifecycleProvider } from "../lib/lifecycle/LifecycleProvider";
import { NetworkProvider } from "../lib/network/NetworkProvider";
import { PerformanceMonitorProvider } from "../lib/performance/PerformanceMonitorProvider";
import type { PerformanceMonitor } from "../lib/performance/performance";
import type { QueryPersister } from "../lib/query/persister";
import { ServerStateProvider } from "../lib/query/ServerStateProvider";
import { ThemeProvider } from "../lib/theme/ThemeProvider";
import type { ThemePreference } from "../lib/theme/colorScheme";

export type LocaleSource = "bundled" | "device" | LocaleControllerOptions;

export type AppProvidersProps = {
  queryClient?: QueryClient;
  apiClient?: ApiClient;
  queryPersister?: QueryPersister;
  onReconnect?: () => void;
  defaultLocale?: string;
  locale?: LocaleSource;
  featureFlags?: FeatureFlags;
  performance?: PerformanceMonitor;
  themePreference?: ThemePreference;
  children: React.ReactNode;
};

export function AppProviders({ queryClient, apiClient, queryPersister, onReconnect, defaultLocale = DEFAULT_LOCALE, locale = "bundled", featureFlags, performance, themePreference, children }: AppProvidersProps) {
  const [client] = useState(() => queryClient ?? createQueryClient());
  const config: LocaleControllerOptions | null = locale === "bundled" ? null : typeof locale === "object" ? locale : { source: messages };
  const controller = useLocaleController({ source: config?.source ?? messages, storage: config?.storage, load: config?.load, fallback: defaultLocale });
  const intl = {
    locale: config ? controller.locale : defaultLocale,
    setLocale: config ? controller.setLocale : () => undefined,
    messages: config ? controller.messages : mergeMessages(defaultLocale),
  };
  return (
    <QueryClientProvider client={client}>
      <NetworkProvider>
        <ServerStateProvider persister={queryPersister} onReconnect={onReconnect}>
          <PerformanceMonitorProvider monitor={performance}>
            <LifecycleProvider>
              <FeatureFlagsProvider flags={featureFlags}>
                <ThemeProvider preference={themePreference}>
                  {apiClient ? (
                    <ApiProvider client={apiClient}>
                      <AppIntlProvider {...intl}>
                        <ToastProvider>{children}</ToastProvider>
                      </AppIntlProvider>
                    </ApiProvider>
                  ) : (
                    <AppIntlProvider {...intl}>
                      <ToastProvider>{children}</ToastProvider>
                    </AppIntlProvider>
                  )}
                </ThemeProvider>
              </FeatureFlagsProvider>
            </LifecycleProvider>
          </PerformanceMonitorProvider>
        </ServerStateProvider>
      </NetworkProvider>
    </QueryClientProvider>
  );
}
