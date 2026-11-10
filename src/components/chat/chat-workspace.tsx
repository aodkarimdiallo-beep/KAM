"use client";

import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { ArrowUp, Square } from "lucide-react";
import { BrandMark } from "@/components/layout/brand";
import { decodeEvents } from "@/domain/chat/protocol";
import { cn } from "@/lib/utils/cn";
import { refreshConversations } from "@/server/chat/actions";

export interface WorkspaceMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  model?: string | null;
  error?: string;
  streaming?: boolean;
}

const SUGGESTIONS = [
  "Aide-moi à clarifier mes objectifs pour les 12 prochains mois.",
  "Je dois prendre une décision importante : aide-moi à structurer les options.",
  "Pose-moi des questions pour mieux comprendre mon parcours.",
];

export function ChatWorkspace({
  conversationId: initialConversationId,
  title,
  initialMessages,
  ready,
}: {
  conversationId: string | null;
  title: string | null;
  initialMessages: WorkspaceMessage[];
  ready: boolean;
}) {
  const [conversationId, setConversationId] = useState(initialConversationId);
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  function patchLast(update: (m: WorkspaceMessage) => WorkspaceMessage) {
    setMessages((prev) => prev.map((m, i) => (i === prev.length - 1 ? update(m) : m)));
  }

  async function send(text: string) {
    const content = text.trim();
    if (!content || busy || !ready) return;
    setInput("");
    setBusy(true);
    const controller = new AbortController();
    abortRef.current = controller;
    setMessages((prev) => [
      ...prev,
      { id: `local-user-${Date.now()}`, role: "user", content },
      { id: `local-assistant-${Date.now()}`, role: "assistant", content: "", streaming: true },
    ]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: content, ...(conversationId && { conversationId }) }),
        signal: controller.signal,
      });
      if (!response.ok || !response.body) {
        const body = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error ?? "La réponse n'a pas pu être obtenue.");
      }
      for await (const event of decodeEvents(response.body)) {
        if (event.type === "conversation") {
          if (!conversationId) {
            setConversationId(event.conversationId);
            window.history.replaceState(null, "", `/chat/${event.conversationId}`);
          }
        } else if (event.type === "text") {
          patchLast((m) => ({ ...m, content: m.content + event.text }));
        } else if (event.type === "done") {
          patchLast((m) => ({ ...m, id: event.messageId || m.id, model: event.model, streaming: false }));
        } else if (event.type === "error") {
          patchLast((m) => ({ ...m, streaming: false, error: event.message }));
        }
      }
    } catch (error) {
      const aborted = controller.signal.aborted;
      patchLast((m) => ({
        ...m,
        streaming: false,
        error: aborted ? "Réponse interrompue." : (error as Error).message,
      }));
    } finally {
      setBusy(false);
      abortRef.current = null;
      patchLast((m) => ({ ...m, streaming: false }));
      void refreshConversations();
      textareaRef.current?.focus();
    }
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    void send(input);
  }

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      void send(input);
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="flex items-center justify-between gap-4 border-b border-line pb-4">
        <h1 className="truncate font-display text-2xl text-fg sm:text-3xl">{title ?? "Nouvelle conversation"}</h1>
      </header>

      <div className="flex-1 overflow-y-auto py-6" aria-live="polite" aria-busy={busy}>
        {messages.length === 0 ? (
          <div className="mx-auto flex max-w-xl flex-col items-center py-10 text-center">
            <BrandMark className="size-11" />
            <h2 className="mt-5 font-display text-3xl text-fg">De quoi voulez-vous parler ?</h2>
            <p className="mt-2 text-sm text-muted">
              Votre Twin s&apos;appuie sur votre profil. La mémoire à long terme arrivera à l&apos;étape suivante.
            </p>
            {ready && (
              <div className="mt-8 grid w-full gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => void send(s)}
                    className="rounded-xl border border-line bg-surface/70 px-4 py-3 text-left text-[13.5px] text-fg-soft transition-colors hover:border-accent/40 hover:text-fg"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <ol className="mx-auto flex max-w-3xl flex-col gap-6">
            {messages.map((m) => (
              <li key={m.id} className={cn("flex gap-3", m.role === "user" && "justify-end")}>
                {m.role === "assistant" && <BrandMark className="mt-0.5 size-7 shrink-0" />}
                <div className={cn("min-w-0 max-w-[85%]", m.role === "user" && "text-right")}>
                  <p className="sr-only">{m.role === "user" ? "Vous :" : "Digital Twin :"}</p>
                  <div
                    className={cn(
                      "whitespace-pre-wrap break-words text-[14.5px] leading-relaxed",
                      m.role === "user"
                        ? "inline-block rounded-2xl rounded-tr-md bg-umber-700/70 px-4 py-2.5 text-left text-fg"
                        : "text-fg-soft",
                    )}
                  >
                    {m.content}
                    {m.streaming && !m.content && <span className="text-muted">Réflexion…</span>}
                    {m.streaming && m.content && (
                      <span className="ml-0.5 inline-block h-4 w-1.5 animate-pulse bg-copper align-middle" aria-hidden />
                    )}
                  </div>
                  {m.error && (
                    <p role="alert" className="mt-2 text-[12.5px] text-danger">
                      {m.error}
                    </p>
                  )}
                  {m.role === "assistant" && !m.streaming && m.model && (
                    <p className="mt-2 text-[11px] text-muted/70">
                      {m.model} · réponse basée sur votre profil, sans souvenirs (mémoire : étape 5)
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        )}
        <div ref={endRef} />
      </div>

      {!ready ? (
        <p role="status" className="rounded-xl border border-dashed border-line-strong px-4 py-3 text-center text-[13px] text-muted">
          L&apos;intelligence artificielle n&apos;est pas encore configurée. Voir Settings → Services connectés.
        </p>
      ) : (
        <form onSubmit={onSubmit} className="mx-auto w-full max-w-3xl">
          <div className="flex items-end gap-2 rounded-2xl border border-line-strong bg-surface/90 p-2 focus-within:border-accent/50">
            <label htmlFor="chat-input" className="sr-only">
              Votre message
            </label>
            <textarea
              id="chat-input"
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              rows={1}
              maxLength={8000}
              placeholder="Écrivez à votre Twin…"
              className="max-h-48 min-h-10 flex-1 resize-none bg-transparent px-2 py-2 text-[14.5px] text-fg placeholder:text-muted/60 outline-none [field-sizing:content]"
            />
            {busy ? (
              <button
                type="button"
                onClick={() => abortRef.current?.abort()}
                className="grid size-10 shrink-0 place-items-center rounded-full border border-line-strong text-fg-soft hover:text-fg"
              >
                <Square className="size-3.5 fill-current" aria-hidden />
                <span className="sr-only">Arrêter la réponse</span>
              </button>
            ) : (
              <button
                type="submit"
                disabled={!input.trim()}
                className="grid size-10 shrink-0 place-items-center rounded-full bg-gradient-to-b from-copper to-bronze text-ink-950 disabled:opacity-40"
              >
                <ArrowUp className="size-4" strokeWidth={2.2} aria-hidden />
                <span className="sr-only">Envoyer</span>
              </button>
            )}
          </div>
          <p className="mt-2 text-center text-[11px] text-muted/70">
            Entrée pour envoyer · Maj + Entrée pour aller à la ligne · Votre Twin est une IA et peut se tromper.
          </p>
        </form>
      )}
    </div>
  );
}
