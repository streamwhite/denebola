export type IncomingFile = { uri: string; name?: string; mimeType?: string; size?: number };

export type ShareIntent = {
  text?: string;
  url?: string;
  files?: IncomingFile[];
  source?: string;
};

// Contract over Android ACTION_SEND / iOS share extension handoff.
export interface ShareIntentAdapter {
  getInitialIntent(): Promise<ShareIntent | null>;
  subscribe(listener: (intent: ShareIntent) => void): () => void;
}

export function parseIncomingFiles(value: unknown): IncomingFile[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((entry) => {
    if (!entry || typeof entry !== "object") return [];
    const file = entry as Record<string, unknown>;
    if (typeof file.uri !== "string") return [];
    return [
      {
        uri: file.uri,
        ...(typeof file.name === "string" ? { name: file.name } : {}),
        ...(typeof file.mimeType === "string" ? { mimeType: file.mimeType } : {}),
        ...(typeof file.size === "number" ? { size: file.size } : {}),
      },
    ];
  });
}

// Untrusted incoming share payloads are narrowed to known fields; empty intents are dropped.
export function parseShareIntent(value: unknown): ShareIntent | null {
  if (!value || typeof value !== "object") return null;
  const data = value as Record<string, unknown>;
  const intent: ShareIntent = {};
  if (typeof data.text === "string") intent.text = data.text;
  if (typeof data.url === "string") intent.url = data.url;
  if (typeof data.source === "string") intent.source = data.source;
  const files = parseIncomingFiles(data.files);
  if (files.length > 0) intent.files = files;
  return intent.text || intent.url || intent.files ? intent : null;
}

export function createMemoryShareIntentAdapter(initial: ShareIntent | null = null): ShareIntentAdapter & { emit: (intent: ShareIntent) => void; hasListener: () => boolean } {
  const state: { listener?: (intent: ShareIntent) => void } = {};
  return {
    async getInitialIntent() {
      return initial;
    },
    subscribe(listener) {
      state.listener = listener;
      return () => {
        state.listener = undefined;
      };
    },
    emit(intent) {
      state.listener?.(intent);
    },
    hasListener: () => state.listener !== undefined,
  };
}
