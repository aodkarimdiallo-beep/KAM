import { Brand } from "@/components/layout/brand";

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-dvh flex-col px-4 py-6 sm:px-8">
      <header>
        <Brand />
      </header>
      <main className="flex flex-1 items-center justify-center py-10">{children}</main>
      <footer className="text-center text-[12px] text-muted">
        Digital Twin est une intelligence artificielle. Elle modélise votre façon de penser ; elle ne prétend jamais être vous.
      </footer>
    </div>
  );
}
