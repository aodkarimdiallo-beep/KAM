import { describe, expect, it } from "vitest";
import { APP_MODULES, CURRENT_STAGE, DEVELOPMENT_STAGES, groupModules, isModuleActive, type AppModule } from "./modules";

describe("registre des modules", () => {
  it("contient les neuf sections principales avec des routes uniques", () => {
    expect(APP_MODULES).toHaveLength(9);
    expect(new Set(APP_MODULES.map((m) => m.href)).size).toBe(9);
  });

  it("n'annonce aucun module comme disponible avant que son étape soit atteinte", () => {
    const modules: readonly AppModule[] = APP_MODULES;
    const premature = modules.filter((m) => m.status === "available" && m.stage > CURRENT_STAGE);
    expect(premature).toEqual([]);
  });

  it("rattache chaque module à une étape connue", () => {
    for (const m of APP_MODULES) expect(DEVELOPMENT_STAGES[m.stage]).toBeDefined();
  });

  it("regroupe tous les modules sans en perdre", () => {
    const total = groupModules().reduce((n, g) => n + g.modules.length, 0);
    expect(total).toBe(APP_MODULES.length);
  });
});

describe("isModuleActive", () => {
  it("active la route exacte et ses sous-routes", () => {
    expect(isModuleActive("/chat", "/chat")).toBe(true);
    expect(isModuleActive("/chat", "/chat/123")).toBe(true);
  });

  it("n'active pas une route qui partage seulement un préfixe", () => {
    expect(isModuleActive("/chat", "/chatbot")).toBe(false);
  });
});
