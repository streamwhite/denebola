export type FileKind = "cache" | "temporary" | "persistent";
export type FileStore = { download: (url: string, kind: FileKind) => Promise<string>; remove: (uri: string) => Promise<void> };
