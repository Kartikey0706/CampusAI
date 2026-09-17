type LoadingSkeletonProps = {
  lines?: number;
};

export function LoadingSkeleton({ lines = 3 }: LoadingSkeletonProps) {
  return <div className="animate-pulse space-y-3" aria-label="Loading"><div className="h-4 w-1/3 rounded bg-slate-200" />{Array.from({ length: lines }, (_, index) => <div key={index} className="h-12 rounded-xl bg-slate-100" />)}</div>;
}

export function CardLoadingSkeleton() {
  return <div className="grid gap-4 sm:grid-cols-3"><div className="h-28 animate-pulse rounded-2xl bg-slate-100" /><div className="h-28 animate-pulse rounded-2xl bg-slate-100" /><div className="h-28 animate-pulse rounded-2xl bg-slate-100" /></div>;
}
