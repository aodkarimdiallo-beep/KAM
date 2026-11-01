import type { ComponentProps } from "react";
import { cn } from "@/lib/utils/cn";

interface CardProps extends ComponentProps<"div"> {
  /** Met en valeur la carte (bordure et halo bronze discrets). */
  highlight?: boolean;
  interactive?: boolean;
}

export function Card({ highlight, interactive, className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "relative rounded-(--radius-card) border border-line bg-surface/80 shadow-(--shadow-card) backdrop-blur-sm",
        highlight && "border-accent/25 bg-gradient-to-br from-umber-900/70 via-surface/90 to-surface",
        interactive &&
          "transition-[border-color,transform,background-color] duration-300 ease-(--ease-soft) hover:-translate-y-0.5 hover:border-line-strong",
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("flex items-start justify-between gap-4 p-5 pb-0 sm:p-6 sm:pb-0", className)} {...props} />;
}

export function CardTitle({ className, ...props }: ComponentProps<"h3">) {
  return <h3 className={cn("text-[15px] font-medium tracking-tight text-fg", className)} {...props} />;
}

export function CardDescription({ className, ...props }: ComponentProps<"p">) {
  return <p className={cn("mt-1 text-sm leading-relaxed text-muted", className)} {...props} />;
}

export function CardBody({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("p-5 sm:p-6", className)} {...props} />;
}
