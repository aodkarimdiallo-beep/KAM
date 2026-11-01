import { cn } from "@/lib/utils/cn";

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn("rounded-lg bg-white/[0.04] motion-safe:animate-pulse", className)} />;
}
