import "server-only";
import {
  AIProviderError,
  aiErrorKindFromStatus,
  type AIProvider,
  type AIProviderId,
  type ChatRequest,
  type ChatStreamEvent,
} from "@/domain/ai/types";
import { readSseData } from "@/domain/ai/sse";

/**
 * Fournisseur générique pour toute API « compatible OpenAI » (Chat Completions) :
 * Gemini (point d'accès OpenAI de Google), OpenAI, et de nombreux autres.
 * Aucune dépendance externe : un simple `fetch` en streaming.
 */
export class OpenAICompatibleProvider implements AIProvider {
  constructor(
    readonly id: AIProviderId,
    private readonly config: { baseUrl: string; apiKey: string; fetchImpl?: typeof fetch },
  ) {}

  async *streamChat(request: ChatRequest): AsyncGenerator<ChatStreamEvent> {
    const doFetch = this.config.fetchImpl ?? fetch;
    let response: Response;
    try {
      response = await doFetch(`${this.config.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          model: request.model,
          messages: request.messages,
          stream: true,
          stream_options: { include_usage: true },
          ...(request.temperature !== undefined && { temperature: request.temperature }),
          ...(request.maxOutputTokens !== undefined && { max_tokens: request.maxOutputTokens }),
        }),
        signal: request.signal,
      });
    } catch (error) {
      if (request.signal?.aborted) throw new AIProviderError("aborted", "Requête annulée");
      throw new AIProviderError("unavailable", `Fournisseur injoignable : ${(error as Error).message}`);
    }

    if (!response.ok || !response.body) {
      const detail = (await response.text().catch(() => "")).slice(0, 500);
      throw new AIProviderError(aiErrorKindFromStatus(response.status), `HTTP ${response.status} ${detail}`, response.status);
    }

    for await (const data of readSseData(response.body)) {
      if (data === "[DONE]") return;
      yield* parseChunk(data);
    }
  }
}

interface CompletionChunk {
  choices?: { delta?: { content?: string | null }; finish_reason?: string | null }[];
  usage?: { prompt_tokens?: number; completion_tokens?: number } | null;
  error?: { message?: string; code?: number | string };
}

/** Transforme un morceau JSON du flux en événements normalisés. Exporté pour les tests. */
export function* parseChunk(data: string): Generator<ChatStreamEvent> {
  let chunk: CompletionChunk;
  try {
    chunk = JSON.parse(data) as CompletionChunk;
  } catch {
    return; // ligne non JSON (keep-alive) : ignorée
  }
  if (chunk.error) {
    const status = typeof chunk.error.code === "number" ? chunk.error.code : 500;
    throw new AIProviderError(aiErrorKindFromStatus(status), chunk.error.message ?? "Erreur du fournisseur", status);
  }
  for (const choice of chunk.choices ?? []) {
    const text = choice.delta?.content;
    if (text) yield { type: "text", text };
    if (choice.finish_reason) {
      if (choice.finish_reason === "content_filter") {
        throw new AIProviderError("safety", "Réponse bloquée par le filtre de sécurité");
      }
      yield { type: "finish", reason: choice.finish_reason };
    }
  }
  if (chunk.usage) {
    yield {
      type: "usage",
      usage: { inputTokens: chunk.usage.prompt_tokens ?? 0, outputTokens: chunk.usage.completion_tokens ?? 0 },
    };
  }
}
