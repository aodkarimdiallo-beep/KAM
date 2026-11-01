import "server-only";
import { createClient } from "@supabase/supabase-js";
import { ConfigurationError } from "@/lib/env/schema";
import { getServerEnv } from "@/lib/env/server";

/**
 * Client Supabase ADMINISTRATEUR : contourne la Row Level Security.
 *
 * À n'utiliser que pour des opérations système explicitement justifiées
 * (tâches planifiées, suppression de compte…), jamais pour servir une requête
 * utilisateur ordinaire. Chaque usage doit être journalisé dans audit_logs.
 */
export function createSupabaseAdminClient() {
  const env = getServerEnv();
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const secret = env.SUPABASE_SECRET_KEY;
  if (!url || !secret) {
    throw new ConfigurationError("La clé serveur Supabase n'est pas configurée.", [
      ...(url ? [] : ["NEXT_PUBLIC_SUPABASE_URL"]),
      ...(secret ? [] : ["SUPABASE_SECRET_KEY"]),
    ]);
  }
  return createClient(url, secret, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
