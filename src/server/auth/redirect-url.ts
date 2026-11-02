import "server-only";
import { headers } from "next/headers";
import { getServerEnv } from "@/lib/env/server";

/**
 * URL absolue du callback d'authentification, à inclure dans les e-mails.
 * Priorité à NEXT_PUBLIC_APP_URL (fiable en production) ; sinon l'hôte de la requête.
 * Cette URL doit être autorisée dans Supabase → Authentication → URL Configuration.
 */
export async function authCallbackUrl(next?: string): Promise<string> {
  const configured = getServerEnv().NEXT_PUBLIC_APP_URL;
  let origin = configured;
  if (!origin) {
    const h = await headers();
    const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
    const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
    origin = `${proto}://${host}`;
  }
  const url = new URL("/auth/callback", origin);
  if (next) url.searchParams.set("next", next);
  return url.toString();
}
