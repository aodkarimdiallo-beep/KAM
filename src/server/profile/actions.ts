"use server";

import { revalidatePath } from "next/cache";
import { fieldErrors, type FormState } from "@/domain/auth/schemas";
import { profileUpdateSchema } from "@/domain/profile/schema";
import { getCurrentUser } from "@/server/auth/session";
import { createSupabaseServerClient } from "@/server/supabase/server";

const FIELDS = ["display_name", "full_name", "headline", "bio", "timezone"] as const;

export async function updateMyProfile(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user) return { status: "error", message: "Votre session a expiré. Reconnectez-vous." };

  const raw = Object.fromEntries(FIELDS.map((key) => [key, String(formData.get(key) ?? "")]));
  const parsed = profileUpdateSchema.safeParse(raw);
  if (!parsed.success) return { status: "error", fieldErrors: fieldErrors(parsed.error), values: raw };

  const supabase = await createSupabaseServerClient();
  // L'identifiant vient de la session vérifiée ; la RLS l'impose de toute façon côté base.
  const { error } = await supabase.from("profiles").update(parsed.data).eq("id", user.id);
  if (error) return { status: "error", message: "L'enregistrement a échoué. Réessayez.", values: raw };

  await supabase.rpc("record_audit_event", { p_action: "profile.update", p_entity_type: "profile", p_entity_id: user.id });
  revalidatePath("/settings");
  return { status: "success", message: "Profil enregistré." };
}
