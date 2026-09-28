import { render } from "@testing-library/react-native";
import { Text } from "react-native";
import { AppIntlProvider, useText } from "@/lib/i18n/locale";

function MessageProbe({ id = "home.title" }: { id?: string }) {
  const text = useText();
  return <Text>{text({ id })}</Text>;
}

test("app messages are merged over the framework defaults", async () => {
  const { getByText } = await render(
    <AppIntlProvider locale="en" setLocale={() => undefined} messages={{ en: { "home.title": "My App" } }}>
      <MessageProbe />
    </AppIntlProvider>,
  );

  expect(getByText("My App")).toBeTruthy();
});

test("framework strings still resolve when the app only supplies its own messages", async () => {
  const { getByText } = await render(
    <AppIntlProvider locale="en" setLocale={() => undefined} messages={{ en: { "home.title": "My App" } }}>
      <MessageProbe id="common.loading" />
    </AppIntlProvider>,
  );

  expect(getByText("Loading")).toBeTruthy();
});

test("accepts a flat app catalog for the active locale", async () => {
  const { getByText } = await render(
    <AppIntlProvider locale="en" setLocale={() => undefined} messages={{ "home.title": "Flat App" }}>
      <MessageProbe />
    </AppIntlProvider>,
  );

  expect(getByText("Flat App")).toBeTruthy();
});
