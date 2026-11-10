import "server-only";
import type { ConversationRow, MessageRow } from "@/server/db/database.types";
import { createSupabaseServerClient } from "@/server/supabase/server";

/**
 * Accès aux conversations et messages. Toutes les requêtes passent par le client
 * « utilisateur » : la RLS garantit qu'on ne lit ni n'écrit que ses propres données.
 */

export type ConversationSummary = Pick<ConversationRow, "id" | "title" | "last_message_at" | "created_at">;
export type ChatMessageRecord = Pick<MessageRow, "id" | "role" | "content" | "model" | "created_at">;

type Client = Awaited<ReturnType<typeof createSupabaseServerClient>>;

function fail(action: string, error: { message: string }): never {
  throw new Error(`${action} : ${error.message}`);
}

/** Échappe les caractères spéciaux d'un motif ILIKE. */
function likePattern(search: string): string {
  return `%${search.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
}

export async function listConversations(search?: string, client?: Client): Promise<ConversationSummary[]> {
  const supabase = client ?? (await createSupabaseServerClient());
  const term = search?.trim().slice(0, 100);

  if (term) {
    // Recherche dans les titres ET dans le contenu des messages.
    const [byTitle, byContent] = await Promise.all([
      supabase.from("conversations").select("id").is("archived_at", null).ilike("title", likePattern(term)).limit(50),
      supabase.from("messages").select("conversation_id").ilike("content", likePattern(term)).limit(200),
    ]);
    if (byTitle.error) fail("Recherche des conversations", byTitle.error);
    if (byContent.error) fail("Recherche dans les messages", byContent.error);
    const ids = [...new Set([...byTitle.data.map((c) => c.id), ...byContent.data.map((m) => m.conversation_id)])];
    if (ids.length === 0) return [];
    const { data, error } = await supabase
      .from("conversations")
      .select("id, title, last_message_at, created_at")
      .in("id", ids)
      .is("archived_at", null)
      .order("last_message_at", { ascending: false, nullsFirst: false });
    if (error) fail("Lecture des conversations", error);
    return data;
  }

  const { data, error } = await supabase
    .from("conversations")
    .select("id, title, last_message_at, created_at")
    .is("archived_at", null)
    .order("last_message_at", { ascending: false, nullsFirst: false })
    .limit(100);
  if (error) fail("Lecture des conversations", error);
  return data;
}

export async function getConversation(id: string, client?: Client): Promise<ConversationSummary | null> {
  const supabase = client ?? (await createSupabaseServerClient());
  const { data, error } = await supabase
    .from("conversations")
    .select("id, title, last_message_at, created_at")
    .eq("id", id)
    .is("archived_at", null)
    .maybeSingle();
  if (error) fail("Lecture de la conversation", error);
  return data;
}

export async function listMessages(conversationId: string, client?: Client, limit = 200): Promise<ChatMessageRecord[]> {
  const supabase = client ?? (await createSupabaseServerClient());
  const { data, error } = await supabase
    .from("messages")
    .select("id, role, content, model, created_at")
    .eq("conversation_id", conversationId)
    .in("role", ["user", "assistant"])
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) fail("Lecture des messages", error);
  return data.reverse();
}

export async function createConversation(title: string, client: Client): Promise<string> {
  const { data, error } = await client.from("conversations").insert({ title }).select("id").single();
  if (error) fail("Création de la conversation", error);
  return data.id;
}

export async function insertMessage(
  client: Client,
  message: {
    conversation_id: string;
    role: "user" | "assistant";
    content: string;
    provider?: string;
    model?: string;
    input_tokens?: number;
    output_tokens?: number;
    context?: Record<string, string | number | boolean | null>;
  },
): Promise<string> {
  const { data, error } = await client.from("messages").insert(message).select("id").single();
  if (error) fail("Enregistrement du message", error);
  await client.from("conversations").update({ last_message_at: new Date().toISOString() }).eq("id", message.conversation_id);
  return data.id;
}
