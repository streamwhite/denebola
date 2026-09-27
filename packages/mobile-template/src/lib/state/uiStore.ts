import { createStore, type AppStore } from "./createStore";

export type UiState = {
  modal: { open: boolean; key: string | null };
  sheet: { open: boolean; key: string | null };
  isKeyboardVisible: boolean;
  openModal: (key: string) => void;
  closeModal: () => void;
  openSheet: (key: string) => void;
  closeSheet: () => void;
  setKeyboardVisible: (visible: boolean) => void;
};

export const uiInitialState = { modal: { open: false, key: null }, sheet: { open: false, key: null }, isKeyboardVisible: false } satisfies Pick<UiState, "modal" | "sheet" | "isKeyboardVisible">;

export function createUiStore(): AppStore<UiState> {
  return createStore<UiState>({
    initial: uiInitialState as UiState,
    create: (set) => ({
      openModal: (key) => set({ modal: { open: true, key } }),
      closeModal: () => set({ modal: { open: false, key: null } }),
      openSheet: (key) => set({ sheet: { open: true, key } }),
      closeSheet: () => set({ sheet: { open: false, key: null } }),
      setKeyboardVisible: (isKeyboardVisible) => set({ isKeyboardVisible }),
    }),
  });
}

// A ready-to-use global UI store for local UI state shared across screens.
export const useUiStore = createUiStore();
