export type HapticFeedback = "light" | "medium" | "heavy" | "success" | "warning" | "error" | "selection";

export const HAPTIC_FEEDBACKS: readonly HapticFeedback[] = ["light", "medium", "heavy", "success", "warning", "error", "selection"];

// Thin contract over expo-haptics so feature code never calls the native module directly.
export interface HapticsAdapter {
  trigger(feedback: HapticFeedback): Promise<void>;
}

export const noopHaptics: HapticsAdapter = {
  trigger: async () => undefined,
};

export function createMemoryHaptics(): HapticsAdapter & { readonly events: HapticFeedback[] } {
  const events: HapticFeedback[] = [];
  return {
    events,
    async trigger(feedback) {
      events.push(feedback);
    },
  };
}
