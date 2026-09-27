import { render } from "@testing-library/react-native";
import { Text } from "react-native";
import { FeatureFlagsProvider, useFeatureFlag } from "@/lib/features/FeatureFlagsProvider";

function FlagProbe() {
  return <Text>{useFeatureFlag("offlineMode") ? "on" : "off"}</Text>;
}

test("feature flag overrides reach consumers", async () => {
  const { getByText } = await render(
    <FeatureFlagsProvider flags={{ offlineMode: true }}>
      <FlagProbe />
    </FeatureFlagsProvider>,
  );

  expect(getByText("on")).toBeTruthy();
});
