import { Component, lazy, Suspense, type ReactNode } from "react";
import { loadMarkdownContent } from "../lib/reading";

const MarkdownContent = lazy(loadMarkdownContent);

class ReadingBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (this.state.failed)
      return (
        <p role="alert">
          正文暂时未能加载。 <a href={window.location.href}>重新加载页面</a>
        </p>
      );
    return this.props.children;
  }
}

export default function ReadingContent({ body }: { body: string }) {
  return (
    <ReadingBoundary>
      <Suspense fallback={<p role="status">正在加载正文…</p>}>
        <MarkdownContent body={body} />
      </Suspense>
    </ReadingBoundary>
  );
}
