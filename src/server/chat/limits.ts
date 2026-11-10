import "server-only";
import { createSupabaseServerClient } from "@/server/supabase/server";

type Client = Awaited<ReturnType<typeof createSupabaseServerClient>>;

export const DEFAULT_MAX_REQUESTS_PER_MINUTE = 10;

export type LimitCheck = { allowed: true } | { allowed: false; reason: string };

/**
 * Limites d'usage, calculées à partir du journal `usage_events` (lisible par
 * l'utilisateur pour ses seules lignes, non falsifiable). Protège le budget IA.
 */
export async function checkChatLimits(client: Client, userId: string, maxPerMinute: number): Promise<LimitCheck> {
  const oneMinuteAgo = new Date(Date.now() - 60_000).toISOString();
  const recent = await client
    .from("usage_events")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", oneMinuteAgo);
  if (recent.error) throw new Error(`Vérification des limites : ${recent.error.message}`);
  if ((recent.count ?? 0) >= maxPerMinute) {
    return { allowed: false, reason: "Vous envoyez beaucoup de messages en peu de temps. Patientez une minute." };
  }

  const settings = await client.from("user_settings").select("monthly_token_limit").eq("user_id", userId).maybeSingle();
  if (settings.error) throw new Error(`Lecture des réglages : ${settings.error.message}`);
  const monthlyLimit = settings.data?.monthly_token_limit;
  if (monthlyLimit != null) {
    const startOfMonth = new Date();
    startOfMonth.setUTCDate(1);
    startOfMonth.setUTCHours(0, 0, 0, 0);
    const usage = await client
      .from("usage_events")
      .select("input_tokens, output_tokens")
      .eq("user_id", userId)
      .gte("created_at", startOfMonth.toISOString());
    if (usage.error) throw new Error(`Lecture de l'usage : ${usage.error.message}`);
    const used = usage.data.reduce((sum, row) => sum + row.input_tokens + row.output_tokens, 0);
    if (used >= monthlyLimit) {
      return { allowed: false, reason: "Votre quota mensuel d'utilisation de l'IA est atteint." };
    }
  }
  return { allowed: true };
}
