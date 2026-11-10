import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { ChatShell } from "@/components/chat/chat-shell";
import { ChatWorkspace } from "@/components/chat/chat-workspace";
import { ConversationList } from "@/components/chat/conversation-list";
import { Skeleton } from "@/components/ui/skeleton";
import { getChatAvailability } from "@/server/chat/availability";

export const metadata: Metadata = { title: "AI Chat" };

async function NewConversation() {
  await connection();
  const availability = getChatAvailability();
  return <ChatWorkspace key="new" conversationId={null} title={null} initialMessages={[]} ready={availability.ready} />;
}

async function List({ searchParams }: { searchParams: PageProps<"/chat">["searchParams"] }) {
  const { q } = await searchParams;
  return <ConversationList query={typeof q === "string" ? q : undefined} />;
}

export default function ChatPage({ searchParams }: PageProps<"/chat">) {
  return (
    <ChatShell
      list={
        <Suspense fallback={<Skeleton className="h-64" />}>
          <List searchParams={searchParams} />
        </Suspense>
      }
    >
      <Suspense fallback={<Skeleton className="h-full min-h-96" />}>
        <NewConversation />
      </Suspense>
    </ChatShell>
  );
}
