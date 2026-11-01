import type { ComponentProps } from "react";
import { cn } from "@/lib/utils/cn";

type Tone = "accent" | "neutral" | "success" | "danger" | "soft";

const tones: Record<Tone, string> = {
  accent: "border-accent/30 bg-accent/10 text-copper",
  neutral: "border-line-strong bg-white/[0.03] text-fg-soft",
  success: "border-success/30 bg-success/10 text-success",
  danger: "border-danger/30 bg-danger/10 text-danger",
  soft: "border-dashed border-line-strong bg-transparent text-muted",
};

export function Badge({ tone = "neutral", className, ...props }: ComponentProps<"span"> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium tracking-wide",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
