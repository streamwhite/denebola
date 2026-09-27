import type { FileInfo, FilePickerAdapter, FileSystemAdapter, OpenFileAdapter, PickedFile, ShareAdapter } from "./files";

const FILE_NOT_FOUND = "File not found";

function directoryOf(uri: string): string {
  const index = uri.lastIndexOf("/");
  return index <= 0 ? "/" : uri.slice(0, index);
}

// In-memory FileSystemAdapter for tests and local development.
export function createMemoryFileSystem(initial: Record<string, string> = {}): FileSystemAdapter {
  const files = new Map<string, string>(Object.entries(initial));
  const modified = new Map<string, number>();
  const directories = new Set<string>(["/"]);

  async function readText(uri: string): Promise<string> {
    const value = files.get(uri);
    if (value === undefined) throw new Error(`${FILE_NOT_FOUND}: ${uri}`);
    return value;
  }

  return {
    readText,
    async writeText(uri, contents) {
      files.set(uri, contents);
      modified.set(uri, Date.now());
    },
    readBase64: readText,
    writeBase64: async (uri, contents) => {
      files.set(uri, contents);
      modified.set(uri, Date.now());
    },
    async exists(uri) {
      return files.has(uri);
    },
    async info(uri): Promise<FileInfo> {
      return { uri, size: (await readText(uri)).length, modifiedAt: modified.get(uri) ?? 0 };
    },
    async makeDirectory(uri) {
      directories.add(uri);
    },
    async remove(uri) {
      files.delete(uri);
    },
    async list(directory) {
      return [...files.keys()].filter((uri) => directoryOf(uri) === directory);
    },
  };
}

export function createMemoryFilePicker(queue: PickedFile[] = []) {
  let remaining = [...queue];
  return {
    async pick(): Promise<PickedFile[]> {
      const files = remaining;
      remaining = [];
      return files;
    },
    enqueue(file: PickedFile): void {
      remaining.push(file);
    },
  };
}

export function createMemoryShareAdapter() {
  const shared: { uri: string; title?: string; mimeType?: string }[] = [];
  return {
    shared,
    async share(options: { uri: string; title?: string; mimeType?: string }): Promise<void> {
      shared.push(options);
    },
  };
}

export function createMemoryOpenFileAdapter(result = true) {
  const opened: string[] = [];
  return {
    opened,
    async open(uri: string): Promise<boolean> {
      opened.push(uri);
      return result;
    },
  };
}

// Type check helpers: the memory implementations satisfy the public contracts.
export type MemoryFilePicker = FilePickerAdapter;
export type MemoryShare = ShareAdapter;
export type MemoryOpenFile = OpenFileAdapter;
