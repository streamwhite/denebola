import { Card, LocaleSwitcher, Screen, Text, useLocale, useText } from "{{packageName}}";
import { supportedLocales } from "../../messages";

export function SettingsScreen() {
  const text = useText();
  const { locale, setLocale } = useLocale();
  return (
    <Screen>
      <Text variant="h3">{text({ id: "settings.title" })}</Text>
      <Card className="gap-4">
        <Text tone="muted">{text({ id: "settings.locale" }, { locale })}</Text>
        <LocaleSwitcher locale={locale} locales={supportedLocales} onChange={setLocale} />
      </Card>
    </Screen>
  );
}
