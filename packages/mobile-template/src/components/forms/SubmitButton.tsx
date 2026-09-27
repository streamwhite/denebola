import { Button } from "../ui/Button";
import { useText } from "../../lib/i18n/locale";

export function SubmitButton({ label, loading, onPress, className }: { label: string; loading?: boolean; onPress: () => void; className?: string }) {
  const text = useText();
  return <Button title={loading ? text({ id: "common.loading" }) : label} disabled={loading} onPress={onPress} className={className} />;
}
