import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Animated, Platform, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { cx } from "../../lib/utils/cx";
import { Text } from "../ui/Text";

export type ToastTone = "info" | "success" | "warning" | "error";
export type ToastPosition = "top" | "bottom";

export type ToastOptions = { message: string; tone?: ToastTone; durationMs?: number; position?: ToastPosition };
export type Toast = ToastOptions & { id: string; tone: ToastTone; durationMs: number; position: ToastPosition };

export type ToastApi = { show: (options: ToastOptions) => string; dismiss: (id: string) => void; clear: () => void };

const DEFAULT_DURATION_MS = 4_000;
const toneClass: Record<ToastTone, string> = {
  info: "bg-info/15 border-info",
  success: "bg-success/15 border-success",
  warning: "bg-warning/20 border-warning",
  error: "bg-destructive/15 border-destructive",
};

const ToastContext = createContext<ToastApi | null>(null);

export function useToast(): ToastApi {
  const value = useContext(ToastContext);
  if (!value) throw new Error("useToast must be used inside ToastProvider");
  return value;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counter = useRef(0);

  const dismiss = useCallback((id: string) => setToasts((current) => current.filter((toast) => toast.id !== id)), []);
  const show = useCallback((options: ToastOptions) => {
    const id = `toast-${counter.current++}`;
    setToasts((current) => [...current, { tone: "info", durationMs: DEFAULT_DURATION_MS, position: "top", ...options, id }]);
    return id;
  }, []);
  const clear = useCallback(() => setToasts([]), []);
  const api = useMemo<ToastApi>(() => ({ show, dismiss, clear }), [show, dismiss, clear]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={() => dismiss(toast.id)} />
      ))}
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const insets = useSafeAreaInsets();
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }).start();
    const timer = setTimeout(onDismiss, toast.durationMs);
    return () => clearTimeout(timer);
  }, [opacity, onDismiss, toast.durationMs]);

  const position = toast.position ?? "top";
  const positionStyle = position === "top" ? { top: insets.top + 8 } : { bottom: insets.bottom + 8 };
  return (
    <Animated.View style={{ position: "absolute", left: 16, right: 16, opacity, ...positionStyle }} pointerEvents={Platform.OS === "web" ? "auto" : "box-none"}>
      <View accessibilityRole="alert" className={cx("rounded-xl border px-4 py-3", toneClass[toast.tone])}>
        <Text>{toast.message}</Text>
      </View>
    </Animated.View>
  );
}
