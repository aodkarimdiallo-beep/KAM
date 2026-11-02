import type { ReactNode } from "react";

export function AuthCard({ title, subtitle, children, footer }: { title: string; subtitle: string; children: ReactNode; footer?: ReactNode }) {
  return (
    <div className="w-full max-w-md motion-safe:animate-fade-up">
      <div className="rounded-(--radius-card) border border-line bg-surface/85 p-6 shadow-(--shadow-card) backdrop-blur-md sm:p-8">
        <h1 className="font-display text-4xl leading-tight text-fg">{title}</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">{subtitle}</p>
        <div className="mt-8">{children}</div>
      </div>
      {footer && <div className="mt-6 text-center text-sm text-muted">{footer}</div>}
    </div>
  );
}
