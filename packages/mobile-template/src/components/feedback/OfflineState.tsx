import { StateView } from "./StateView";

export function OfflineState({ title, className }: { title: string; className?: string }) {
  return <StateView title={title} className={className} />;
}
