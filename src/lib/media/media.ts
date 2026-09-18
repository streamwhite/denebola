export type MediaAsset = { uri: string; width?: number; height?: number; mimeType?: string };
export type MediaAdapter = { pickImage: () => Promise<MediaAsset | null>; takePhoto: () => Promise<MediaAsset | null> };
