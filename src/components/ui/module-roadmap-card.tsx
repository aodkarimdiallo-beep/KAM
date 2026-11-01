import { CircleDashed } from "lucide-react";
import { DEVELOPMENT_STAGES, type AppModule } from "@/config/modules";
import { Card, CardBody } from "./card";

/**
 * Panneau affiché tant qu'un module n'est pas livré : explique ce qu'il fera et
 * à quelle étape, au lieu d'afficher de faux boutons ou de fausses données.
 */
export function ModuleRoadmapCard({ module: m }: { module: AppModule }) {
  return (
    <Card highlight>
      <CardBody className="grid gap-8 md:grid-cols-[1fr_1.4fr]">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-accent-strong">
            Étape {m.stage} · {DEVELOPMENT_STAGES[m.stage]}
          </p>
          <h2 className="mt-2 font-display text-2xl text-fg">Module en développement</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Cette section n&apos;est pas encore connectée. Rien ici n&apos;est simulé : les fonctionnalités
            apparaîtront au fur et à mesure qu&apos;elles seront construites et testées.
          </p>
        </div>
        <ul className="grid gap-2.5 sm:grid-cols-2">
          {m.capabilities.map((capability) => (
            <li
              key={capability}
              className="flex items-start gap-2.5 rounded-xl border border-line bg-canvas/40 px-3.5 py-3 text-sm text-fg-soft"
            >
              <CircleDashed className="mt-0.5 size-4 shrink-0 text-accent-strong" strokeWidth={1.6} aria-hidden />
              {capability}
            </li>
          ))}
        </ul>
      </CardBody>
    </Card>
  );
}
