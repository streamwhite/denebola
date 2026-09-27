import { toFormData, type UploadFile } from "../api/transfer";
import type { MediaAsset, MediaKind } from "./media";

export const DEFAULT_UPLOAD_NAME = "upload";

const MIME_EXTENSIONS: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/heic": ".heic",
  "video/mp4": ".mp4",
  "video/quicktime": ".mov",
};

export function extensionForMime(mimeType?: string, kind?: MediaKind): string {
  if (mimeType && MIME_EXTENSIONS[mimeType]) return MIME_EXTENSIONS[mimeType];
  if (kind === "video") return ".mp4";
  if (kind === "image") return ".jpg";
  return "";
}

export function mediaFileName(asset: MediaAsset, fallback = DEFAULT_UPLOAD_NAME): string {
  return asset.fileName ?? `${fallback}${extensionForMime(asset.mimeType, asset.kind)}`;
}

function defaultMimeType(kind?: MediaKind): string {
  return kind === "video" ? "video/mp4" : "image/jpeg";
}

export function toUploadFile(asset: MediaAsset, fallbackName = DEFAULT_UPLOAD_NAME): UploadFile {
  return { uri: asset.uri, name: mediaFileName(asset, fallbackName), type: asset.mimeType ?? defaultMimeType(asset.kind) };
}

// Pairs with `uploadWithProgress`: multipart fields plus one field holding the picked assets.
export function toMediaFormData(fields: Record<string, string>, field: string, assets: MediaAsset[]): FormData {
  return toFormData(fields, { [field]: assets.map((asset) => toUploadFile(asset)) });
}
