import { LogOut } from "lucide-react";
import { getCurrentUser } from "@/server/auth/session";
import { signOut } from "@/server/auth/actions";

/** Utilisateur connecté + déconnexion, en bas de la navigation. */
export async function UserMenu() {
  const user = await getCurrentUser();
  if (!user) return null;
  const initial = (user.email ?? "?").charAt(0).toUpperCase();

  return (
    <div className="flex items-center gap-3 rounded-xl border border-line bg-canvas/50 p-2.5">
      <span aria-hidden className="grid size-8 shrink-0 place-items-center rounded-full bg-umber-700 text-[13px] font-medium text-sand">
        {initial}
      </span>
      <span className="min-w-0 flex-1 truncate text-[12.5px] text-fg-soft" title={user.email ?? undefined}>
        {user.email}
      </span>
      <form action={signOut}>
        <button
          type="submit"
          className="grid size-8 place-items-center rounded-full text-muted transition-colors hover:bg-white/[0.05] hover:text-fg"
        >
          <LogOut className="size-4" strokeWidth={1.6} aria-hidden />
          <span className="sr-only">Se déconnecter</span>
        </button>
      </form>
    </div>
  );
}
