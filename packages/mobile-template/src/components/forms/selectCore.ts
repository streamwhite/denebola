export type SelectOption = { value: string; label: string; disabled?: boolean };

export function filterOptions(options: readonly SelectOption[], query: string): SelectOption[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return [...options];
  return options.filter((option) => option.label.toLowerCase().includes(needle) || option.value.toLowerCase().includes(needle));
}

export function labelFor(options: readonly SelectOption[], value: string | null | undefined): string | null {
  if (!value) return null;
  return options.find((option) => option.value === value)?.label ?? value;
}

export function labelsFor(options: readonly SelectOption[], values: readonly string[]): string[] {
  return values.map((value) => labelFor(options, value) ?? value);
}

export function findExact(options: readonly SelectOption[], query: string): SelectOption | null {
  const trimmed = query.trim();
  if (!trimmed) return null;
  const lower = trimmed.toLowerCase();
  return options.find((option) => !option.disabled && (option.value.toLowerCase() === lower || option.label.toLowerCase() === lower)) ?? null;
}

export function toOption(query: string): SelectOption {
  const value = query.trim();
  return { value, label: value };
}
