import type { ComponentProps } from "react";
import { useId } from "react";
import { cn } from "@/lib/utils/cn";

const controlClass =
  "w-full rounded-xl border border-line-strong bg-canvas/60 px-3.5 py-2.5 text-sm text-fg placeholder:text-muted/60 " +
  "transition-[border-color,box-shadow] duration-200 outline-none " +
  "focus:border-accent/60 focus:shadow-[0_0_0_3px_rgb(193_138_98/0.15)] " +
  "aria-[invalid=true]:border-danger/60";

interface FieldProps {
  label: string;
  error?: string;
  hint?: string;
}

/** Champ de formulaire accessible : libellé, aide et erreur reliés au contrôle. */
export function Field({ label, error, hint, className, ...props }: FieldProps & ComponentProps<"input">) {
  const id = useId();
  const describedBy = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(" ") || undefined;
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="text-[13px] font-medium text-fg-soft">
        {label}
      </label>
      <input id={id} aria-invalid={error ? true : undefined} aria-describedby={describedBy} className={controlClass} {...props} />
      {hint && !error && (
        <p id={`${id}-hint`} className="text-[12px] text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="text-[12px] text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

export function TextAreaField({ label, error, hint, className, ...props }: FieldProps & ComponentProps<"textarea">) {
  const id = useId();
  const describedBy = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(" ") || undefined;
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="text-[13px] font-medium text-fg-soft">
        {label}
      </label>
      <textarea id={id} aria-invalid={error ? true : undefined} aria-describedby={describedBy} className={cn(controlClass, "min-h-28 resize-y")} {...props} />
      {hint && !error && <p id={`${id}-hint`} className="text-[12px] text-muted">{hint}</p>}
      {error && <p id={`${id}-error`} className="text-[12px] text-danger">{error}</p>}
    </div>
  );
}
