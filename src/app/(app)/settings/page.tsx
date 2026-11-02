import type { Metadata } from "next";
import { Suspense } from "react";
import { ProfileSection } from "@/components/settings/profile-section";
import { ServiceStatusList } from "@/components/system/service-status-list";
import { ServiceStatusSkeleton } from "@/components/system/service-status-skeleton";
import { Card, CardBody, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ModuleRoadmapCard } from "@/components/ui/module-roadmap-card";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { getModule } from "@/config/modules";

const appModule = getModule("settings");

export const metadata: Metadata = { title: appModule.label };

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-10">
      <PageHeader module={appModule} />

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Profil</CardTitle>
            <CardDescription>Ces informations sont visibles uniquement par vous et servent de point de départ à votre Twin.</CardDescription>
          </div>
        </CardHeader>
        <CardBody>
          <Suspense fallback={<Skeleton className="h-72" />}>
            <ProfileSection />
          </Suspense>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Services connectés</CardTitle>
            <CardDescription>
              État lu côté serveur à chaque visite. Les valeurs des clés ne sont jamais transmises au navigateur.
              Pour configurer un service, renseignez les variables dans <code className="font-mono text-fg-soft">.env.local</code> (local)
              ou dans les réglages du projet Vercel (production).
            </CardDescription>
          </div>
        </CardHeader>
        <CardBody>
          <Suspense fallback={<ServiceStatusSkeleton />}>
            <ServiceStatusList />
          </Suspense>
        </CardBody>
      </Card>

      <ModuleRoadmapCard module={appModule} />
    </div>
  );
}
