import { render } from "@testing-library/react-native";
import { Text } from "react-native";
import { AppIntlProvider, useText } from "@/lib/i18n/locale";

function MessageProbe() {
  const text = useText();
  return <Text>{text({ id: "home.title" })}</Text>;
}

test("app messages are merged over the framework defaults", async () => {
  const { getByText } = await render(
    <AppIntlProvider locale="en" setLocale={() => undefined} messages={{ en: { "home.title": "My App" } }}>
      <MessageProbe />
    </AppIntlProvider>,
  );

  expect(getByText("My App")).toBeTruthy();
});
