import { describe, expect, it } from "vitest";
import { chatRequestSchema, decodeEvents, encodeEvent, type ChatServerEvent } from "./protocol";

describe("chatRequestSchema", () => {
  it("refuse un message vide ou un identifiant invalide", () => {
    expect(chatRequestSchema.safeParse({ message: "   " }).success).toBe(false);
    expect(chatRequestSchema.safeParse({ message: "ok", conversationId: "pas-un-uuid" }).success).toBe(false);
  });

  it("accepte un message valide", () => {
    expect(chatRequestSchema.parse({ message: " Bonjour " }).message).toBe("Bonjour");
  });
});

describe("encodeEvent / decodeEvents", () => {
  it("fait l'aller-retour même avec des paquets découpés", async () => {
    const events: ChatServerEvent[] = [
      { type: "conversation", conversationId: "c", title: "t" },
      { type: "text", text: "Bonjour\nà vous" },
      { type: "done", messageId: "m", model: "x", inputTokens: 1, outputTokens: 2 },
    ];
    const raw = events.map(encodeEvent).join("");
    const encoder = new TextEncoder();
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        for (let i = 0; i < raw.length; i += 7) controller.enqueue(encoder.encode(raw.slice(i, i + 7)));
        controller.close();
      },
    });
    const out: ChatServerEvent[] = [];
    for await (const e of decodeEvents(stream)) out.push(e);
    expect(out).toEqual(events);
  });
});
