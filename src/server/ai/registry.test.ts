import { describe, expect, it } from "vitest";
import { ConfigurationError, parseServerEnv } from "@/lib/env/schema";
import { getChatModel } from "./registry";

describe("getChatModel", () => {
  it("construit Gemini quand la clé et le modèle sont présents", () => {
    const { provider, model } = getChatModel(parseServerEnv({ GEMINI_API_KEY: "k", GEMINI_CHAT_MODEL: "gemini-x" }));
    expect(provider.id).toBe("gemini");
    expect(model).toBe("gemini-x");
  });

  it("liste précisément les variables manquantes", () => {
    try {
      getChatModel(parseServerEnv({ GEMINI_API_KEY: "k" }));
      expect.unreachable();
    } catch (error) {
      expect(error).toBeInstanceOf(ConfigurationError);
      expect((error as ConfigurationError).missing).toEqual(["GEMINI_CHAT_MODEL"]);
    }
  });

  it("bascule sur OpenAI par simple configuration", () => {
    const env = parseServerEnv({ AI_DEFAULT_PROVIDER: "openai", OPENAI_API_KEY: "k", OPENAI_CHAT_MODEL: "gpt-x" });
    expect(getChatModel(env).provider.id).toBe("openai");
  });
});
