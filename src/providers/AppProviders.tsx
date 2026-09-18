import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { AppIntlProvider } from "@/lib/i18n/locale";

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const [locale, setLocale] = useState<"en" | "zh-CN">("en");
  return <QueryClientProvider client={queryClient}><AppIntlProvider locale={locale} setLocale={setLocale}>{children}</AppIntlProvider></QueryClientProvider>;
}
