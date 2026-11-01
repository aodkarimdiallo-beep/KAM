import { DEVELOPMENT_STAGES, type AppModule } from "@/config/modules";
import { Badge } from "./badge";

/** Indique honnêtement l'état d'un module : disponible, en cours ou prévu. */
export function ModuleStatusBadge({ module: m }: { module: Pick<AppModule, "status" | "stage"> }) {
  if (m.status === "available") return <Badge tone="success">Disponible</Badge>;
  if (m.status === "in_progress") {
    return (
      <Badge tone="accent">
        <span className="size-1.5 rounded-full bg-copper motion-safe:animate-pulse" aria-hidden />
        En construction
      </Badge>
    );
  }
  return (
    <Badge tone="soft" title={DEVELOPMENT_STAGES[m.stage]}>
      Prévu · étape {m.stage}
    </Badge>
  );
}
