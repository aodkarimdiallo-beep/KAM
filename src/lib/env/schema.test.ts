import { describe, expect, it } from "vitest";
import { ConfigurationError, parseServerEnv } from "./schema";

describe("parseServerEnv", () => {
  it("accepte un environnement vide et applique les valeurs par défaut", () => {
    const env = parseServerEnv({});
    expect(env.AI_DEFAULT_PROVIDER).toBe("gemini");
    expect(env.GEMINI_API_KEY).toBeUndefined();
  });

  it("traite les chaînes vides comme des valeurs absentes", () => {
    const env = parseServerEnv({ GEMINI_API_KEY: "   ", NEXT_PUBLIC_SUPABASE_URL: "" });
    expect(env.GEMINI_API_KEY).toBeUndefined();
    expect(env.NEXT_PUBLIC_SUPABASE_URL).toBeUndefined();
  });

  it("rejette une URL Supabase mal formée", () => {
    expect(() => parseServerEnv({ NEXT_PUBLIC_SUPABASE_URL: "pas-une-url" })).toThrow(
      ConfigurationError,
    );
  });

  it("rejette un fournisseur IA inconnu", () => {
    expect(() => parseServerEnv({ AI_DEFAULT_PROVIDER: "inconnu" })).toThrow(ConfigurationError);
  });

  it("lit les nombres et rejette les valeurs invalides", () => {
    expect(parseServerEnv({ CHAT_MAX_REQUESTS_PER_MINUTE: "20" }).CHAT_MAX_REQUESTS_PER_MINUTE).toBe(20);
    expect(parseServerEnv({ AI_PRICE_INPUT_USD_PER_MTOK: "" }).AI_PRICE_INPUT_USD_PER_MTOK).toBeUndefined();
    expect(() => parseServerEnv({ CHAT_MAX_REQUESTS_PER_MINUTE: "beaucoup" })).toThrow(ConfigurationError);
    expect(() => parseServerEnv({ AI_PRICE_OUTPUT_USD_PER_MTOK: "-1" })).toThrow(ConfigurationError);
  });
});
