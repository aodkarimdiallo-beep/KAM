"use client";

import { createBrowserClient } from "@supabase/ssr";
import { getPublicEnv } from "@/lib/env/public";

/**
 * Client Supabase pour le navigateur. N'utilise QUE la clé publique :
 * toute la sécurité repose sur la Row Level Security côté base.
 */
export function createSupabaseBrowserClient() {
  const { NEXT_PUBLIC_SUPABASE_URL: url, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: key } =
    getPublicEnv();
  if (!url || !key) {
    throw new Error("Supabase n'est pas configuré (variables NEXT_PUBLIC_SUPABASE_*).");
  }
  return createBrowserClient(url, key);
}
