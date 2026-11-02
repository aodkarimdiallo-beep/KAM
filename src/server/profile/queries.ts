import "server-only";
import type { ProfileRow } from "@/server/db/database.types";
import { requireUser } from "@/server/auth/session";
import { createSupabaseServerClient } from "@/server/supabase/server";

export type Profile = Pick<
  ProfileRow,
  "id" | "display_name" | "full_name" | "headline" | "bio" | "locale" | "timezone"
>;

/** Profil de l'utilisateur connecté. La RLS garantit qu'aucun autre profil n'est lisible. */
export async function getMyProfile(): Promise<Profile | null> {
  const user = await requireUser();
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, display_name, full_name, headline, bio, locale, timezone")
    .eq("id", user.id)
    .maybeSingle();
  if (error) throw new Error(`Lecture du profil impossible : ${error.message}`);
  return data;
}
