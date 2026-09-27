import { useState } from "react";
import { Pressable, ScrollView, TextInput, View } from "react-native";
import { useText } from "../../lib/i18n/locale";
import { useTheme } from "../../lib/theme/ThemeProvider";
import { cx } from "../../lib/utils/cx";
import { Text } from "../ui/Text";
import { filterOptions, findExact, labelFor, toOption, type SelectOption } from "./selectCore";

export function MultiSelect({
  options,
  values,
  onChange,
  label,
  placeholder,
  searchable = true,
  allowCustom = false,
  max,
  disabled = false,
  error,
  className,
}: {
  options: readonly SelectOption[];
  values: readonly string[];
  onChange: (values: string[], options: SelectOption[]) => void;
  label?: string;
  placeholder?: string;
  searchable?: boolean;
  allowCustom?: boolean;
  max?: number;
  disabled?: boolean;
  error?: string;
  className?: string;
}) {
  const { tokens } = useTheme();
  const text = useText();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const visible = searchable ? filterOptions(options, query) : (options as SelectOption[]);
  const custom = allowCustom && query.trim() && !findExact(options, query) ? toOption(query) : null;
  const atMax = max != null && values.length >= max;

  function toggle(option: SelectOption) {
    if (values.includes(option.value)) {
      onChange(values.filter((value) => value !== option.value), []);
      return;
    }
    if (atMax || option.disabled) return;
    onChange([...values, option.value], [option]);
  }

  return (
    <View className={cx("gap-2", className)}>
      {label ? <Text variant="label">{label}</Text> : null}
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: open, disabled }}
        disabled={disabled}
        onPress={() => setOpen((current) => !current)}
        className={cx("min-h-12 flex-row flex-wrap items-center gap-2 rounded-lg border bg-card px-3.5 py-2", error ? "border-destructive" : "border-border", disabled && "opacity-50")}
      >
        {values.length === 0 ? <Text tone="muted">{placeholder ?? text({ id: "common.selectPlaceholder" })}</Text> : null}
        {values.map((value) => (
          <View key={value} className="flex-row items-center gap-1 rounded-full bg-primary/15 px-2.5 py-1">
            <Text variant="caption" tone="primary">
              {labelFor(options, value)}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Remove ${labelFor(options, value)}`}
              onPress={() => onChange(values.filter((item) => item !== value), [])}
            >
              <Text variant="caption" tone="muted">
                ✕
              </Text>
            </Pressable>
          </View>
        ))}
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
              <Pressable accessibilityRole="button" disabled={atMax} onPress={() => toggle(custom)} className={cx("px-3 py-2.5", atMax && "opacity-40")}>
                <Text>{text({ id: "common.useValue" }, { value: custom.label })}</Text>
              </Pressable>
            ) : null}
            {visible.map((option) => {
              const selected = values.includes(option.value);
              return (
                <Pressable
                  key={option.value}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: selected, disabled: option.disabled || (!selected && atMax) }}
                  disabled={option.disabled || (!selected && atMax)}
                  onPress={() => toggle(option)}
                  className={cx("flex-row items-center justify-between px-3 py-2.5", option.disabled && "opacity-40")}
                >
                  <Text>{option.label}</Text>
                  {selected ? <Text tone="primary">✓</Text> : null}
                </Pressable>
              );
            })}
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
