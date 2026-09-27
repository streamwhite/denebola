export const DEFAULT_DOWNLOAD_NAME = "download";
export const DEFAULT_TEMP_PREFIX = "tmp";

export function joinPath(directory: string, name: string): string {
  return `${directory.replace(/\/+$/, "")}/${name.replace(/^\/+/, "")}`;
}

export function fileExtension(name: string): string {
  const dot = name.lastIndexOf(".");
  return dot > 0 && dot < name.length - 1 ? name.slice(dot).toLowerCase() : "";
}

export function fileNameFromUrl(url: string): string {
  try {
    const name = new URL(url).pathname.split("/").filter(Boolean).pop();
    return name ? decodeURIComponent(name) : DEFAULT_DOWNLOAD_NAME;
  } catch {
    return DEFAULT_DOWNLOAD_NAME;
  }
}

export function temporaryFileName(prefix = DEFAULT_TEMP_PREFIX, extension = ""): string {
  const unique = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
  return `${prefix}-${unique}${extension}`;
}
