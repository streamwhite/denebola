import { render } from "@testing-library/react-native";
import { Text } from "react-native";
import { ThemeProvider, useTheme } from "@/lib/theme/ThemeProvider";

function SchemeProbe() {
  const { scheme, preference } = useTheme();
  return <Text>{`${preference}:${scheme}`}</Text>;
}

test("an explicit theme preference resolves to a concrete scheme", async () => {
  const { getByText } = await render(
    <ThemeProvider preference="dark">
      <SchemeProbe />
    </ThemeProvider>,
  );

  expect(getByText("dark:dark")).toBeTruthy();
});
