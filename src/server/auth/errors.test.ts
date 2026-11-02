import { describe, expect, it } from "vitest";
import { AuthApiError, AuthRetryableFetchError } from "@supabase/supabase-js";
import { authErrorMessage, isServiceUnavailable } from "./errors";

describe("isServiceUnavailable", () => {
  it("reconnaît une panne réseau ou serveur", () => {
    expect(isServiceUnavailable(new AuthRetryableFetchError("fetch failed", 0))).toBe(true);
    expect(isServiceUnavailable(new AuthApiError("boom", 503, "unexpected_failure"))).toBe(true);
  });

  it("ne confond pas une erreur de saisie avec une panne", () => {
    expect(isServiceUnavailable(new AuthApiError("bad", 400, "invalid_credentials"))).toBe(false);
    expect(isServiceUnavailable(new AuthApiError("slow down", 429, "over_request_rate_limit"))).toBe(false);
  });
});

describe("authErrorMessage", () => {
  it("ne révèle pas si le compte existe", () => {
    expect(authErrorMessage("invalid_credentials")).toBe("Adresse e-mail ou mot de passe incorrect.");
  });

  it("utilise un message générique pour les codes inconnus", () => {
    expect(authErrorMessage("user_already_exists")).toMatch(/erreur est survenue/);
    expect(authErrorMessage(undefined, "Autre")).toBe("Autre");
  });
});
