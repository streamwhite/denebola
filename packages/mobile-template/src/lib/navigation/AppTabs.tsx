import { Tabs } from "expo-router";
import type { ColorValue } from "react-native";

type ScreenOptions = React.ComponentProps<typeof Tabs.Screen>["options"];

export type AppTab = {
  name: string;
  title: string;
  icon?: (props: { color: ColorValue; size: number; focused: boolean }) => React.ReactNode;
  options?: ScreenOptions;
};

export function AppTabs({ tabs, screenOptions }: { tabs: readonly AppTab[]; screenOptions?: React.ComponentProps<typeof Tabs>["screenOptions"] }) {
  return (
    <Tabs screenOptions={screenOptions}>
      {tabs.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            ...tab.options,
            title: tab.title,
            ...(tab.icon ? { tabBarIcon: ({ color, size, focused }) => tab.icon?.({ color, size, focused }) } : {}),
          }}
        />
      ))}
    </Tabs>
  );
}
