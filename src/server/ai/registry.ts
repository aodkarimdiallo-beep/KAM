import "server-only";
import type { AIProvider } from "@/domain/ai/types";
import { ConfigurationError, type ServerEnv } from "@/lib/env/schema";
import { OpenAICompatibleProvider } from "./openai-compatible";

export interface ChatModelConfig {
  provider: AIProvider;
  model: string;
}

/** Points d'accès « compatibles OpenAI » de chaque fournisseur. */
const BASE_URLS = {
  gemini: "https://generativelanguage.googleapis.com/v1beta/openai",
  openai: "https://api.openai.com/v1",
} as const;

/**
 * Fournisseur de conversation actif, choisi par AI_DEFAULT_PROVIDER.
 * Changer de fournisseur = changer une variable d'environnement, sans toucher au code.
 */
export function getChatModel(env: ServerEnv): ChatModelConfig {
  switch (env.AI_DEFAULT_PROVIDER) {
    case "gemini":
      return build("gemini", env.GEMINI_API_KEY, "GEMINI_API_KEY", env.GEMINI_CHAT_MODEL, "GEMINI_CHAT_MODEL", env.AI_BASE_URL);
    case "openai":
      return build("openai", env.OPENAI_API_KEY, "OPENAI_API_KEY", env.OPENAI_CHAT_MODEL, "OPENAI_CHAT_MODEL", env.AI_BASE_URL);
    case "anthropic":
      // Prévu : un adaptateur dédié (l'API Claude n'est pas « compatible OpenAI »).
      throw new ConfigurationError("Le fournisseur Anthropic n'est pas encore branché.", ["AI_DEFAULT_PROVIDER"]);
  }
}

function build(
  id: keyof typeof BASE_URLS,
  apiKey: string | undefined,
  keyName: string,
  model: string | undefined,
  modelName: string,
  baseUrlOverride?: string,
): ChatModelConfig {
  const missing = [...(apiKey ? [] : [keyName]), ...(model ? [] : [modelName])];
  if (!apiKey || !model) throw new ConfigurationError(`Fournisseur IA « ${id} » incomplet.`, missing);
  const baseUrl = (baseUrlOverride ?? BASE_URLS[id]).replace(/\/+$/, "");
  return { provider: new OpenAICompatibleProvider(id, { baseUrl, apiKey }), model };
}
