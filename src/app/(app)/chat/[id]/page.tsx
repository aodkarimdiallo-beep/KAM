import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ChatShell } from "@/components/chat/chat-shell";
import { ChatWorkspace } from "@/components/chat/chat-workspace";
import { ConversationList } from "@/components/chat/conversation-list";
import { DeleteConversationButton } from "@/components/chat/delete-conversation-button";
import { Skeleton } from "@/components/ui/skeleton";
import { getChatAvailability } from "@/server/chat/availability";
import { getConversation, listMessages } from "@/server/chat/repository";
import { z } from "zod";

export const metadata: Metadata = { title: "AI Chat" };

type Params = PageProps<"/chat/[id]">["params"];

async function Conversation({ params }: { params: Params }) {
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const conversation = await getConversation(id);
  if (!conversation) notFound();
  const messages = await listMessages(id);
  const availability = getChatAvailability();

  return (
    <>
      <ChatWorkspace
        key={id}
        conversationId={id}
        title={conversation.title}
        ready={availability.ready}
        initialMessages={messages
          .filter((m) => m.role === "user" || m.role === "assistant")
          .map((m) => ({ id: m.id, role: m.role as "user" | "assistant", content: m.content, model: m.model }))}
      />
      <DeleteConversationButton conversationId={id} />
    </>
  );
}

async function List({ params }: { params: Params }) {
  const { id } = await params;
  return <ConversationList activeId={id} />;
}

export default function ConversationPage({ params }: PageProps<"/chat/[id]">) {
  return (
    <ChatShell
      list={
        <Suspense fallback={<Skeleton className="h-64" />}>
          <List params={params} />
        </Suspense>
      }
    >
      <Suspense fallback={<Skeleton className="h-full min-h-96" />}>
        <Conversation params={params} />
      </Suspense>
    </ChatShell>
  );
}
