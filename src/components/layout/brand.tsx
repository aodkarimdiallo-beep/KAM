import Link from "next/link";
import { cn } from "@/lib/utils/cn";

/**
 * Monogramme : deux cercles superposés — la personne et son double numérique.
 * Couleurs pleines (pas de <linearGradient> à id partagé : une instance masquée
 * en CSS casserait la référence des autres).
 */
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden className={cn("size-8", className)}>
      <rect x="0.5" y="0.5" width="31" height="31" rx="9" fill="#151311" stroke="rgb(232 216 200 / 0.14)" />
      <circle cx="13" cy="16" r="6.5" fill="none" stroke="#C18A62" strokeWidth="1.6" />
      <circle cx="19" cy="16" r="6.5" fill="none" stroke="#E8D8C8" strokeWidth="1.6" strokeOpacity="0.5" />
    </svg>
  );
}

export function Brand({ className }: { className?: string }) {
  return (
    <Link href="/dashboard" className={cn("group flex items-center gap-3", className)} aria-label="Digital Twin — accueil">
      <BrandMark className="transition-transform duration-500 ease-(--ease-soft) group-hover:rotate-[8deg]" />
      <span className="leading-none">
        <span className="block text-[13px] font-semibold tracking-[0.22em] text-fg">DIGITAL TWIN</span>
        <span className="mt-1 block text-[11px] text-muted">Intelligence personnelle</span>
      </span>
    </Link>
  );
}
