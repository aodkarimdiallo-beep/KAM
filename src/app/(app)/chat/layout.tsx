/**
 * Segment du chat. Ce layout sert de point d'invalidation commun :
 * revalidatePath("/chat", "layout") rafraîchit la liste dans toutes les pages du chat.
 */
export default function ChatLayout({ children }: LayoutProps<"/chat">) {
  return children;
}
