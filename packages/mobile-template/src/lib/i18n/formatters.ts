import { useIntl, type FormatDateOptions, type FormatNumberOptions } from "react-intl";
import { DATE_STYLE_LONG, DATE_STYLE_MEDIUM, TIME_STYLE_SHORT, TRANS_CURRENCY, TRANS_UNIT } from "./categories";

export function useI18nFormatters() {
  const intl = useIntl();
  return {
    formatNumber: (value: number, options?: FormatNumberOptions) => intl.formatNumber(value, options),
    formatCurrency: (value: number, currency = TRANS_CURRENCY, options?: FormatNumberOptions) => intl.formatNumber(value, { style: "currency", currency, ...options }),
    formatPercent: (value: number, options?: FormatNumberOptions) => intl.formatNumber(value, { style: "percent", ...options }),
    formatDate: (value: Date | number, options?: FormatDateOptions) => intl.formatDate(value, options ?? { dateStyle: DATE_STYLE_LONG }),
    formatShortDate: (value: Date | number) => intl.formatDate(value, { dateStyle: DATE_STYLE_MEDIUM }),
    formatTime: (value: Date | number) => intl.formatTime(value, { timeStyle: TIME_STYLE_SHORT }),
    formatRelativeTime: (value: number, unit: Intl.RelativeTimeFormatUnit) => intl.formatRelativeTime(value, unit),
    formatMessage: intl.formatMessage,
    locale: intl.locale,
    units: TRANS_UNIT,
  };
}
