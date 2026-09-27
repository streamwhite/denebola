export const MIN_TOUCH_TARGET = 44;

export type AccessibilityRole = "button" | "link" | "header" | "image" | "text" | "checkbox" | "radio" | "switch" | "tab";

export type AccessibilityPropsInput = {
  label?: string;
  role?: AccessibilityRole;
  hint?: string;
  disabled?: boolean;
  selected?: boolean;
};

// Builds the RN accessibility props a test can assert on.
export function toAccessibilityProps(input: AccessibilityPropsInput): Record<string, unknown> {
  const state = {
    ...(input.disabled !== undefined ? { disabled: input.disabled } : {}),
    ...(input.selected !== undefined ? { selected: input.selected } : {}),
  };
  return {
    ...(input.label ? { accessibilityLabel: input.label } : {}),
    ...(input.role ? { accessibilityRole: input.role } : {}),
    ...(input.hint ? { accessibilityHint: input.hint } : {}),
    ...(Object.keys(state).length > 0 ? { accessibilityState: state } : {}),
  };
}

export function meetsMinTouchTarget(size: { width: number; height: number }, min = MIN_TOUCH_TARGET): boolean {
  return size.width >= min && size.height >= min;
}

export function describeMissingAccessibleName(props: Record<string, unknown>): string | null {
  const label = props.accessibilityLabel;
  return typeof label === "string" && label.trim().length > 0 ? null : "Missing accessibilityLabel";
}
