import type { QueryClient } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";
import { AppErrorBoundary } from "../components/feedback/AppErrorBoundary";
import type { ApiClient } from "../lib/api/client";
import type { ErrorReporter } from "../lib/errors/reporter";
import type { FeatureFlags } from "../lib/features/flags";
import type { NavigationState, RouteChangeHandler } from "../lib/navigation/NavigationStateProvider";
import { NavigationStateProvider } from "../lib/navigation/NavigationStateProvider";
import type { PerformanceMonitor } from "../lib/performance/performance";
import type { QueryPersister } from "../lib/query/persister";
import type { ThemePreference } from "../lib/theme/colorScheme";
import { AppProviders, type LocaleSource } from "./AppProviders";
import { Bootstrap } from "./Bootstrap";

export type MobileTemplateProviderProps = {
  queryClient?: QueryClient;
  apiClient?: ApiClient;
  queryPersister?: QueryPersister;
  onReconnect?: () => void;
  defaultLocale?: string;
  locale?: LocaleSource;
  featureFlags?: FeatureFlags;
  performance?: PerformanceMonitor;
  themePreference?: ThemePreference;
  errorReporter?: ErrorReporter;
  onRouteChange?: RouteChangeHandler;
  children: React.ReactNode;
};

export function MobileTemplateProvider({ queryClient, apiClient, queryPersister, onReconnect, defaultLocale, locale, featureFlags, performance, themePreference, errorReporter, onRouteChange, children }: MobileTemplateProviderProps) {
  const onError = errorReporter ? (error: Error, info: { componentStack?: string | null }) => errorReporter.report(error, { componentStack: info.componentStack }) : undefined;
  const content = (
    <AppErrorBoundary onError={onError}>
      <Bootstrap>
        <StatusBar style="auto" />
        {children}
      </Bootstrap>
    </AppErrorBoundary>
  );
  return (
    <AppProviders queryClient={queryClient} apiClient={apiClient} queryPersister={queryPersister} onReconnect={onReconnect} defaultLocale={defaultLocale} locale={locale} featureFlags={featureFlags} performance={performance} themePreference={themePreference}>
      {onRouteChange ? <NavigationStateProvider onRouteChange={onRouteChange}>{content}</NavigationStateProvider> : content}
    </AppProviders>
  );
}

export type { NavigationState };
