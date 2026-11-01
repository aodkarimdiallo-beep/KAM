import type { ReactNode } from "react";
import type { AppModule } from "@/config/modules";
import { ModuleStatusBadge } from "./module-status-badge";

export function PageHeader({
  module: m,
  title,
  description,
  actions,
}: {
  module?: AppModule;
  title?: string;
  description?: string;
  actions?: ReactNode;
}) {
  const Icon = m?.icon;
  return (
    <header className="flex flex-col gap-5 border-b border-line pb-8 sm:flex-row sm:items-end sm:justify-between motion-safe:animate-fade-up">
      <div className="min-w-0">
        <div className="mb-4 flex items-center gap-3">
          {Icon && (
            <span className="grid size-9 place-items-center rounded-xl border border-line-strong bg-umber-900/60 text-copper">
              <Icon className="size-4.5" strokeWidth={1.6} aria-hidden />
            </span>
          )}
          {m && <ModuleStatusBadge module={m} />}
        </div>
        <h1 className="font-display text-4xl leading-[1.05] tracking-tight text-fg sm:text-5xl">
          {title ?? m?.label}
        </h1>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted">{description ?? m?.tagline}</p>
      </div>
      {actions && <div className="flex shrink-0 gap-2">{actions}</div>}
    </header>
  );
}
