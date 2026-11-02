"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { FormMessage } from "@/components/ui/form-message";
import { INITIAL_FORM_STATE, PASSWORD_MIN_LENGTH } from "@/domain/auth/schemas";
import { signUp } from "@/server/auth/actions";

export function SignupForm() {
  const [state, action, pending] = useActionState(signUp, INITIAL_FORM_STATE);

  if (state.status === "success") return <FormMessage state={state} />;

  return (
    <form action={action} className="flex flex-col gap-4" noValidate>
      <FormMessage state={state} />
      <Field
        label="Comment souhaitez-vous être appelé ?"
        name="displayName"
        autoComplete="nickname"
        required
        maxLength={80}
        defaultValue={state.values?.displayName}
        error={state.fieldErrors?.displayName}
      />
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
      <Field
        label="Mot de passe"
        name="password"
        type="password"
        autoComplete="new-password"
        required
        minLength={PASSWORD_MIN_LENGTH}
        hint={`Au moins ${PASSWORD_MIN_LENGTH} caractères, avec des lettres et des chiffres.`}
        error={state.fieldErrors?.password}
      />
      <Button type="submit" disabled={pending} className="mt-2 w-full">
        {pending ? "Création du compte…" : "Créer mon Digital Twin"}
      </Button>
      <p className="text-center text-[12px] leading-relaxed text-muted">
        Vos données restent privées et ne sont visibles que par vous.
      </p>
    </form>
  );
}
