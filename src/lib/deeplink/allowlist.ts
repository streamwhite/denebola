export const allowedExternalSchemes = ["https", "mailto", "myapp"] as const;
export function isAllowedExternalUrl(value: string) { try { return allowedExternalSchemes.includes(new URL(value).protocol.replace(":", "") as (typeof allowedExternalSchemes)[number]); } catch { return false; } }
