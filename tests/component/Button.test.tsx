import { render } from "@testing-library/react-native";
import { Button } from "@/components/ui/Button";

test("button exposes its accessible label", async () => {
  const { getByRole } = await render(<Button title="Continue" onPress={() => undefined} />);
  expect(getByRole("button", { name: "Continue" })).toBeTruthy();
});
