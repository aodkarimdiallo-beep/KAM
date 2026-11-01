import { Skeleton } from "@/components/ui/skeleton";

export function ServiceStatusSkeleton() {
  return (
    <div className="flex flex-col gap-4" role="status" aria-label="Chargement de l'état des services">
      {[0, 1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-10" />
      ))}
    </div>
  );
}
