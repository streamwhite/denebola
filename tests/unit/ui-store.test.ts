import { beforeEach, describe, expect, it } from "vitest";
import { createUiStore, uiInitialState, useUiStore } from "@/lib/state/uiStore";

describe("useUiStore", () => {
  beforeEach(() => useUiStore.reset());

  it("opens and closes modals and sheets with a key", () => {
    useUiStore.getState().openModal("filters");
    expect(useUiStore.getState().modal).toEqual({ open: true, key: "filters" });

    useUiStore.getState().closeModal();
    expect(useUiStore.getState().modal).toEqual({ open: false, key: null });

    useUiStore.getState().openSheet("sort");
    expect(useUiStore.getState().sheet).toEqual({ open: true, key: "sort" });
  });

  it("tracks keyboard visibility and resets to the initial state", () => {
    useUiStore.getState().setKeyboardVisible(true);
    expect(useUiStore.getState().isKeyboardVisible).toBe(true);

    useUiStore.reset();
    expect(useUiStore.getState().modal).toEqual(uiInitialState.modal);
    expect(useUiStore.getState().isKeyboardVisible).toBe(false);
  });

  it("creates independent store instances", () => {
    const a = createUiStore();
    const b = createUiStore();
    a.getState().openModal("a");

    expect(b.getState().modal.open).toBe(false);
  });
});
