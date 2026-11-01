import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody } from "@/components/ui/card";
import { ModuleRoadmapCard } from "@/components/ui/module-roadmap-card";
import { PageHeader } from "@/components/ui/page-header";
import { SectionTitle } from "@/components/ui/section-title";
import { getModule } from "@/config/modules";
import {
  EPISTEMIC_STATUSES,
  EPISTEMIC_STATUS_INFO,
  MEMORY_CATEGORIES,
  MEMORY_CATEGORY_INFO,
} from "@/domain/memory/taxonomy";

const appModule = getModule("memory");

export const metadata: Metadata = { title: appModule.label };

const toneToBadge = { solid: "accent", neutral: "neutral", soft: "soft" } as const;

export default function MemoryPage() {
  return (
    <div className="flex flex-col gap-12">
      <PageHeader module={appModule} />

      <section>
        <SectionTitle eyebrow="Architecture" title="Quatre mémoires complémentaires" />
        <div className="grid gap-4 md:grid-cols-2">
          {MEMORY_CATEGORIES.map((category, index) => {
            const info = MEMORY_CATEGORY_INFO[category];
            return (
              <Card key={category}>
                <CardBody>
                  <div className="flex items-baseline justify-between gap-4">
                    <p className="font-mono text-[11px] text-accent-strong">0{index + 1}</p>
                    <p className="text-[12px] italic text-muted">{info.question}</p>
                  </div>
                  <h3 className="mt-3 font-display text-2xl text-fg">{info.label}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{info.description}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {info.examples.map((example) => (
                      <Badge key={example} tone="neutral">
                        {example}
                      </Badge>
                    ))}
                  </div>
                  <p className="mt-5 border-t border-line pt-4 text-[12.5px] text-muted">Aucun souvenir enregistré.</p>
                </CardBody>
              </Card>
            );
          })}
        </div>
      </section>

      <section>
        <SectionTitle eyebrow="Traçabilité" title="Chaque souvenir indique son degré de certitude" />
        <Card>
          <CardBody>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {EPISTEMIC_STATUSES.map((status) => {
                const info = EPISTEMIC_STATUS_INFO[status];
                return (
                  <li key={status}>
                    <Badge tone={toneToBadge[info.tone]}>{info.label}</Badge>
                    <p className="mt-2 text-[13px] text-muted">{info.description}</p>
                  </li>
                );
              })}
            </ul>
            <p className="mt-6 rounded-xl border border-accent/20 bg-accent/5 px-4 py-3 text-[13px] text-fg-soft">
              Règle fondamentale : une hypothèse ou une déduction de l&apos;IA ne devient jamais un fait confirmé sans votre
              validation explicite.
            </p>
          </CardBody>
        </Card>
      </section>

      <ModuleRoadmapCard module={appModule} />
    </div>
  );
}
