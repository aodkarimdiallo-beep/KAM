import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { ConfigurationError } from "@/lib/env/schema";
import { getServerEnv } from "@/lib/env/server";
import type { Database } from "@/server/db/database.types";

/**
 * Client Supabase pour Server Components, Server Actions et Route Handlers.
 * Il agit AU NOM de l'utilisateur connecté (cookie de session) : la Row Level
 * Security de Postgres s'applique donc à chaque requête.
 */
export async function createSupabaseServerClient() {
  const env = getServerEnv();
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const key = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    throw new ConfigurationError("Supabase n'est pas configuré.", [
      ...(url ? [] : ["NEXT_PUBLIC_SUPABASE_URL"]),
      ...(key ? [] : ["NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"]),
    ]);
  }

  // Données personnelles : toujours calculées à la requête, jamais pré-rendues.
  // (Le client Supabase lit l'heure courante pour vérifier l'expiration de la session.)
  await connection();
  const cookieStore = await cookies();
  return createServerClient<Database>(url, key, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet) => {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Appelé depuis un Server Component (cookies en lecture seule) :
          // le rafraîchissement de session est assuré par le proxy (src/proxy.ts).
        }
      },
    },
  });
}
