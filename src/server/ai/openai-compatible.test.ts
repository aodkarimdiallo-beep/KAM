import { describe, expect, it } from "vitest";
import { AIProviderError, type ChatStreamEvent } from "@/domain/ai/types";
import { OpenAICompatibleProvider, parseChunk } from "./openai-compatible";

function sseResponse(events: unknown[], status = 200) {
  const body = events.map((e) => `data: ${typeof e === "string" ? e : JSON.stringify(e)}\n\n`).join("");
  return new Response(body, { status, headers: { "Content-Type": "text/event-stream" } });
}

async function collect(iterable: AsyncIterable<ChatStreamEvent>) {
  const out: ChatStreamEvent[] = [];
  for await (const e of iterable) out.push(e);
  return out;
}

describe("OpenAICompatibleProvider", () => {
  it("diffuse le texte puis l'usage, et envoie la clé dans l'en-tête", async () => {
    let sentAuth = "";
    let sentBody: Record<string, unknown> = {};
    const provider = new OpenAICompatibleProvider("gemini", {
      baseUrl: "https://example.test/v1",
      apiKey: "cle-test",
      fetchImpl: async (_url, init) => {
        sentAuth = new Headers(init?.headers).get("Authorization") ?? "";
        sentBody = JSON.parse(String(init?.body));
        return sseResponse([
          { choices: [{ delta: { content: "Bon" } }] },
          { choices: [{ delta: { content: "jour" }, finish_reason: "stop" }] },
          { choices: [], usage: { prompt_tokens: 12, completion_tokens: 3 } },
          "[DONE]",
        ]);
      },
    });

    const events = await collect(provider.streamChat({ model: "m", messages: [{ role: "user", content: "salut" }] }));
    expect(events.filter((e) => e.type === "text").map((e) => (e.type === "text" ? e.text : "")).join("")).toBe("Bonjour");
    expect(events).toContainEqual({ type: "usage", usage: { inputTokens: 12, outputTokens: 3 } });
    expect(sentAuth).toBe("Bearer cle-test");
    expect(sentBody).toMatchObject({ model: "m", stream: true, stream_options: { include_usage: true } });
  });

  it.each([
    [401, "auth"],
    [429, "rate_limit"],
    [503, "unavailable"],
    [400, "bad_request"],
  ])("traduit le statut HTTP %i en erreur « %s »", async (status, kind) => {
    const provider = new OpenAICompatibleProvider("gemini", {
      baseUrl: "https://example.test",
      apiKey: "k",
      fetchImpl: async () => new Response("non", { status }),
    });
    await expect(collect(provider.streamChat({ model: "m", messages: [] }))).rejects.toMatchObject({ kind });
  });

  it("signale un fournisseur injoignable", async () => {
    const provider = new OpenAICompatibleProvider("gemini", {
      baseUrl: "https://example.test",
      apiKey: "k",
      fetchImpl: async () => {
        throw new TypeError("fetch failed");
      },
    });
    await expect(collect(provider.streamChat({ model: "m", messages: [] }))).rejects.toMatchObject({ kind: "unavailable" });
  });
});

describe("parseChunk", () => {
  it("bloque une réponse filtrée pour sécurité", () => {
    expect(() => [...parseChunk(JSON.stringify({ choices: [{ delta: {}, finish_reason: "content_filter" }] }))]).toThrow(
      AIProviderError,
    );
  });

  it("ignore les lignes non JSON", () => {
    expect([...parseChunk("keep-alive")]).toEqual([]);
  });
});
