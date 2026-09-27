// Contract over expo-splash-screen; the Bootstrap provider drives the real implementation.
export interface SplashAdapter {
  preventAutoHide(): Promise<void>;
  hide(): Promise<void>;
}

export function createMemorySplashAdapter(): SplashAdapter & { isPrevented: () => boolean; isHidden: () => boolean } {
  const state = { prevented: false, hidden: false };
  return {
    async preventAutoHide() {
      state.prevented = true;
    },
    async hide() {
      state.hidden = true;
    },
    isPrevented: () => state.prevented,
    isHidden: () => state.hidden,
  };
}
