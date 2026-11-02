import "server-only";
import { redirect } from "next/navigation";
import { cache } from "react";
import { LOGIN_PATH } from "@/config/routes";
import { ConfigurationError } from "@/lib/env/schema";
import { createSupabaseServerClient } from "@/server/supabase/server";

export interface SessionUser {
  id: string;
  email: string | null;
}

/**
 * Utilisateur connecté, ou `null`. Couche d'accès centralisée (« Data Access Layer ») :
 * l'identité vient du JWT VÉRIFIÉ par Supabase (getClaims), jamais d'un paramètre client.
 * Mis en cache pour la durée d'une requête.
 */
export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  let supabase;
  try {
    supabase = await createSupabaseServerClient();
  } catch (error) {
    if (error instanceof ConfigurationError) return null;
    throw error;
  }
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims?.sub) return null;
  return { id: data.claims.sub, email: typeof data.claims.email === "string" ? data.claims.email : null };
});

/** Exige une session ; redirige vers la connexion sinon (défense en profondeur après le proxy). */
export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect(LOGIN_PATH);
  return user;
}
