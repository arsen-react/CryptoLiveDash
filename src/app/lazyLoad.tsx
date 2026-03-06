import { LoadingSkeleton } from "@/shared/components/LoadingSkeleton";
import { lazy, Suspense, type ComponentType, type ReactElement } from "react";

type NoProps = Record<string, never>;
type LazyModule = Promise<{ default: ComponentType<NoProps> }>;

export function lazyRoute(importer: () => LazyModule): ReactElement {
  const Component = lazy(importer);

  return (
    <Suspense fallback={<LoadingSkeleton lines={8} className="mt-4" />}>
      <Component />
    </Suspense>
  );
}
