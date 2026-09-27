// Thin contract over expo-clipboard (or any clipboard provider); inject the implementation so no
// native clipboard dependency is imposed on every app.
export interface ClipboardAdapter {
  getString(): Promise<string | null>;
  setString(value: string): Promise<void>;
}

export function createMemoryClipboard(initial: string | null = null): ClipboardAdapter {
  let value = initial;
  return {
    async getString() {
      return value;
    },
    async setString(next) {
      value = next;
    },
  };
}
