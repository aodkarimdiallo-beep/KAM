import type { ReactNode } from "react";
import { MobileNav } from "./mobile-nav";
import { Sidebar } from "./sidebar";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-copper focus:px-4 focus:py-2 focus:text-ink-950"
      >
        Aller au contenu
      </a>
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <MobileNav />
        <main id="main" className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-8 sm:py-12">
          {children}
        </main>
      </div>
    </div>
  );
}
