import { describe, expect, it } from "vitest";
import { parseServerEnv } from "@/lib/env/schema";
import { getConfigurationStatus } from "./configuration-status";

const byKey = (env: Record<string, string>) =>
  Object.fromEntries(getConfigurationStatus(parseServerEnv(env)).map((s) => [s.key, s]));

describe("getConfigurationStatus", () => {
  it("signale tous les services comme non configurés par défaut", () => {
    const status = byKey({});
    expect(Object.values(status).every((s) => !s.configured)).toBe(true);
    expect(status.supabase?.missing).toEqual([
      "NEXT_PUBLIC_SUPABASE_URL",
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    ]);
  });

  it("détecte Supabase configuré", () => {
    const status = byKey({
      NEXT_PUBLIC_SUPABASE_URL: "https://abc.supabase.co",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_x",
    });
    expect(status.supabase?.configured).toBe(true);
  });

  it("vérifie la clé du fournisseur IA sélectionné", () => {
    const status = byKey({ AI_DEFAULT_PROVIDER: "anthropic", GEMINI_API_KEY: "k" });
    expect(status.ai?.configured).toBe(false);
    expect(status.ai?.missing).toEqual(["ANTHROPIC_API_KEY"]);
    expect(byKey({ GEMINI_API_KEY: "k" }).ai?.missing).toEqual(["GEMINI_CHAT_MODEL"]);
  });

  it("n'expose jamais la valeur des secrets", () => {
    const secret = "super-secret-value";
    const serialized = JSON.stringify(
      getConfigurationStatus(parseServerEnv({ GEMINI_API_KEY: secret, SUPABASE_SECRET_KEY: secret })),
    );
    expect(serialized).not.toContain(secret);
  });
});
