import { isAllowedUrl, type UrlPolicy } from "./urls";

// Contract over expo-linking (or any URL handler).
export interface LinkingAdapter {
  canOpen(url: string): Promise<boolean>;
  open(url: string): Promise<void>;
  getInitialUrl(): Promise<string | null>;
  subscribe(listener: (url: string) => void): () => void;
}

export type AppLinker = {
  canOpen: (url: string) => Promise<boolean>;
  open: (url: string) => Promise<boolean>;
};

// App-to-App integration: only allowed, openable targets are opened; absence is reported, not thrown.
export function createAppLinker(adapter: LinkingAdapter, policy: UrlPolicy): AppLinker {
  async function canOpen(url: string): Promise<boolean> {
    if (!isAllowedUrl(url, policy)) return false;
    return adapter.canOpen(url).catch(() => false);
  }

  return {
    canOpen,
    async open(url) {
      if (!(await canOpen(url))) return false;
      await adapter.open(url);
      return true;
    },
  };
}

export function createMemoryLinkingAdapter(openable: readonly string[] = []): LinkingAdapter & { opened: () => string[]; emit: (url: string) => void } {
  const state = { opened: [] as string[], listener: undefined as ((url: string) => void) | undefined };
  return {
    async canOpen(url) {
      return openable.includes(url);
    },
    async open(url) {
      state.opened.push(url);
    },
    async getInitialUrl() {
      return null;
    },
    subscribe(listener) {
      state.listener = listener;
      return () => {
        state.listener = undefined;
      };
    },
    opened: () => [...state.opened],
    emit(url) {
      state.listener?.(url);
    },
  };
}
