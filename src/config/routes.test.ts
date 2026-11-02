import { describe, expect, it } from "vitest";
import { isGuestOnlyPath, isPublicPath, safeRedirectPath } from "./routes";

describe("isPublicPath", () => {
  it("protège l'application par défaut", () => {
    for (const path of ["/", "/dashboard", "/memory", "/settings", "/api/chat", "/nouvelle-page"]) {
      expect(isPublicPath(path)).toBe(false);
    }
  });

  it("laisse passer connexion, inscription, callbacks et sonde", () => {
    for (const path of ["/login", "/signup", "/auth/callback", "/api/health"]) {
      expect(isPublicPath(path)).toBe(true);
    }
  });

  it("ne se laisse pas tromper par un préfixe", () => {
    expect(isPublicPath("/login-admin")).toBe(false);
    expect(isPublicPath("/api/healthcheck-secret")).toBe(false);
    expect(isGuestOnlyPath("/signup/")).toBe(true);
  });
});

describe("safeRedirectPath", () => {
  it("conserve un chemin interne avec ses paramètres", () => {
    expect(safeRedirectPath("/memory?category=semantic")).toBe("/memory?category=semantic");
  });

  it.each([null, "", "dashboard", "//evil.com", "https://evil.com", "/\\evil.com", "/login", "/%5C%5Cevil.com"])(
    "ne quitte jamais le site pour « %s »",
    (candidate) => {
      const base = "https://app.example";
      expect(new URL(safeRedirectPath(candidate), base).origin).toBe(base);
    },
  );

  it("renvoie la valeur par défaut pour une URL externe", () => {
    expect(safeRedirectPath("https://evil.com/x")).toBe("/dashboard");
    expect(safeRedirectPath("//evil.com")).toBe("/dashboard");
  });
});
