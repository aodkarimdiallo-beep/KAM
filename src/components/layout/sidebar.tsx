import { Brand } from "./brand";
import { NavLinks } from "./nav-links";
import { SidebarFooter } from "./sidebar-footer";

export function Sidebar() {
  return (
    <aside className="sticky top-0 hidden h-dvh w-68 shrink-0 flex-col border-r border-line bg-ink-950/60 px-4 py-6 backdrop-blur-xl lg:flex">
      <Brand className="px-2" />
      <div className="mt-10 flex-1 overflow-y-auto pr-1">
        <NavLinks />
      </div>
      <SidebarFooter />
    </aside>
  );
}
