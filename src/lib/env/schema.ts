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

/** Nombre optionnel lu depuis une chaîne ("" ou absent → undefined). */
const optionalNumber = (schema: z.ZodNumber) =>
  z
    .string()
    .trim()
    .optional()
    .transform((value) => (value === undefined || value === "" ? undefined : Number(value)))
    .pipe(schema.optional());

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
  OPENAI_CHAT_MODEL: optionalString,
  // Optionnel : remplace l'adresse du fournisseur (passerelle d'entreprise, serveur de test local).
  AI_BASE_URL: optionalUrl,
  // Tarifs (USD par million de jetons) servant à estimer le coût de chaque appel.
  // Laissés vides, le coût est enregistré à 0 et signalé comme « non estimé ».
  AI_PRICE_INPUT_USD_PER_MTOK: optionalNumber(z.number().nonnegative()),
  AI_PRICE_OUTPUT_USD_PER_MTOK: optionalNumber(z.number().nonnegative()),
  // Limites d'usage par utilisateur (protection des coûts).
  CHAT_MAX_REQUESTS_PER_MINUTE: optionalNumber(z.number().int().positive()),
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
