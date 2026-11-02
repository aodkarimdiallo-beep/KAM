import { Check } from "lucide-react";
import { connection } from "next/server";
import { getServerEnv } from "@/lib/env/server";
import { cn } from "@/lib/utils/cn";
import { getCurrentUser } from "@/server/auth/session";
import { getMyProfile } from "@/server/profile/queries";
import { getConfigurationStatus } from "@/server/system/configuration-status";

interface Step {
  label: string;
  hint: string;
  /** `true` / `false` = état réellement vérifié ; `null` = pas encore vérifiable. */
  done: boolean | null;
}

/** Liste de mise en route du Twin. Seuls les éléments vérifiables sont cochés. */
export async function SetupChecklist() {
  await connection();
  const status = Object.fromEntries(getConfigurationStatus(getServerEnv()).map((s) => [s.key, s.configured]));
  const user = await getCurrentUser();
  const profile = user ? await getMyProfile() : null;
  const profileComplete = Boolean(profile?.full_name && (profile.headline || profile.bio));

  const steps: Step[] = [
    { label: "Connecter Supabase", hint: "Base de données, authentification, stockage", done: Boolean(status.supabase) },
    { label: "Ajouter une clé d'IA", hint: "Gemini en premier fournisseur", done: Boolean(status.ai) },
    {
      label: "Créer votre compte",
      hint: status.supabase ? "Inscription et connexion sécurisées" : "Nécessite Supabase",
      done: status.supabase ? Boolean(user) : null,
    },
    {
      label: "Compléter votre profil",
      hint: "Nom complet et présentation, dans Settings",
      done: user ? profileComplete : null,
    },
    { label: "Enregistrer un premier souvenir", hint: "Disponible à l'étape 5", done: null },
  ];

  const completed = steps.filter((s) => s.done).length;

  return (
    <div>
      <div className="mb-5 flex items-baseline justify-between">
        <p className="text-sm text-muted">
          <span className="font-display text-3xl text-fg">{completed}</span> / {steps.length} étapes
        </p>
      </div>
      <div className="mb-6 h-1 overflow-hidden rounded-full bg-white/[0.05]" aria-hidden>
        <div
          className="h-full rounded-full bg-gradient-to-r from-bronze to-copper transition-[width] duration-700"
          style={{ width: `${(completed / steps.length) * 100}%` }}
        />
      </div>
      <ol className="flex flex-col gap-3">
        {steps.map((step) => (
          <li key={step.label} className="flex items-start gap-3">
            <span
              className={cn(
                "mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border",
                step.done ? "border-copper bg-copper text-ink-950" : "border-line-strong",
                step.done === null && "border-dashed",
              )}
            >
              {step.done && <Check className="size-3" strokeWidth={2.5} aria-hidden />}
            </span>
            <div>
              <p className={cn("text-sm", step.done ? "text-muted line-through decoration-line-strong" : "text-fg")}>
                {step.label}
                <span className="sr-only">{step.done ? " — terminé" : step.done === null ? " — à venir" : " — à faire"}</span>
              </p>
              <p className="text-[12.5px] text-muted">{step.hint}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
