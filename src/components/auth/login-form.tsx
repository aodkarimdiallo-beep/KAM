"use client";

import { useSearchParams } from "next/navigation";
import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { FormMessage } from "@/components/ui/form-message";
import { INITIAL_FORM_STATE, type FormState } from "@/domain/auth/schemas";
import { cn } from "@/lib/utils/cn";
import { sendMagicLink, signInWithPassword } from "@/server/auth/actions";

type Mode = "password" | "magic";

const LINK_ERROR: FormState = {
  status: "error",
  message: "Ce lien de connexion est invalide ou a expiré. Demandez-en un nouveau.",
};

export function LoginForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "";
  const [mode, setMode] = useState<Mode>("password");
  const [passwordState, passwordAction, passwordPending] = useActionState(signInWithPassword, INITIAL_FORM_STATE);
  const [magicState, magicAction, magicPending] = useActionState(sendMagicLink, INITIAL_FORM_STATE);

  const state = mode === "password" ? passwordState : magicState;
  const shownState = state.status === "idle" && searchParams.get("error") === "lien" ? LINK_ERROR : state;
  const pending = mode === "password" ? passwordPending : magicPending;

  return (
    <div className="flex flex-col gap-6">
      <div role="group" aria-label="Méthode de connexion" className="grid grid-cols-2 gap-1 rounded-full border border-line bg-canvas/50 p-1">
        {(
          [
            ["password", "Mot de passe"],
            ["magic", "Lien par e-mail"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            aria-pressed={mode === value}
            onClick={() => setMode(value)}
            className={cn(
              "rounded-full py-2 text-[13px] transition-colors duration-200",
              mode === value ? "bg-umber-700 text-fg" : "text-muted hover:text-fg-soft",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <FormMessage state={shownState} />

      <form action={mode === "password" ? passwordAction : magicAction} className="flex flex-col gap-4" noValidate>
        <input type="hidden" name="next" value={next} />
        <Field
          label="Adresse e-mail"
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          required
          defaultValue={state.values?.email}
          error={state.fieldErrors?.email}
        />
        {mode === "password" ? (
          <Field
            label="Mot de passe"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            error={state.fieldErrors?.password}
          />
        ) : (
          <p className="text-[12.5px] text-muted">Nous vous enverrons un lien sécurisé, valable une seule fois.</p>
        )}
        <Button type="submit" disabled={pending} className="mt-2 w-full">
          {pending ? "Un instant…" : mode === "password" ? "Se connecter" : "Recevoir le lien"}
        </Button>
      </form>
    </div>
  );
}
