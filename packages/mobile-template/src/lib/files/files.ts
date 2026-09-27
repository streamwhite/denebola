export type FileKind = "cache" | "temporary" | "persistent";

export type FileInfo = { uri: string; size: number; modifiedAt: number; mimeType?: string };

// Download-and-store contract used by the file cache; injected storage layer.
export type FileStore = {
  download: (url: string, kind: FileKind) => Promise<string>;
  remove: (uri: string) => Promise<void>;
};

// Contract over expo-file-system. Injected so no native filesystem dependency is imposed.
export interface FileSystemAdapter {
  readText(uri: string): Promise<string>;
  writeText(uri: string, contents: string): Promise<void>;
  readBase64(uri: string): Promise<string>;
  writeBase64(uri: string, contents: string): Promise<void>;
  exists(uri: string): Promise<boolean>;
  info(uri: string): Promise<FileInfo>;
  makeDirectory(uri: string): Promise<void>;
  remove(uri: string): Promise<void>;
  list(directory: string): Promise<string[]>;
}

export type PickedFile = { uri: string; name: string; mimeType?: string; size?: number };

export type FilePickOptions = { types?: string[]; multiple?: boolean };

// Contract over expo-document-picker.
export interface FilePickerAdapter {
  pick(options?: FilePickOptions): Promise<PickedFile[]>;
}

// Contract over the OS share sheet.
export interface ShareAdapter {
  share(options: { uri: string; title?: string; mimeType?: string }): Promise<void>;
}

// Contract over opening a file with the platform handler / viewer.
export interface OpenFileAdapter {
  open(uri: string, mimeType?: string): Promise<boolean>;
}
