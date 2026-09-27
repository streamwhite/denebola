export const TRUNCATE_SUFFIX = "…";

export function capitalize(value: string): string {
  return value.length === 0 ? value : value[0].toUpperCase() + value.slice(1);
}

export function titleCase(value: string): string {
  return value.split(" ").map((word) => capitalize(word)).join(" ");
}

export function truncate(value: string, maxLength: number, suffix = TRUNCATE_SUFFIX): string {
  if (value.length <= maxLength) return value;
  return value.slice(0, Math.max(0, maxLength - suffix.length)) + suffix;
}

export function slugify(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function isNonEmpty(value: string | null | undefined): value is string {
  return typeof value === "string" && value.trim().length > 0;
}
