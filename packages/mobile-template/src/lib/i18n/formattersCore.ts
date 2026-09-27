export type FilledMessage = { id: string; defaultMessage?: string; values?: Record<string, string | number> };

export function withLocale(locale: string, messages: Record<string, string>, overrides: Record<string, Record<string, string>> = {}): Record<string, string> {
  return { ...messages, ...overrides[locale] };
}

export function placeholdersOf(id: string, messages: Record<string, string>): string[] {
  const template = messages[id] ?? id;
  return [...template.matchAll(/\{([^}]+)\}/g)].map((match) => match[1].trim());
}

export function missingKeys(used: readonly string[], messages: Record<string, string>): string[] {
  return used.filter((id) => !(id in messages));
}
