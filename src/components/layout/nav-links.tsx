"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import { groupModules, isModuleActive } from "@/config/modules";
import { cn } from "@/lib/utils/cn";

/**
 * Navigation principale. Le lien actif dépend de l'adresse, connue seulement à la
 * requête sur les routes dynamiques (/chat/[id]) : la liste s'affiche d'abord sans
 * surbrillance (dans la coquille statique), puis le lien actif s'allume.
 */
export function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <Suspense fallback={<NavList pathname={null} onNavigate={onNavigate} />}>
      <ActiveNavList onNavigate={onNavigate} />
    </Suspense>
  );
}

function ActiveNavList({ onNavigate }: { onNavigate?: () => void }) {
  return <NavList pathname={usePathname()} onNavigate={onNavigate} />;
}

function NavList({ pathname, onNavigate }: { pathname: string | null; onNavigate?: () => void }) {

  return (
    <nav aria-label="Navigation principale" className="flex flex-col gap-6">
      {groupModules().map(({ group, label, modules }) => (
        <div key={group}>
          <p className="mb-2 px-3 text-[10.5px] font-medium uppercase tracking-[0.2em] text-muted/70">{label}</p>
          <ul className="flex flex-col gap-0.5">
            {modules.map(({ id, href, label: moduleLabel, icon: Icon, status }) => {
              const active = pathname !== null && isModuleActive(href, pathname);
              return (
                <li key={id}>
                  <Link
                    href={href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "group relative flex items-center gap-3 rounded-xl px-3 py-2 text-[13.5px] transition-colors duration-200",
                      active
                        ? "bg-gradient-to-r from-umber-700/70 to-umber-900/30 text-fg"
                        : "text-muted hover:bg-white/[0.03] hover:text-fg-soft",
                    )}
                  >
                    {active && (
                      <span aria-hidden className="absolute inset-y-2 left-0 w-px rounded-full bg-copper" />
                    )}
                    <Icon
                      className={cn("size-4 shrink-0", active ? "text-copper" : "text-muted group-hover:text-fg-soft")}
                      strokeWidth={1.6}
                      aria-hidden
                    />
                    <span className="flex-1 truncate">{moduleLabel}</span>
                    {status === "planned" && (
                      <span className="size-1 rounded-full bg-muted/40" title="En développement" aria-hidden />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
