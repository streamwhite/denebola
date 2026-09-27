import { createPreferences, type PreferenceValues, type Preferences } from "../storage/preferences";
import type { Storage } from "../storage/types";

export const ONBOARDING_KEY = "app.onboarding";

export type OnboardingState = PreferenceValues & {
  completed: boolean;
  completedSteps: string[];
  launchCount: number;
  firstLaunchAt: number | null;
};

export const DEFAULT_ONBOARDING_STATE: OnboardingState = { completed: false, completedSteps: [], launchCount: 0, firstLaunchAt: null };

export function createOnboardingStore(storage?: Storage): Preferences<OnboardingState> {
  return createPreferences<OnboardingState>({ storage, key: ONBOARDING_KEY, defaults: DEFAULT_ONBOARDING_STATE });
}

export function isFirstLaunch(state: OnboardingState): boolean {
  return state.launchCount <= 1;
}

// Records a launch and reports whether it was the very first one (first-launch detection).
export async function trackLaunch(store: Preferences<OnboardingState>, now = Date.now()): Promise<{ firstLaunch: boolean; state: OnboardingState }> {
  const current = await store.read();
  const launchCount = current.launchCount + 1;
  const state = await store.patch({ launchCount, firstLaunchAt: current.firstLaunchAt ?? now });
  return { firstLaunch: launchCount === 1, state };
}

export async function completeOnboarding(store: Preferences<OnboardingState>, step?: string): Promise<OnboardingState> {
  const current = await store.read();
  const completedSteps = step && !current.completedSteps.includes(step) ? [...current.completedSteps, step] : current.completedSteps;
  return store.patch({ completed: true, completedSteps });
}
