export type MediaKind = "image" | "video";

export type MediaAsset = {
  uri: string;
  kind?: MediaKind;
  width?: number;
  height?: number;
  mimeType?: string;
  fileName?: string;
  fileSize?: number;
  durationMs?: number;
};

export type CameraFacing = "front" | "back";

export type MediaPickOptions = { allowsEditing?: boolean; quality?: number; selectionLimit?: number };
export type CameraOptions = { quality?: number; facing?: CameraFacing };

// Contract over expo-image-picker / expo-camera; injected so camera/media natives stay opt-in.
export interface MediaAdapter {
  pickImage(options?: MediaPickOptions): Promise<MediaAsset | null>;
  pickVideo(options?: MediaPickOptions): Promise<MediaAsset | null>;
  takePhoto(options?: CameraOptions): Promise<MediaAsset | null>;
}
