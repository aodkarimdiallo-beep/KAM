import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { LOGIN_PATH, safeRedirectPath } from "@/config/routes";
import { createSupabaseServerClient } from "@/server/supabase/server";

const OTP_TYPES: readonly EmailOtpType[] = ["signup", "magiclink", "recovery", "invite", "email_change", "email"];

/**
 * Point d'arrivée des liens envoyés par e-mail (confirmation d'inscription, lien magique).
 * Gère les deux formats Supabase : `?code=` (PKCE) et `?token_hash=&type=`.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const next = safeRedirectPath(searchParams.get("next"));
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  try {
    const supabase = await createSupabaseServerClient();
    if (code) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) return NextResponse.redirect(new URL(next, request.url));
    } else if (tokenHash && type && OTP_TYPES.includes(type)) {
      const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
      if (!error) return NextResponse.redirect(new URL(next, request.url));
    }
  } catch {
    // Configuration absente ou service injoignable : traité comme un lien invalide.
  }

  const failure = new URL(LOGIN_PATH, request.url);
  failure.searchParams.set("error", "lien");
  return NextResponse.redirect(failure);
}
