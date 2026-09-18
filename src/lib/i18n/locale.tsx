import { createContext, useContext } from "react";
import { IntlProvider, useIntl } from "react-intl";
import { APP_CONFIG } from "@/config/app";
import { messages } from "@/lib/i18n/messages";

type Locale = keyof typeof messages;
const LocaleContext = createContext<{ locale: Locale; setLocale: (locale: Locale) => void }>({ locale: APP_CONFIG.defaultLocale, setLocale: () => undefined });
export const useLocale = () => useContext(LocaleContext);
export const useText = () => useIntl().formatMessage;

export function AppIntlProvider({ locale, setLocale, children }: { locale: Locale; setLocale: (locale: Locale) => void; children: React.ReactNode }) {
  return <LocaleContext.Provider value={{ locale, setLocale }}><IntlProvider locale={locale} messages={messages[locale]}>{children}</IntlProvider></LocaleContext.Provider>;
}
