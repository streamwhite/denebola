export type TranslationInput = Record<string, string>;
export type ValidationIssue =
  | { type: "missing"; locale: string; key: string }
  | { type: "extra"; locale: string; key: string }
  | { type: "placeholder-mismatch"; locale: string; key: string; placeholders: string[] };
export type TranslationCatalog = Record<string, TranslationInput>;

const ARGUMENT_NAME = /[A-Za-z_$][\w$]*/;
const SIMPLE_PLACEHOLDER = /\{\s*([A-Za-z_$][\w$]*)\s*\}/g;

export function extractPlaceholders(message: string): string[] {
  const names = [...message.matchAll(SIMPLE_PLACEHOLDER)].map((match) => match[1]);
  return names.filter((name) => ARGUMENT_NAME.test(name)).sort();
}

export function validateTranslations(catalog: TranslationCatalog, baseLocale: string): ValidationIssue[] {
  const base = catalog[baseLocale];
  if (!base) return [];
  const issues: ValidationIssue[] = [];
  const baseKeys = Object.keys(base);
  for (const [locale, messages] of Object.entries(catalog)) {
    if (locale === baseLocale) continue;
    issues.push(...compareLocale(locale, base, baseKeys, messages));
  }
  return issues;
}

function compareLocale(locale: string, base: TranslationInput, baseKeys: readonly string[], messages: TranslationInput): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  for (const key of baseKeys) {
    if (!(key in messages)) {
      issues.push({ type: "missing", locale, key });
      continue;
    }
    const expected = extractPlaceholders(base[key]);
    const actual = extractPlaceholders(messages[key]);
    if (expected.join(",") !== actual.join(",")) issues.push({ type: "placeholder-mismatch", locale, key, placeholders: expected });
  }
  for (const key of Object.keys(messages)) if (!(key in base)) issues.push({ type: "extra", locale, key });
  return issues;
}
