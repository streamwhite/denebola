const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^\+?[0-9\s\-()]{7,20}$/;

export function isEmail(value: string): boolean {
  return EMAIL_PATTERN.test(value);
}

export function isUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function isPhoneNumber(value: string): boolean {
  return PHONE_PATTERN.test(value);
}

export function isNumeric(value: string): boolean {
  return value.trim().length > 0 && !Number.isNaN(Number(value));
}

export function hasMinLength(value: string, min: number): boolean {
  return value.length >= min;
}

export function hasMaxLength(value: string, max: number): boolean {
  return value.length <= max;
}
