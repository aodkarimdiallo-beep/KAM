import { z } from "zod";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `${max} caractères maximum.`)
    .transform((value) => (value === "" ? null : value));

/** Champs du profil modifiables par l'utilisateur (miroir des GRANT SQL). */
export const profileUpdateSchema = z.object({
  display_name: optionalText(80),
  full_name: optionalText(160),
  headline: optionalText(200),
  bio: optionalText(4000),
  timezone: z
    .string()
    .trim()
    .min(1, "Indiquez un fuseau horaire.")
    .max(64)
    .refine((value) => isValidTimeZone(value), "Fuseau horaire inconnu (ex. Europe/Paris)."),
});

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;

function isValidTimeZone(value: string): boolean {
  try {
    new Intl.DateTimeFormat("fr", { timeZone: value });
    return true;
  } catch {
    return false;
  }
}
