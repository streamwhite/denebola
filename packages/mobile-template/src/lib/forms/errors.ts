import { ApiError } from "../api/errors";

export type FieldErrors = Record<string, string>;

function firstMessage(value: unknown): string | null {
  if (typeof value === "string") return value;
  if (Array.isArray(value) && typeof value[0] === "string") return value[0];
  return null;
}

export function mapFieldErrors(error: unknown, fields: readonly string[]): FieldErrors {
  if (!(error instanceof ApiError) || typeof error.details !== "object" || error.details === null) return {};
  const details = error.details as Record<string, unknown>;
  const result: FieldErrors = {};
  for (const field of fields) {
    const message = firstMessage(details[field]);
    if (message) result[field] = message;
  }
  return result;
}
