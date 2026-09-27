export type SessionInfo = { id: string; startedAt: number };

export type SessionTracker = {
  start: () => SessionInfo;
  end: () => void;
  current: () => SessionInfo | null;
  isActive: () => boolean;
};

export type SessionTrackerOptions = {
  id?: () => string;
  now?: () => number;
};

function defaultSessionId(): string {
  return `s-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createSessionTracker(options: SessionTrackerOptions = {}): SessionTracker {
  const id = options.id ?? defaultSessionId;
  const now = options.now ?? Date.now;
  let info: SessionInfo | null = null;

  return {
    start() {
      info = { id: id(), startedAt: now() };
      return info;
    },
    end() {
      info = null;
    },
    current: () => info,
    isActive: () => info !== null,
  };
}
