import { createContext, useContext } from "react";
import { IntlProvider, useIntl } from "react-intl";
import "./polyfills";
import { messages, type AppMessages, type Locale } from "./messages";

export const DEFAULT_LOCALE: Locale = "en";
export const SUPPORTED_LOCALES: string[] = Object.keys(messages);

type LocaleContextValue = { locale: string; setLocale: (locale: string) => void };
const LocaleContext = createContext<LocaleContextValue>({ locale: DEFAULT_LOCALE, setLocale: () => undefined });
export const useLocale = () => useContext(LocaleContext);
export const useText = () => useIntl().formatMessage;

type AppIntlProviderProps = { locale: string; setLocale: (locale: string) => void; messages?: Record<string, string> | AppMessages; children: React.ReactNode };

function resolveMessages(value: Record<string, string> | AppMessages | undefined, locale: string): Record<string, string> {
  if (!value) return messages[locale as Locale] ?? messages[DEFAULT_LOCALE];
  const nested = (value as AppMessages)[locale as Locale];
  if (nested) return nested;
  return value as Record<string, string>;
}

export function AppIntlProvider({ locale, setLocale, messages: appMessages, children }: AppIntlProviderProps) {
  return (
    <LocaleContext.Provider value={{ locale, setLocale }}>
      <IntlProvider locale={locale} messages={resolveMessages(appMessages, locale)}>{children}</IntlProvider>
    </LocaleContext.Provider>
  );
}
