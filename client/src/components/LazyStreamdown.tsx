import { lazy, Suspense } from "react";

const StreamdownComponent = lazy(() =>
  import("streamdown").then((m) => ({ default: m.Streamdown }))
);

export function LazyStreamdown({ children }: { children: string }) {
  return (
    <Suspense
      fallback={
        <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap text-sm">
          {children}
        </div>
      }
    >
      <StreamdownComponent>{children}</StreamdownComponent>
    </Suspense>
  );
}
