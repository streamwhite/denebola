import { useState } from "react";
import { Pressable, ScrollView, TextInput, View } from "react-native";
import { useText } from "../../lib/i18n/locale";
import { useTheme } from "../../lib/theme/ThemeProvider";
import { cx } from "../../lib/utils/cx";
import { Text } from "../ui/Text";
import { filterOptions, findExact, labelFor, toOption, type SelectOption } from "./selectCore";

export function Select({
  options,
  value,
  onChange,
  label,
  placeholder,
  searchable = false,
  allowCustom = false,
  disabled = false,
  error,
  className,
}: {
  options: readonly SelectOption[];
  value: string | null;
  onChange: (value: string | null, option: SelectOption | null) => void;
  label?: string;
  placeholder?: string;
  searchable?: boolean;
  allowCustom?: boolean;
  disabled?: boolean;
  error?: string;
  className?: string;
}) {
  const { tokens } = useTheme();
  const text = useText();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const selectedLabel = labelFor(options, value);
  const visible = searchable ? filterOptions(options, query) : (options as SelectOption[]);
  const custom = allowCustom && query.trim() && !findExact(options, query) ? toOption(query) : null;
  const close = () => {
    setOpen(false);
    setQuery("");
  };

  return (
    <View className={cx("gap-2", className)}>
      {label ? <Text variant="label">{label}</Text> : null}
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: open, disabled }}
        disabled={disabled}
        onPress={() => setOpen((current) => !current)}
        className={cx("min-h-12 flex-row items-center justify-between rounded-lg border bg-card px-3.5", error ? "border-destructive" : "border-border", disabled && "opacity-50")}
      >
        <Text tone={selectedLabel ? "default" : "muted"}>{selectedLabel ?? placeholder ?? text({ id: "common.selectPlaceholder" })}</Text>
        <Text tone="muted">{open ? "▲" : "▼"}</Text>
      </Pressable>

      {open ? (
        <View className="gap-2 rounded-lg border border-border bg-card p-2" style={tokens.shadow.sm}>
          {searchable ? (
            <TextInput
              autoFocus
              value={query}
              onChangeText={setQuery}
              placeholder={text({ id: "common.search" })}
              placeholderTextColor={tokens.colors.muted}
              className="min-h-10 rounded-md border border-border bg-background px-3 text-foreground"
            />
          ) : null}
          <ScrollView className="max-h-64" keyboardShouldPersistTaps="handled">
            {custom ? (
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  onChange(custom.value, custom);
                  close();
                }}
                className="flex-row items-center justify-between px-3 py-2.5"
              >
                <Text>{text({ id: "common.useValue" }, { value: custom.label })}</Text>
              </Pressable>
            ) : null}
            {visible.map((option) => (
              <Pressable
                key={option.value}
                accessibilityRole="button"
                accessibilityState={{ selected: option.value === value }}
                disabled={option.disabled}
                onPress={() => {
                  onChange(option.value, option);
                  close();
                }}
                className={cx("flex-row items-center justify-between px-3 py-2.5", option.disabled && "opacity-40")}
              >
                <Text>{option.label}</Text>
                {option.value === value ? <Text tone="primary">✓</Text> : null}
              </Pressable>
            ))}
          </ScrollView>
        </View>
      ) : null}

      {error ? (
        <Text accessibilityRole="alert" variant="caption" tone="destructive">
          {error}
        </Text>
      ) : null}
    </View>
  );
}
