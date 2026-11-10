"use client";

import { Trash2 } from "lucide-react";
import { deleteConversation } from "@/server/chat/actions";

export function DeleteConversationButton({ conversationId }: { conversationId: string }) {
  return (
    <form
      action={deleteConversation}
      onSubmit={(event) => {
        if (!window.confirm("Supprimer définitivement cette conversation et tous ses messages ?")) event.preventDefault();
      }}
      className="mt-3 text-center"
    >
      <input type="hidden" name="conversationId" value={conversationId} />
      <button type="submit" className="inline-flex items-center gap-1.5 text-[12px] text-muted hover:text-danger">
        <Trash2 className="size-3.5" aria-hidden />
        Supprimer cette conversation
      </button>
    </form>
  );
}
