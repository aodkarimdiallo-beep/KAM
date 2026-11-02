"use server";

import { redirect } from "next/navigation";
import { AFTER_LOGIN_PATH, LOGIN_PATH, safeRedirectPath } from "@/config/routes";
import {
  fieldErrors,
  magicLinkSchema,
  signInSchema,
  signUpSchema,
  type FormState,
} from "@/domain/auth/schemas";
import { ConfigurationError } from "@/lib/env/schema";
import { createSupabaseServerClient } from "@/server/supabase/server";
import { authErrorMessage, isServiceUnavailable } from "./errors";
import { authCallbackUrl } from "./redirect-url";

const NOT_CONFIGURED: FormState = {
  status: "error",
  message: "Le service d'authentification n'est pas encore configuré (Supabase).",
};

const UNREACHABLE: FormState = {
  status: "error",
  message: "Le service d'authentification est injoignable. Réessayez dans un instant.",
};

function text(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

async function client() {
  try {
    return await createSupabaseServerClient();
  } catch (error) {
    if (error instanceof ConfigurationError) return null;
    throw error;
  }
}

/** Journalise un événement sensible ; un échec de journalisation ne bloque pas l'utilisateur. */
async function audit(supabase: NonNullable<Awaited<ReturnType<typeof client>>>, action: string) {
  const { error } = await supabase.rpc("record_audit_event", { p_action: action });
  if (error) console.error(`[audit] ${action} non journalisé : ${error.message}`);
}

export async function signInWithPassword(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = signInSchema.safeParse({ email: text(formData, "email"), password: text(formData, "password") });
  const values = { email: text(formData, "email") };
  if (!parsed.success) return { status: "error", fieldErrors: fieldErrors(parsed.error), values };

  const supabase = await client();
  if (!supabase) return NOT_CONFIGURED;

  try {
    const { error } = await supabase.auth.signInWithPassword(parsed.data);
    if (error && isServiceUnavailable(error)) return { ...UNREACHABLE, values };
    if (error) return { status: "error", message: authErrorMessage(error.code), values };
  } catch {
    return { ...UNREACHABLE, values };
  }
  await audit(supabase, "auth.sign_in");
  redirect(safeRedirectPath(text(formData, "next")));
}

export async function sendMagicLink(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = magicLinkSchema.safeParse({ email: text(formData, "email") });
  const values = { email: text(formData, "email") };
  if (!parsed.success) return { status: "error", fieldErrors: fieldErrors(parsed.error), values };

  const supabase = await client();
  if (!supabase) return NOT_CONFIGURED;

  try {
    const { error } = await supabase.auth.signInWithOtp({
      email: parsed.data.email,
      options: {
        // Pas de création de compte par lien magique : l'inscription passe par /signup.
        shouldCreateUser: false,
        emailRedirectTo: await authCallbackUrl(safeRedirectPath(text(formData, "next"))),
      },
    });
    if (error && isServiceUnavailable(error)) return { ...UNREACHABLE, values };
    // Message identique que le compte existe ou non (anti-énumération), sauf limite de débit.
    if (error && (error.code === "over_email_send_rate_limit" || error.code === "over_request_rate_limit")) {
      return { status: "error", message: authErrorMessage(error.code), values };
    }
  } catch {
    return { ...UNREACHABLE, values };
  }
  return {
    status: "success",
    message: "Si un compte existe pour cette adresse, un lien de connexion vient d'être envoyé. Pensez à vérifier vos spams.",
    values,
  };
}

export async function signUp(_prev: FormState, formData: FormData): Promise<FormState> {
  const raw = {
    displayName: text(formData, "displayName"),
    email: text(formData, "email"),
    password: text(formData, "password"),
  };
  const values = { displayName: raw.displayName, email: raw.email };
  const parsed = signUpSchema.safeParse(raw);
  if (!parsed.success) return { status: "error", fieldErrors: fieldErrors(parsed.error), values };

  const supabase = await client();
  if (!supabase) return NOT_CONFIGURED;

  let sessionOpened = false;
  try {
    const { data, error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        data: { display_name: parsed.data.displayName },
        emailRedirectTo: await authCallbackUrl(AFTER_LOGIN_PATH),
      },
    });
    if (error && isServiceUnavailable(error)) return { ...UNREACHABLE, values };
    if (error) return { status: "error", message: authErrorMessage(error.code), values };
    // Confirmation d'e-mail désactivée dans Supabase : la session est ouverte immédiatement.
    sessionOpened = Boolean(data.session);
  } catch {
    return { ...UNREACHABLE, values };
  }
  if (sessionOpened) {
    await audit(supabase, "auth.sign_up");
    redirect(AFTER_LOGIN_PATH);
  }
  return {
    status: "success",
    message: "Presque terminé : ouvrez l'e-mail de confirmation que nous venons d'envoyer pour activer votre compte.",
    values,
  };
}

export async function signOut(): Promise<void> {
  const supabase = await client();
  if (supabase) {
    await audit(supabase, "auth.sign_out");
    await supabase.auth.signOut();
  }
  redirect(LOGIN_PATH);
}
