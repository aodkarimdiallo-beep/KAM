import type { TokenUsage } from "./types";

export interface ModelPricing {
  inputUsdPerMillion: number;
  outputUsdPerMillion: number;
}

/**
 * Coût estimé d'un appel. Sans tarif configuré, renvoie 0 et `estimated: false`
 * plutôt qu'un chiffre inventé.
 */
export function estimateCostUsd(usage: TokenUsage, pricing: ModelPricing | null): { usd: number; estimated: boolean } {
  if (!pricing) return { usd: 0, estimated: false };
  const usd =
    (usage.inputTokens * pricing.inputUsdPerMillion + usage.outputTokens * pricing.outputUsdPerMillion) / 1_000_000;
  return { usd: Math.round(usd * 1e6) / 1e6, estimated: true };
}
