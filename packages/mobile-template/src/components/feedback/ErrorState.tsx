import { useText } from "../../lib/i18n/locale";
import { StateView } from "./StateView";

export function ErrorState({ title, onRetry, className }: { title: string; onRetry: () => void; className?: string }) {
  const text = useText();
  return <StateView title={title} className={className} action={{ label: text({ id: "common.retry" }), onPress: onRetry }} />;
}
