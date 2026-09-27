import { render } from "@testing-library/react-native";
import { Button } from "@/components/ui/Button";
import { ThemeProvider } from "@/lib/theme/ThemeProvider";

test("button exposes its accessible label", async () => {
  const { getByRole } = await render(
    <ThemeProvider>
      <Button title="Continue" onPress={() => undefined} />
    </ThemeProvider>,
  );
  expect(getByRole("button", { name: "Continue" })).toBeTruthy();
});
