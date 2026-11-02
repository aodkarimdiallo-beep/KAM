import { AlertCircle, CheckCircle2 } from "lucide-react";
import type { FormState } from "@/domain/auth/schemas";
import { cn } from "@/lib/utils/cn";

/** Message global d'un formulaire, annoncé aux lecteurs d'écran. */
export function FormMessage({ state }: { state: FormState }) {
  if (!state.message) return null;
  const success = state.status === "success";
  const Icon = success ? CheckCircle2 : AlertCircle;
  return (
    <div
      role={success ? "status" : "alert"}
      className={cn(
        "flex items-start gap-2.5 rounded-xl border px-3.5 py-3 text-[13px] leading-relaxed",
        success ? "border-success/30 bg-success/10 text-fg-soft" : "border-danger/30 bg-danger/10 text-fg-soft",
      )}
    >
      <Icon className={cn("mt-0.5 size-4 shrink-0", success ? "text-success" : "text-danger")} aria-hidden />
      {state.message}
    </div>
  );
}
