import { StateView } from "./StateView";

export function EmptyState({ title, className }: { title: string; className?: string }) {
  return <StateView title={title} className={className} />;
}
