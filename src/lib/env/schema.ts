import { z } from "zod";

/**
 * Schémas des variables d'environnement.
 *
 * Toutes les variables sont optionnelles au niveau du schéma : l'application doit
 * pouvoir démarrer et afficher clairement ce qui reste à configurer, plutôt que
 * de planter au premier import. Chaque service vérifie ensuite ses propres
 * prérequis et lève une `ConfigurationError` explicite.
 */

const optionalString = z
  .string()
  .trim()
  .transform((value) => (value === "" ? undefined : value))
  .optional();

const optionalUrl = optionalString.pipe(z.url().optional());

/** Variables lisibles par le navigateur (préfixe NEXT_PUBLIC_). Aucune donnée secrète. */
export const publicEnvSchema = z.object({
  NEXT_PUBLIC_APP_URL: optionalUrl,
  NEXT_PUBLIC_SUPABASE_URL: optionalUrl,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: optionalString,
});

/** Variables strictement serveur. Ne jamais les importer dans un Client Component. */
export const serverEnvSchema = publicEnvSchema.extend({
  SUPABASE_SECRET_KEY: optionalString,
  AI_DEFAULT_PROVIDER: z.enum(["gemini", "openai", "anthropic"]).default("gemini"),
  GEMINI_API_KEY: optionalString,
  GEMINI_CHAT_MODEL: optionalString,
  GEMINI_EMBEDDING_MODEL: optionalString,
  OPENAI_API_KEY: optionalString,
  ANTHROPIC_API_KEY: optionalString,
  SEARCH_PROVIDER: optionalString,
  SEARCH_API_KEY: optionalString,
});

export type PublicEnv = z.infer<typeof publicEnvSchema>;
export type ServerEnv = z.infer<typeof serverEnvSchema>;

export class ConfigurationError extends Error {
  constructor(
    message: string,
    readonly missing: readonly string[],
  ) {
    super(message);
    this.name = "ConfigurationError";
  }
}

/** Analyse un objet de type `process.env`. Lève une erreur lisible si une valeur est mal formée. */
export function parseServerEnv(source: Record<string, string | undefined>): ServerEnv {
  const result = serverEnvSchema.safeParse(source);
  if (!result.success) {
    const fields = result.error.issues.map((issue) => issue.path.join("."));
    throw new ConfigurationError(
      `Variables d'environnement invalides : ${fields.join(", ")}`,
      fields,
    );
  }
  return result.data;
}
