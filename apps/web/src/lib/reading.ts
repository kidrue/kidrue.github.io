let pending:
  Promise<typeof import("../components/MarkdownContent")> | undefined;

export function loadMarkdownContent() {
  pending ??= import("../components/MarkdownContent").catch((error) => {
    pending = undefined;
    throw error;
  });
  return pending;
}

export function preloadReading() {
  void loadMarkdownContent().catch(() => {});
}
