import { Component, type ErrorInfo, type ReactNode } from "react";
import { useText } from "../../lib/i18n/locale";
import { StateView } from "./StateView";

type Props = { children: ReactNode; onError?: (error: Error, info: ErrorInfo) => void };
type State = { error: Error | null };

function ErrorFallback({ onRetry }: { onRetry: () => void }) {
  const text = useText();
  return <StateView title={text({ id: "common.errorTitle" })} action={{ label: text({ id: "common.retry" }), onPress: onRetry }} />;
}

export class AppErrorBoundary extends Component<Props, State> {
  state: State = { error: null };
  static getDerivedStateFromError(error: Error): State { return { error }; }
  componentDidCatch(error: Error, info: ErrorInfo) {
    if (this.props.onError) this.props.onError(error, info);
    else console.error(error, info.componentStack);
  }
  render() {
    return this.state.error ? <ErrorFallback onRetry={() => this.setState({ error: null })} /> : this.props.children;
  }
}
