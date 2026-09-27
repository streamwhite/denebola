import type { FilePickOptions, FilePickerAdapter, FileSystemAdapter, PickedFile, ShareAdapter } from "./files";

export const DEFAULT_EXPORT_TITLE = "Export";

export async function exportFile(options: { uri: string; title?: string; mimeType?: string }, share: ShareAdapter): Promise<void> {
  await share.share({ uri: options.uri, title: options.title ?? DEFAULT_EXPORT_TITLE, mimeType: options.mimeType });
}

export async function importFile(picker: FilePickerAdapter, options?: FilePickOptions): Promise<PickedFile | null> {
  return (await picker.pick(options))[0] ?? null;
}

export async function importTextFile(
  picker: FilePickerAdapter,
  fileSystem: FileSystemAdapter,
  options?: FilePickOptions,
): Promise<{ file: PickedFile; text: string } | null> {
  const file = await importFile(picker, options);
  if (!file) return null;
  return { file, text: await fileSystem.readText(file.uri) };
}

export async function writeTextFile(fileSystem: FileSystemAdapter, uri: string, contents: string): Promise<string> {
  await fileSystem.writeText(uri, contents);
  return uri;
}
