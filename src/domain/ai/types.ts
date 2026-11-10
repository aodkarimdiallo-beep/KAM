/**
 * Contrat commun à tous les fournisseurs d'IA (Gemini, OpenAI, Claude…).
 * Le reste de l'application ne dépend QUE de ces types, jamais d'un SDK précis.
 */

export const AI_PROVIDER_IDS = ["gemini", "openai", "anthropic"] as const;
export type AIProviderId = (typeof AI_PROVIDER_IDS)[number];

export type ChatRole = "system" | "user" | "assistant";

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export interface ChatRequest {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  maxOutputTokens?: number;
  signal?: AbortSignal;
}

export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
}

export type ChatStreamEvent =
  | { type: "text"; text: string }
  | { type: "usage"; usage: TokenUsage }
  | { type: "finish"; reason: string | null };

export interface AIProvider {
  readonly id: AIProviderId;
  streamChat(request: ChatRequest): AsyncIterable<ChatStreamEvent>;
}

export type AIErrorKind = "auth" | "rate_limit" | "unavailable" | "bad_request" | "safety" | "aborted";

/** Erreur normalisée : l'interface affiche un message selon `kind`, jamais le détail technique. */
export class AIProviderError extends Error {
  constructor(
    readonly kind: AIErrorKind,
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = "AIProviderError";
  }
}

export function aiErrorKindFromStatus(status: number): AIErrorKind {
  if (status === 401 || status === 403) return "auth";
  if (status === 429) return "rate_limit";
  if (status >= 500) return "unavailable";
  return "bad_request";
}

export const AI_ERROR_MESSAGES: Record<AIErrorKind, string> = {
  auth: "Le fournisseur d'IA refuse la clé configurée. Vérifiez la clé dans les réglages.",
  rate_limit: "Le fournisseur d'IA limite temporairement les requêtes. Réessayez dans un instant.",
  unavailable: "Le fournisseur d'IA est momentanément indisponible. Réessayez dans un instant.",
  bad_request: "La requête n'a pas pu être traitée par le fournisseur d'IA.",
  safety: "Le fournisseur d'IA a bloqué cette réponse pour des raisons de sécurité.",
  aborted: "La réponse a été interrompue.",
};
