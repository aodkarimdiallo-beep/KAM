import { ButtonLink } from "@/components/ui/button";
import { BrandMark } from "@/components/layout/brand";

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center px-4">
      <div className="text-center">
        <BrandMark className="mx-auto size-12" />
        <p className="mt-6 text-[11px] uppercase tracking-[0.2em] text-accent-strong">Erreur 404</p>
        <h1 className="mt-2 font-display text-4xl text-fg">Page introuvable</h1>
        <p className="mt-3 text-sm text-muted">Cette page n&apos;existe pas ou a été déplacée.</p>
        <ButtonLink href="/dashboard" className="mt-8">
          Retour au dashboard
        </ButtonLink>
      </div>
    </main>
  );
}
