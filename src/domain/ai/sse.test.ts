import { describe, expect, it } from "vitest";
import { readSseData } from "./sse";

function streamOf(...chunks: string[]) {
  const encoder = new TextEncoder();
  return new ReadableStream<Uint8Array>({
    start(controller) {
      for (const chunk of chunks) controller.enqueue(encoder.encode(chunk));
      controller.close();
    },
  });
}

async function collect(stream: ReadableStream<Uint8Array>) {
  const out: string[] = [];
  for await (const data of readSseData(stream)) out.push(data);
  return out;
}

describe("readSseData", () => {
  it("lit des événements découpés n'importe où entre les paquets réseau", async () => {
    const out = await collect(streamOf('data: {"a":', '1}\n\nda', 'ta: {"b":2}\n\ndata: [DONE]\n\n'));
    expect(out).toEqual(['{"a":1}', '{"b":2}', "[DONE]"]);
  });

  it("gère les fins de ligne Windows et les commentaires", async () => {
    const out = await collect(streamOf(': ping\r\n\r\ndata: x\r\n\r\n'));
    expect(out).toEqual(["x"]);
  });

  it("restitue le dernier événement même sans ligne vide finale", async () => {
    expect(await collect(streamOf("data: fin"))).toEqual(["fin"]);
  });
});
