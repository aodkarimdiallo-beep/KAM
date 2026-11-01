import type { Metadata } from "next";
import { ModuleRoadmapCard } from "@/components/ui/module-roadmap-card";
import { PageHeader } from "@/components/ui/page-header";
import { getModule } from "@/config/modules";

const appModule = getModule("agents");

export const metadata: Metadata = { title: appModule.label };

export default function AgentsPage() {
  return (
    <div className="flex flex-col gap-10">
      <PageHeader module={appModule} />
      <ModuleRoadmapCard module={appModule} />
    </div>
  );
}
