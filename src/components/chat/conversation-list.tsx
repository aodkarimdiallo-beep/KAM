import Link from "next/link";
import { MessageSquarePlus, Search } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { getCurrentUser } from "@/server/auth/session";
import { listConversations } from "@/server/chat/repository";

function formatDate(iso: string | null) {
  if (!iso) return "";
  return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short" }).format(new Date(iso));
}

/** Liste des conversations + recherche (titres et contenu des messages). */
export async function ConversationList({ activeId, query }: { activeId?: string; query?: string }) {
  const user = await getCurrentUser();
  const conversations = user ? await listConversations(query) : [];

  return (
    <div className="flex h-full flex-col gap-4">
      <Link
        href="/chat"
        className="flex items-center justify-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-2.5 text-[13px] font-medium text-copper transition-colors hover:bg-accent/15"
      >
        <MessageSquarePlus className="size-4" strokeWidth={1.6} aria-hidden />
        Nouvelle conversation
      </Link>

      <form action="/chat" role="search" className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted" aria-hidden />
        <label htmlFor="chat-search" className="sr-only">
          Rechercher dans les conversations
        </label>
        <input
          id="chat-search"
          name="q"
          defaultValue={query}
          placeholder="Rechercher…"
          className="w-full rounded-full border border-line bg-canvas/60 py-2 pl-8 pr-3 text-[13px] text-fg placeholder:text-muted/60 outline-none focus:border-accent/50"
        />
      </form>

      <nav aria-label="Conversations" className="-mx-1 flex-1 overflow-y-auto px-1">
        {conversations.length === 0 ? (
          <p className="px-2 py-6 text-center text-[12.5px] text-muted">
            {query ? "Aucun résultat." : "Aucune conversation pour l'instant."}
          </p>
        ) : (
          <ul className="flex flex-col gap-0.5">
            {conversations.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/chat/${c.id}`}
                  aria-current={c.id === activeId ? "page" : undefined}
                  className={cn(
                    "flex items-baseline justify-between gap-3 rounded-xl px-3 py-2.5 text-[13px] transition-colors",
                    c.id === activeId ? "bg-umber-700/60 text-fg" : "text-muted hover:bg-white/[0.03] hover:text-fg-soft",
                  )}
                >
                  <span className="truncate">{c.title ?? "Sans titre"}</span>
                  <span className="shrink-0 text-[11px] text-muted/70">{formatDate(c.last_message_at ?? c.created_at)}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </nav>
    </div>
  );
}
