import type { ReactNode } from "react";

export function SectionTitle({ eyebrow, title, aside }: { eyebrow?: string; title: string; aside?: ReactNode }) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <div>
        {eyebrow && <p className="mb-1 text-[11px] font-medium uppercase tracking-[0.18em] text-accent-strong">{eyebrow}</p>}
        <h2 className="text-lg font-medium tracking-tight text-fg">{title}</h2>
      </div>
      {aside}
    </div>
  );
}
