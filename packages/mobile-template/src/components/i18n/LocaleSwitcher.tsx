import { useText } from "../../lib/i18n/locale";
import { Select } from "../forms/Select";
import type { SelectOption } from "../forms/selectCore";

export function LocaleSwitcher({
  locale,
  locales,
  labels,
  onChange,
  label,
  className,
}: {
  locale: string;
  locales: readonly string[];
  labels?: Record<string, string>;
  onChange: (locale: string) => void;
  label?: string;
  className?: string;
}) {
  const text = useText();
  const options: SelectOption[] = locales.map((value) => ({ value, label: labels?.[value] ?? value }));
  return (
    <Select
      options={options}
      value={locale}
      onChange={(value) => value && onChange(value)}
      label={label ?? text({ id: "common.language" })}
      className={className}
    />
  );
}
