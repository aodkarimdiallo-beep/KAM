import type { Metadata } from "next";
import { Card, CardBody } from "@/components/ui/card";
import { ModuleRoadmapCard } from "@/components/ui/module-roadmap-card";
import { PageHeader } from "@/components/ui/page-header";
import { SectionTitle } from "@/components/ui/section-title";
import { getModule } from "@/config/modules";

const appModule = getModule("twin");

export const metadata: Metadata = { title: appModule.label };

const PROFILE_SECTIONS = [
  { title: "Identité", hint: "Qui vous êtes, en quelques lignes." },
  { title: "Parcours", hint: "Étapes personnelles et professionnelles marquantes." },
  { title: "Compétences", hint: "Savoir-faire et domaines d'expertise." },
  { title: "Personnalité et préférences", hint: "Ce que vous déclarez sur vous-même." },
  { title: "Méthodes de travail", hint: "Comment vous organisez, priorisez, décidez." },
  { title: "Objectifs", hint: "Court, moyen et long terme." },
  { title: "Connaissances", hint: "Ce que vous savez et voulez que votre Twin retienne." },
] as const;

export default function TwinPage() {
  return (
    <div className="flex flex-col gap-12">
      <PageHeader module={appModule} />

      <Card highlight>
        <CardBody className="sm:flex sm:items-center sm:justify-between sm:gap-10">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-accent-strong">Principe</p>
            <p className="mt-2 max-w-2xl font-display text-2xl leading-snug text-fg">
              Votre Twin modélise votre façon de penser et de travailler. Il reste transparent : c&apos;est une IA, pas
              vous.
            </p>
          </div>
        </CardBody>
      </Card>

      <section>
        <SectionTitle eyebrow="Profil" title="Les dimensions de votre Twin" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PROFILE_SECTIONS.map((section) => (
            <Card key={section.title}>
              <CardBody>
                <h3 className="text-[15px] font-medium text-fg">{section.title}</h3>
                <p className="mt-1 text-[13px] text-muted">{section.hint}</p>
                <div className="mt-5 rounded-xl border border-dashed border-line-strong px-4 py-5 text-center text-[12.5px] text-muted">
                  Vide pour l&apos;instant
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </section>

      <ModuleRoadmapCard module={appModule} />
    </div>
  );
}
