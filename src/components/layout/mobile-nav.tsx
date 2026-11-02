"use client";

import { Menu, X } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Brand } from "./brand";
import { NavLinks } from "./nav-links";
import { SidebarFooter } from "./sidebar-footer";

/** Barre supérieure + tiroir de navigation pour les écrans < 1024 px. */
export function MobileNav({ account }: { account?: ReactNode }) {
  const [open, setOpen] = useState(false);
  const closeButton = useRef<HTMLButtonElement>(null);
  const openButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    closeButton.current?.focus();
    const trigger = openButton.current;
    const onKeyDown = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
      trigger?.focus();
    };
  }, [open]);

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-canvas/80 px-4 py-3 backdrop-blur-xl lg:hidden">
        <Brand />
        <button
          ref={openButton}
          type="button"
          onClick={() => setOpen(true)}
          aria-expanded={open}
          aria-controls="mobile-navigation"
          className="grid size-10 place-items-center rounded-full border border-line-strong text-fg-soft"
        >
          <Menu className="size-4.5" strokeWidth={1.6} aria-hidden />
          <span className="sr-only">Ouvrir la navigation</span>
        </button>
      </header>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            tabIndex={-1}
            aria-hidden
            className="absolute inset-0 bg-black/60 backdrop-blur-sm motion-safe:animate-fade-up"
            onClick={() => setOpen(false)}
          />
          <div
            id="mobile-navigation"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation"
            className="absolute inset-y-0 left-0 flex w-[min(20rem,86vw)] flex-col border-r border-line bg-ink-900 px-4 py-5 motion-safe:animate-fade-up"
          >
            <div className="flex items-center justify-between">
              <Brand />
              <button
                ref={closeButton}
                type="button"
                onClick={() => setOpen(false)}
                className="grid size-9 place-items-center rounded-full text-muted hover:text-fg"
              >
                <X className="size-4.5" strokeWidth={1.6} aria-hidden />
                <span className="sr-only">Fermer la navigation</span>
              </button>
            </div>
            <div className="mt-8 flex-1 overflow-y-auto">
              <NavLinks onNavigate={() => setOpen(false)} />
            </div>
            <div className="flex flex-col gap-3">
              <SidebarFooter />
              {account}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
