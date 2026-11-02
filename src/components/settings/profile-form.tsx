"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Field, TextAreaField } from "@/components/ui/field";
import { FormMessage } from "@/components/ui/form-message";
import { INITIAL_FORM_STATE } from "@/domain/auth/schemas";
import type { Profile } from "@/server/profile/queries";
import { updateMyProfile } from "@/server/profile/actions";

export function ProfileForm({ profile }: { profile: Profile }) {
  const [state, action, pending] = useActionState(updateMyProfile, INITIAL_FORM_STATE);
  const value = (key: keyof Profile) => state.values?.[key] ?? profile[key] ?? "";

  return (
    <form action={action} className="flex flex-col gap-5" noValidate>
      <FormMessage state={state} />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Nom d'usage" name="display_name" maxLength={80} defaultValue={value("display_name")} error={state.fieldErrors?.display_name} />
        <Field label="Nom complet" name="full_name" maxLength={160} defaultValue={value("full_name")} error={state.fieldErrors?.full_name} />
      </div>
      <Field
        label="Titre"
        name="headline"
        maxLength={200}
        placeholder="Ex. Entrepreneur, fondateur de…"
        defaultValue={value("headline")}
        error={state.fieldErrors?.headline}
      />
      <TextAreaField
        label="Présentation"
        name="bio"
        maxLength={4000}
        hint="Quelques lignes sur vous. Votre Twin s'en servira comme point de départ."
        defaultValue={value("bio")}
        error={state.fieldErrors?.bio}
      />
      <Field
        label="Fuseau horaire"
        name="timezone"
        defaultValue={value("timezone")}
        hint="Format IANA, ex. Europe/Paris, Africa/Dakar."
        error={state.fieldErrors?.timezone}
      />
      <div>
        <Button type="submit" disabled={pending}>
          {pending ? "Enregistrement…" : "Enregistrer"}
        </Button>
      </div>
    </form>
  );
}
