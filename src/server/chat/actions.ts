"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getCurrentUser } from "@/server/auth/session";
import { createSupabaseServerClient } from "@/server/supabase/server";

/** Supprime définitivement une conversation et ses messages (RLS : uniquement les siennes). */
export async function deleteConversation(formData: FormData): Promise<void> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const id = z.uuid().safeParse(formData.get("conversationId"));
  if (!id.success) return;

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("conversations").delete().eq("id", id.data);
  if (error) throw new Error("La conversation n'a pas pu être supprimée.");
  await supabase.rpc("record_audit_event", {
    p_action: "conversation.delete",
    p_entity_type: "conversation",
    p_entity_id: id.data,
  });
  revalidatePath("/chat", "layout");
  redirect("/chat");
}

/** Après une réponse : rafraîchit la liste des conversations dans toutes les pages du chat. */
export async function refreshConversations(): Promise<void> {
  revalidatePath("/chat", "layout");
}
