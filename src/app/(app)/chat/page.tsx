import type { Metadata } from "next";
import { Card, CardBody } from "@/components/ui/card";
import { ModuleRoadmapCard } from "@/components/ui/module-roadmap-card";
import { PageHeader } from "@/components/ui/page-header";
import { SectionTitle } from "@/components/ui/section-title";
import { getModule } from "@/config/modules";

const appModule = getModule("chat");

export const metadata: Metadata = { title: appModule.label };

/** Pipeline de réponse prévu (voir docs/ARCHITECTURE.md § Récupération contextuelle). */
const RESPONSE_PIPELINE = [
  "Comprendre la demande",
  "Identifier les informations nécessaires",
  "Rechercher les souvenirs pertinents",
  "Retrouver les documents associés",
  "Construire un contexte ciblé",
  "Interroger le modèle d'IA",
  "Produire une réponse contextualisée",
  "Citer les souvenirs et sources utilisés",
] as const;

export default function ChatPage() {
  return (
    <div className="flex flex-col gap-12">
      <PageHeader module={appModule} />

      <section>
        <SectionTitle eyebrow="Fonctionnement" title="Comment votre Twin construira chaque réponse" />
        <Card>
          <CardBody>
            <ol className="grid gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-4">
              {RESPONSE_PIPELINE.map((step, index) => (
                <li key={step} className="flex items-start gap-3">
                  <span className="font-mono text-[11px] text-accent-strong">0{index + 1}</span>
                  <span className="text-sm text-fg-soft">{step}</span>
                </li>
              ))}
            </ol>
            <p className="mt-6 border-t border-line pt-4 text-[13px] text-muted">
              Seuls les souvenirs pertinents sont envoyés au modèle — jamais l&apos;intégralité de votre mémoire.
            </p>
          </CardBody>
        </Card>
      </section>

      <ModuleRoadmapCard module={appModule} />
    </div>
  );
}
