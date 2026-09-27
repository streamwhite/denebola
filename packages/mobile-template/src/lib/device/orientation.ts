export type ScreenOrientation = "portrait" | "landscape" | "portrait-up" | "portrait-down" | "landscape-left" | "landscape-right" | "unknown";

export type OrientationLock = "portrait" | "landscape" | "default";

export interface OrientationAdapter {
  get(): Promise<ScreenOrientation>;
  lock(orientation: OrientationLock): Promise<void>;
  unlock(): Promise<void>;
  subscribe(listener: (orientation: ScreenOrientation) => void): () => void;
}

export function toScreenOrientation(value: string | null | undefined): ScreenOrientation {
  switch (value) {
    case "portrait":
    case "portrait-up":
    case "portrait-down":
    case "landscape":
    case "landscape-left":
    case "landscape-right":
      return value;
    default:
      return "unknown";
  }
}

export function isLandscape(orientation: ScreenOrientation): boolean {
  return orientation === "landscape" || orientation === "landscape-left" || orientation === "landscape-right";
}
