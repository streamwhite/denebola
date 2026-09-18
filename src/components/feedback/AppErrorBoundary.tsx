import { Component, type ErrorInfo, type ReactNode } from "react";
import { StateView } from "@/components/feedback/StateView";
import { useText } from "@/lib/i18n/locale";

type Props = { children: ReactNode };
type State = { error: Error | null };

function ErrorFallback({ onRetry }: { onRetry: () => void }) {
  const text = useText();
  return <StateView title={text({ id: "common.errorTitle" })} action={{ label: text({ id: "common.retry" }), onPress: onRetry }} />;
}

export class AppErrorBoundary extends Component<Props, State> {
  state: State = { error: null };
  static getDerivedStateFromError(error: Error): State { return { error }; }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error(error, info.componentStack); }
  render() {
    return this.state.error ? <ErrorFallback onRetry={() => this.setState({ error: null })} /> : this.props.children;
  }
}
