import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-medium whitespace-nowrap " +
  "transition-[background-color,border-color,color,box-shadow,transform] duration-200 ease-(--ease-soft) " +
  "active:translate-y-px disabled:pointer-events-none disabled:opacity-45";

const variants: Record<Variant, string> = {
  primary:
    "bg-gradient-to-b from-copper to-bronze text-accent-fg shadow-[0_8px_20px_-10px_rgb(193_138_98/0.6)] hover:from-sand hover:to-copper",
  secondary: "border border-line-strong bg-surface-raised text-fg hover:border-accent/50 hover:bg-umber-900",
  ghost: "text-muted hover:bg-white/[0.04] hover:text-fg",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3.5 text-[13px]",
  md: "h-10 px-5 text-sm",
};

interface StyleProps {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
}

export function buttonClassName({ variant = "primary", size = "md" }: StyleProps = {}, className?: string) {
  return cn(base, variants[variant], sizes[size], className);
}

export function Button({
  variant,
  size,
  icon,
  className,
  children,
  type = "button",
  ...props
}: StyleProps & ComponentProps<"button">) {
  return (
    <button type={type} className={buttonClassName({ variant, size }, className)} {...props}>
      {icon}
      {children}
    </button>
  );
}

export function ButtonLink({
  variant,
  size,
  icon,
  className,
  children,
  ...props
}: StyleProps & ComponentProps<typeof Link>) {
  return (
    <Link className={buttonClassName({ variant, size }, className)} {...props}>
      {icon}
      {children}
    </Link>
  );
}
