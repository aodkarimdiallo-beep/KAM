import { z } from "zod";

/** Requête envoyée par l'interface au serveur. */
export const chatRequestSchema = z.object({
  conversationId: z.uuid().optional(),
  message: z.string().trim().min(1, "Message vide.").max(8000, "Message trop long (8 000 caractères maximum)."),
});

export type ChatRequestBody = z.infer<typeof chatRequestSchema>;

/**
 * Événements renvoyés en streaming, un objet JSON par ligne (NDJSON).
 * Partagé par le serveur et l'interface.
 */
export type ChatServerEvent =
  | { type: "conversation"; conversationId: string; title: string }
  | { type: "text"; text: string }
  | { type: "done"; messageId: string; model: string; inputTokens: number; outputTokens: number }
  | { type: "error"; message: string };

export function encodeEvent(event: ChatServerEvent): string {
  return `${JSON.stringify(event)}\n`;
}

/** Découpe un flux NDJSON en événements (utilisé côté navigateur). */
export async function* decodeEvents(stream: ReadableStream<Uint8Array>): AsyncGenerator<ChatServerEvent> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  try {
    while (true) {
      const { value, done } = await reader.read();
      buffer += decoder.decode(value, { stream: !done });
      let newline = buffer.indexOf("\n");
      while (newline !== -1) {
        const line = buffer.slice(0, newline).trim();
        buffer = buffer.slice(newline + 1);
        if (line) yield JSON.parse(line) as ChatServerEvent;
        newline = buffer.indexOf("\n");
      }
      if (done) break;
    }
    if (buffer.trim()) yield JSON.parse(buffer) as ChatServerEvent;
  } finally {
    reader.releaseLock();
  }
}
