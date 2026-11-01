import { publicEnvSchema, type PublicEnv } from "./schema";

/**
 * Variables publiques. Next.js remplace `process.env.NEXT_PUBLIC_*` à la compilation :
 * elles doivent donc être référencées une par une, littéralement.
 */
export function getPublicEnv(): PublicEnv {
  return publicEnvSchema.parse({
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  });
}
