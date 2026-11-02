/**
 * Règles d'accès aux routes, utilisées par le proxy (src/proxy.ts).
 * Par défaut, TOUT est protégé : une nouvelle page est privée sans rien faire.
 */

export const LOGIN_PATH = "/login";
export const SIGNUP_PATH = "/signup";
export const AFTER_LOGIN_PATH = "/dashboard";

/** Pages réservées aux visiteurs non connectés. */
const GUEST_ONLY = [LOGIN_PATH, SIGNUP_PATH];

/** Routes accessibles sans session. */
const PUBLIC_PREFIXES = ["/auth/", "/api/health"];

function matches(pathname: string, route: string) {
  return pathname === route || pathname.startsWith(route.endsWith("/") ? route : `${route}/`);
}

export function isGuestOnlyPath(pathname: string): boolean {
  return GUEST_ONLY.some((route) => matches(pathname, route));
}

export function isPublicPath(pathname: string): boolean {
  return isGuestOnlyPath(pathname) || PUBLIC_PREFIXES.some((route) => matches(pathname, route));
}

/**
 * N'accepte qu'un chemin interne (« /dashboard?x=1 »). Empêche les redirections
 * ouvertes vers un site externe (« //evil.com », « https://… », « /\evil.com »).
 */
export function safeRedirectPath(candidate: string | null | undefined, fallback = AFTER_LOGIN_PATH): string {
  if (!candidate || !candidate.startsWith("/") || candidate.startsWith("//") || candidate.includes("\\")) {
    return fallback;
  }
  try {
    const url = new URL(candidate, "http://internal.invalid");
    if (url.origin !== "http://internal.invalid") return fallback;
    if (isGuestOnlyPath(url.pathname)) return fallback;
    return `${url.pathname}${url.search}`;
  } catch {
    return fallback;
  }
}
