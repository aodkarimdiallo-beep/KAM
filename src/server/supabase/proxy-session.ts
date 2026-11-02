import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { AFTER_LOGIN_PATH, LOGIN_PATH, isGuestOnlyPath, isPublicPath } from "@/config/routes";
import { getPublicEnv } from "@/lib/env/public";

/**
 * Exécuté par le proxy avant chaque requête :
 * 1. rafraîchit la session Supabase (cookies) ;
 * 2. bloque l'accès aux routes privées sans session (redirection ou 401 pour l'API) ;
 * 3. renvoie un utilisateur déjà connecté hors des pages de connexion.
 *
 * Note : pas d'import `server-only` ici, le proxy n'est pas un Server Component.
 */
export async function updateSession(request: NextRequest): Promise<NextResponse> {
  const { NEXT_PUBLIC_SUPABASE_URL: url, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: key } = getPublicEnv();

  // Supabase non configuré : aucune donnée personnelle ne peut exister, l'interface
  // reste visible pour indiquer ce qu'il faut configurer.
  if (!url || !key) return NextResponse.next({ request });

  let response = NextResponse.next({ request });
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet, headers) => {
        for (const { name, value } of cookiesToSet) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) response.cookies.set(name, value, options);
        for (const [name, value] of Object.entries(headers ?? {})) response.headers.set(name, value);
      },
    },
  });

  // getClaims() vérifie la signature du JWT. Toute erreur = pas de session (échec fermé).
  let authenticated = false;
  try {
    const { data } = await supabase.auth.getClaims();
    authenticated = Boolean(data?.claims?.sub);
  } catch {
    authenticated = false;
  }

  const { pathname, search } = request.nextUrl;

  if (authenticated && isGuestOnlyPath(pathname)) {
    return redirectKeepingCookies(request, response, AFTER_LOGIN_PATH);
  }

  if (!authenticated && !isPublicPath(pathname)) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Authentification requise" }, { status: 401 });
    }
    const target = new URL(LOGIN_PATH, request.url);
    if (pathname !== "/") target.searchParams.set("next", `${pathname}${search}`);
    return redirectKeepingCookies(request, response, target);
  }

  return response;
}

/** Une redirection doit transporter les cookies de session éventuellement rafraîchis. */
function redirectKeepingCookies(request: NextRequest, from: NextResponse, to: string | URL): NextResponse {
  const redirect = NextResponse.redirect(typeof to === "string" ? new URL(to, request.url) : to);
  for (const cookie of from.cookies.getAll()) redirect.cookies.set(cookie);
  redirect.headers.set("Cache-Control", "private, no-store");
  return redirect;
}
