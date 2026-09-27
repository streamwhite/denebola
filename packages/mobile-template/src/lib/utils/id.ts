export const ID_ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyz";
export const DEFAULT_ID_LENGTH = 16;

export function createId(length = DEFAULT_ID_LENGTH): string {
  let id = "";
  for (let index = 0; index < length; index += 1) id += ID_ALPHABET[Math.floor(Math.random() * ID_ALPHABET.length)];
  return id;
}

export function createPrefixedId(prefix: string, length = DEFAULT_ID_LENGTH): string {
  return `${prefix}_${createId(length)}`;
}

export function createUuid(): string {
  const crypto = (globalThis as { crypto?: { randomUUID?: () => string } }).crypto;
  if (crypto?.randomUUID) return crypto.randomUUID();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (char) => {
    const random = Math.floor(Math.random() * 16);
    const value = char === "x" ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
}

export function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}
