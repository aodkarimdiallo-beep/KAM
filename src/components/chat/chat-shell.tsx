import type { ReactNode } from "react";

/** Mise en page du chat : liste des conversations à gauche (repliable sur mobile). */
export function ChatShell({ list, children }: { list: ReactNode; children: ReactNode }) {
  return (
    <div className="-my-8 grid gap-6 sm:-my-12 lg:h-[calc(100dvh-1rem)] lg:grid-cols-[260px_1fr] lg:py-6">
      <aside className="hidden lg:block">{list}</aside>
      <details className="group rounded-(--radius-card) border border-line bg-surface/70 p-3 lg:hidden">
        <summary className="cursor-pointer list-none text-[13px] text-fg-soft">
          <span className="group-open:hidden">Afficher les conversations</span>
          <span className="hidden group-open:inline">Masquer les conversations</span>
        </summary>
        <div className="mt-4 max-h-80">{list}</div>
      </details>
      <section className="flex min-h-[70dvh] min-w-0 flex-col lg:min-h-0">{children}</section>
    </div>
  );
}
