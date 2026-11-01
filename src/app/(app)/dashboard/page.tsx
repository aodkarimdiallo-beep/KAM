import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowUpRight } from "lucide-react";
import { SetupChecklist } from "@/components/system/setup-checklist";
import { ServiceStatusSkeleton } from "@/components/system/service-status-skeleton";
import { Card, CardBody, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ModuleStatusBadge } from "@/components/ui/module-status-badge";
import { PageHeader } from "@/components/ui/page-header";
import { SectionTitle } from "@/components/ui/section-title";
import { APP_MODULES, CURRENT_STAGE, DEVELOPMENT_STAGES, getModule } from "@/config/modules";
import { cn } from "@/lib/utils/cn";

export const metadata: Metadata = { title: "Dashboard" };

export default function DashboardPage() {
  const modules = APP_MODULES.filter((m) => m.id !== "dashboard");

  return (
    <div className="flex flex-col gap-12">
      <PageHeader
        module={getModule("dashboard")}
        title="Votre Digital Twin"
        description="Une intelligence personnelle qui apprend votre parcours, structure vos connaissances et vous assiste dans vos projets et vos décisions."
      />

      <section className="grid gap-5 lg:grid-cols-[1.1fr_1fr]">
        <Card highlight>
          <CardHeader>
            <div>
              <CardTitle>Mise en route</CardTitle>
              <CardDescription>Ce qui est réellement configuré sur cette installation.</CardDescription>
            </div>
          </CardHeader>
          <CardBody>
            <Suspense fallback={<ServiceStatusSkeleton />}>
              <SetupChecklist />
            </Suspense>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Plan de construction</CardTitle>
              <CardDescription>Chaque étape est livrée, vérifiée puis activée.</CardDescription>
            </div>
          </CardHeader>
          <CardBody>
            <ol className="relative flex flex-col gap-4 border-l border-line pl-5">
              {Object.entries(DEVELOPMENT_STAGES).map(([stage, label]) => {
                const n = Number(stage);
                const state = n < CURRENT_STAGE ? "done" : n === CURRENT_STAGE ? "current" : "next";
                return (
                  <li key={stage} className="relative">
                    <span
                      aria-hidden
                      className={cn(
                        "absolute -left-[25px] top-1 size-2.5 rounded-full border",
                        state === "current" && "border-copper bg-copper shadow-[0_0_0_4px_rgb(193_138_98/0.15)]",
                        state === "done" && "border-bronze bg-bronze",
                        state === "next" && "border-line-strong bg-canvas",
                      )}
                    />
                    <p className={cn("text-sm", state === "next" ? "text-muted" : "text-fg")}>
                      <span className="mr-2 font-mono text-[11px] text-accent-strong">0{stage}</span>
                      {label}
                    </p>
                    {state === "current" && <p className="mt-0.5 text-[12.5px] text-copper">En cours</p>}
                  </li>
                );
              })}
            </ol>
          </CardBody>
        </Card>
      </section>

      <section>
        <SectionTitle eyebrow="Modules" title="Votre espace" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {modules.map((m) => (
            <Link key={m.id} href={m.href} className="group rounded-(--radius-card)">
              <Card interactive className="h-full">
                <CardBody className="flex h-full flex-col">
                  <div className="flex items-center justify-between">
                    <m.icon className="size-5 text-copper" strokeWidth={1.5} aria-hidden />
                    <ArrowUpRight
                      className="size-4 text-muted opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                      aria-hidden
                    />
                  </div>
                  <p className="mt-6 text-[15px] font-medium text-fg">{m.label}</p>
                  <p className="mt-1 flex-1 text-[13px] leading-relaxed text-muted">{m.tagline}</p>
                  <div className="mt-5">
                    <ModuleStatusBadge module={m} />
                  </div>
                </CardBody>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
