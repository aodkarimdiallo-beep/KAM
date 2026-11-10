import type { ServerEnv } from "@/lib/env/schema";

export type ServiceKey = "supabase" | "supabaseAdmin" | "ai" | "search";

export interface ServiceStatus {
  key: ServiceKey;
  label: string;
  configured: boolean;
  /** Noms des variables manquantes — jamais leurs valeurs. */
  missing: string[];
  requiredFor: string;
}

function check(env: ServerEnv, names: (keyof ServerEnv)[]): string[] {
  return names.filter((name) => !env[name]);
}

const AI_VARS_BY_PROVIDER = {
  gemini: ["GEMINI_API_KEY", "GEMINI_CHAT_MODEL"],
  openai: ["OPENAI_API_KEY", "OPENAI_CHAT_MODEL"],
  anthropic: ["ANTHROPIC_API_KEY"],
} as const satisfies Record<ServerEnv["AI_DEFAULT_PROVIDER"], readonly (keyof ServerEnv)[]>;

/**
 * Calcule l'état de configuration des services externes.
 * Fonction pure : facile à tester, n'expose aucune valeur secrète.
 */
export function getConfigurationStatus(env: ServerEnv): ServiceStatus[] {
  const supabaseMissing = check(env, ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"]);
  const adminMissing = check(env, ["SUPABASE_SECRET_KEY"]);
  const aiMissing = check(env, [...AI_VARS_BY_PROVIDER[env.AI_DEFAULT_PROVIDER]]);
  const searchMissing = check(env, ["SEARCH_PROVIDER", "SEARCH_API_KEY"]);

  return [
    {
      key: "supabase",
      label: "Supabase (base de données et authentification)",
      configured: supabaseMissing.length === 0,
      missing: supabaseMissing,
      requiredFor: "Comptes, conversations, mémoire, projets",
    },
    {
      key: "supabaseAdmin",
      label: "Supabase — clé serveur",
      configured: adminMissing.length === 0,
      missing: adminMissing,
      requiredFor: "Tâches d'administration côté serveur uniquement",
    },
    {
      key: "ai",
      label: `Fournisseur IA (${env.AI_DEFAULT_PROVIDER})`,
      configured: aiMissing.length === 0,
      missing: aiMissing,
      requiredFor: "AI Chat, extraction de souvenirs, agents",
    },
    {
      key: "search",
      label: "Recherche Internet",
      configured: searchMissing.length === 0,
      missing: searchMissing,
      requiredFor: "Module Research (étape 6)",
    },
  ];
}
