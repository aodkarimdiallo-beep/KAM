import { ShieldCheck } from "lucide-react";

export function SidebarFooter() {
  return (
    <div className="rounded-xl border border-line bg-canvas/50 p-3.5">
      <div className="flex items-center gap-2 text-[12px] text-fg-soft">
        <ShieldCheck className="size-3.5 text-accent-strong" strokeWidth={1.6} aria-hidden />
        Version MVP
      </div>
      <p className="mt-1.5 text-[11.5px] leading-relaxed text-muted">
        Votre Twin est une IA : il modélise votre façon de penser, il ne prétend jamais être vous.
      </p>
    </div>
  );
}
