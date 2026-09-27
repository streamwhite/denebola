export const DEFAULT_FRACTION_DIGITS = 2;

// Amounts are stored in minor units (cents) to avoid floating-point drift.
export type Money = { amount: number; currency: string };

export function toMinorUnits(amount: number, fractionDigits = DEFAULT_FRACTION_DIGITS): number {
  return Math.round(amount * 10 ** fractionDigits);
}

export function toMajorUnits(amount: number, fractionDigits = DEFAULT_FRACTION_DIGITS): number {
  return amount / 10 ** fractionDigits;
}

export function addMoney(left: Money, right: Money): Money {
  if (left.currency !== right.currency) throw new Error(`Currency mismatch: ${left.currency} vs ${right.currency}`);
  return { amount: left.amount + right.amount, currency: left.currency };
}

export function formatMoney(money: Money, locale: string, fractionDigits = DEFAULT_FRACTION_DIGITS): string {
  return new Intl.NumberFormat(locale, { style: "currency", currency: money.currency, minimumFractionDigits: fractionDigits, maximumFractionDigits: fractionDigits }).format(toMajorUnits(money.amount, fractionDigits));
}

export function formatNumber(value: number, locale: string, options?: Intl.NumberFormatOptions): string {
  return new Intl.NumberFormat(locale, options).format(value);
}

export function clampNumber(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function roundTo(value: number, decimals = 0): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}
