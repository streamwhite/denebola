export type ImageFormat = "jpeg" | "png" | "webp";

export type ImageSize = "thumbnail" | "medium" | "full";

// Sizing conventions from the plan: never load full-resolution originals into lists.
export const IMAGE_SIZE_DIMENSIONS: Record<ImageSize, number> = { thumbnail: 160, medium: 720, full: 1920 };

export const DEFAULT_IMAGE_QUALITY = 0.8;

export type ImageResult = { uri: string; width: number; height: number };

export type ImageResizeRequest = {
  uri: string;
  width?: number;
  height?: number;
  maxDimension?: number;
  format?: ImageFormat;
  quality?: number;
};

// Contract over expo-image-manipulator; compression and resizing are injected.
export interface ImageAdapter {
  resize(request: ImageResizeRequest): Promise<ImageResult>;
  compress(uri: string, quality?: number): Promise<ImageResult>;
}

export function clampQuality(quality: number | undefined): number {
  if (quality === undefined || Number.isNaN(quality)) return DEFAULT_IMAGE_QUALITY;
  return Math.min(1, Math.max(0, quality));
}

// Preserves aspect ratio, fitting the longest side to `maxDimension` (never upscales).
export function scaledDimensions(width: number, height: number, maxDimension: number): { width: number; height: number } {
  const longest = Math.max(width, height);
  if (longest <= maxDimension || longest === 0) return { width: Math.round(width), height: Math.round(height) };
  const ratio = maxDimension / longest;
  return { width: Math.round(width * ratio), height: Math.round(height * ratio) };
}

export function imageSizeDimension(size: ImageSize): number {
  return IMAGE_SIZE_DIMENSIONS[size];
}
