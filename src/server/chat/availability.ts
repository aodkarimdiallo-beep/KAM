import "server-only";
import { ConfigurationError } from "@/lib/env/schema";
import { getServerEnv } from "@/lib/env/server";
import { getChatModel } from "@/server/ai/registry";

/** Indique si l'IA est utilisable, et sinon quelles variables manquent (jamais leurs valeurs). */
export function getChatAvailability(): { ready: true; model: string } | { ready: false; missing: string[] } {
  try {
    return { ready: true, model: getChatModel(getServerEnv()).model };
  } catch (error) {
    if (error instanceof ConfigurationError) return { ready: false, missing: [...error.missing] };
    throw error;
  }
}
