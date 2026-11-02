import { isAuthRetryableFetchError, type AuthError } from "@supabase/supabase-js";

/**
 * Vrai si l'échec vient du service (réseau coupé, panne, délai) et non de la
 * demande de l'utilisateur. Dans ce cas, il ne faut JAMAIS afficher un succès.
 */
export function isServiceUnavailable(error: AuthError): boolean {
  return isAuthRetryableFetchError(error) || error.status === undefined || error.status === 0 || error.status >= 500;
}

/**
 * Traduit les erreurs Supabase Auth en messages clairs, sans révéler si un
 * compte existe (protection contre l'énumération des adresses e-mail).
 */
export function authErrorMessage(code: string | undefined, fallback = "Une erreur est survenue. Réessayez."): string {
  switch (code) {
    case "invalid_credentials":
      return "Adresse e-mail ou mot de passe incorrect.";
    case "email_not_confirmed":
      return "Confirmez d'abord votre adresse e-mail grâce au lien reçu.";
    case "weak_password":
      return "Mot de passe trop faible. Choisissez-en un plus long et plus varié.";
    case "over_email_send_rate_limit":
    case "over_request_rate_limit":
      return "Trop de tentatives. Patientez quelques minutes avant de réessayer.";
    case "signup_disabled":
      return "Les inscriptions sont fermées pour le moment.";
    case "otp_disabled":
      return "La connexion par lien e-mail n'est pas activée.";
    default:
      return fallback;
  }
}
