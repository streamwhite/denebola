import { StateView } from "@/components/feedback/StateView";

export function UnauthorizedState({ title, className }: { title: string; className?: string }) {
  return <StateView title={title} className={className} />;
}
