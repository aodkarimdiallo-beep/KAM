import "server-only";
import { estimateCostUsd } from "@/domain/ai/cost";
import { AI_ERROR_MESSAGES, AIProviderError, type TokenUsage } from "@/domain/ai/types";
import { buildChatMessages, conversationTitleFrom, type TwinProfileContext } from "@/domain/chat/context";
import { encodeEvent, type ChatRequestBody, type ChatServerEvent } from "@/domain/chat/protocol";
import type { ServerEnv } from "@/lib/env/schema";
import { getChatModel } from "@/server/ai/registry";
import { createSupabaseServerClient } from "@/server/supabase/server";
import { DEFAULT_MAX_REQUESTS_PER_MINUTE, checkChatLimits } from "./limits";
import { createConversation, getConversation, insertMessage, listMessages } from "./repository";

type Client = Awaited<ReturnType<typeof createSupabaseServerClient>>;

export class ChatRequestError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

async function loadProfile(client: Client, userId: string): Promise<TwinProfileContext | null> {
  const { data } = await client
    .from("profiles")
    .select("display_name, full_name, headline, bio, timezone, locale")
    .eq("id", userId)
    .maybeSingle();
  if (!data) return null;
  return {
    displayName: data.display_name,
    fullName: data.full_name,
    headline: data.headline,
    bio: data.bio,
    timezone: data.timezone,
    locale: data.locale,
  };
}

/**
 * Prépare une réponse : vérifications, enregistrement du message de l'utilisateur,
 * puis renvoie un flux qui diffuse la réponse de l'IA et l'enregistre à la fin.
 * Les erreurs « avant streaming » sont levées (statut HTTP), celles « pendant » sont
 * envoyées comme événement `error`.
 */
export async function startChatTurn(params: {
  env: ServerEnv;
  userId: string;
  body: ChatRequestBody;
  signal: AbortSignal;
}): Promise<ReadableStream<Uint8Array>> {
  const { env, userId, body, signal } = params;
  const { provider, model } = getChatModel(env); // ConfigurationError si l'IA n'est pas configurée
  const client = await createSupabaseServerClient();

  const limits = await checkChatLimits(client, userId, env.CHAT_MAX_REQUESTS_PER_MINUTE ?? DEFAULT_MAX_REQUESTS_PER_MINUTE);
  if (!limits.allowed) throw new ChatRequestError(limits.reason, 429);

  let conversationId = body.conversationId;
  let title = conversationTitleFrom(body.message);
  if (conversationId) {
    const existing = await getConversation(conversationId, client);
    if (!existing) throw new ChatRequestError("Conversation introuvable.", 404);
    title = existing.title ?? title;
  } else {
    conversationId = await createConversation(title, client);
  }

  await insertMessage(client, { conversation_id: conversationId, role: "user", content: body.message });
  const [profile, history] = await Promise.all([loadProfile(client, userId), listMessages(conversationId, client, 60)]);
  const messages = buildChatMessages(
    profile,
    history.filter((m): m is typeof m & { role: "user" | "assistant" } => m.role === "user" || m.role === "assistant"),
  );

  const encoder = new TextEncoder();
  const pricing =
    env.AI_PRICE_INPUT_USD_PER_MTOK !== undefined && env.AI_PRICE_OUTPUT_USD_PER_MTOK !== undefined
      ? { inputUsdPerMillion: env.AI_PRICE_INPUT_USD_PER_MTOK, outputUsdPerMillion: env.AI_PRICE_OUTPUT_USD_PER_MTOK }
      : null;
  const finalConversationId = conversationId;

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: ChatServerEvent) => {
        try {
          controller.enqueue(encoder.encode(encodeEvent(event)));
        } catch {
          // Le navigateur s'est déconnecté : on continue pour enregistrer la réponse.
        }
      };
      send({ type: "conversation", conversationId: finalConversationId, title });

      const startedAt = Date.now();
      let answer = "";
      let usage: TokenUsage = { inputTokens: 0, outputTokens: 0 };
      let failure: string | null = null;

      try {
        for await (const event of provider.streamChat({ model, messages, signal })) {
          if (event.type === "text") {
            answer += event.text;
            send({ type: "text", text: event.text });
          } else if (event.type === "usage") {
            usage = event.usage;
          }
        }
      } catch (error) {
        failure =
          error instanceof AIProviderError ? AI_ERROR_MESSAGES[error.kind] : "Une erreur inattendue est survenue.";
        console.error("[chat] échec du fournisseur IA", error);
      }

      try {
        // On enregistre la réponse (même partielle) et l'usage réellement consommé.
        let messageId = "";
        if (answer) {
          messageId = await insertMessage(client, {
            conversation_id: finalConversationId,
            role: "assistant",
            content: answer,
            provider: provider.id,
            model,
            input_tokens: usage.inputTokens,
            output_tokens: usage.outputTokens,
            context: { memories_used: 0, partial: failure !== null },
          });
        }
        if (usage.inputTokens + usage.outputTokens > 0 || answer) {
          const cost = estimateCostUsd(usage, pricing);
          const { error } = await client.rpc("record_usage_event", {
            p_provider: provider.id,
            p_model: model,
            p_operation: "chat",
            p_input_tokens: usage.inputTokens,
            p_output_tokens: usage.outputTokens,
            p_cost_usd: cost.usd,
            p_latency_ms: Date.now() - startedAt,
          });
          if (error) console.error("[chat] usage non journalisé", error.message);
        }
        if (failure) send({ type: "error", message: failure });
        else send({ type: "done", messageId, model, ...usage });
      } catch (error) {
        console.error("[chat] enregistrement de la réponse impossible", error);
        send({ type: "error", message: "La réponse n'a pas pu être enregistrée." });
      } finally {
        try {
          controller.close();
        } catch {
          // déjà fermé
        }
      }
    },
  });
}
