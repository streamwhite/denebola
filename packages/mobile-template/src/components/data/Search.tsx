import { useEffect, useState } from "react";
import { View, type ViewProps } from "react-native";
import { useText } from "../../lib/i18n/locale";
import { Input } from "../ui/Input";

export function Search({
  value,
  onChangeText,
  placeholder,
  debounceMs = 250,
  onSubmit,
  className,
  ...props
}: Omit<ViewProps, "children"> & {
  value?: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
  onSubmit?: (value: string) => void;
  className?: string;
}) {
  const text = useText();
  const [query, setQuery] = useState(value ?? "");

  useEffect(() => {
    if (value !== undefined && value !== query) setQuery(value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  useEffect(() => {
    if (debounceMs <= 0) return;
    const timer = setTimeout(() => onChangeText(query), debounceMs);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, debounceMs]);

  function update(next: string) {
    setQuery(next);
    if (debounceMs <= 0) onChangeText(next);
  }

  return (
    <View className={className} {...props}>
      <Input
        value={query}
        onChangeText={update}
        placeholder={placeholder ?? text({ id: "common.search" })}
        returnKeyType="search"
        onSubmitEditing={() => onSubmit?.(query)}
        autoCorrect={false}
        clearButtonMode="while-editing"
      />
    </View>
  );
}
