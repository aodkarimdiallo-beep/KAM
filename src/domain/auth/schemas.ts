import { z } from "zod";

/** Règles de validation des formulaires d'authentification (partagées client/serveur). */

export const PASSWORD_MIN_LENGTH = 10;

const email = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, "Indiquez votre adresse e-mail.")
  .max(254, "Adresse e-mail trop longue.")
  .pipe(z.email("Adresse e-mail invalide."));

export const signInSchema = z.object({
  email,
  password: z.string().min(1, "Indiquez votre mot de passe.").max(128),
});

export const magicLinkSchema = z.object({ email });

export const signUpSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(1, "Indiquez comment vous souhaitez être appelé.")
    .max(80, "80 caractères maximum."),
  email,
  password: z
    .string()
    .min(PASSWORD_MIN_LENGTH, `Au moins ${PASSWORD_MIN_LENGTH} caractères.`)
    .max(128, "128 caractères maximum.")
    .refine((value) => /[a-zA-Z]/.test(value) && /[0-9]/.test(value), "Mélangez lettres et chiffres."),
});

export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;

/** Transforme les erreurs Zod en { champ: premier message }. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    errors[key] ??= issue.message;
  }
  return errors;
}

/** État renvoyé par les Server Actions de formulaire. */
export interface FormState {
  status: "idle" | "error" | "success";
  message?: string;
  fieldErrors?: Record<string, string>;
  /** Valeurs à réafficher après une erreur (jamais le mot de passe). */
  values?: Record<string, string>;
}

export const INITIAL_FORM_STATE: FormState = { status: "idle" };
