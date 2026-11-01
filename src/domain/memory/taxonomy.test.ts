import { describe, expect, it } from "vitest";
import { EPISTEMIC_STATUSES, MEMORY_CATEGORIES, MEMORY_CATEGORY_INFO, canAssignStatus } from "./taxonomy";

describe("taxonomie mémoire", () => {
  it("documente chaque catégorie", () => {
    for (const c of MEMORY_CATEGORIES) expect(MEMORY_CATEGORY_INFO[c].label).toBeTruthy();
  });

  it("interdit au système de produire un fait confirmé", () => {
    expect(canAssignStatus("confirmed_fact", "system")).toBe(false);
    expect(canAssignStatus("confirmed_fact", "user")).toBe(true);
  });

  it("autorise le système à produire tous les autres statuts", () => {
    for (const s of EPISTEMIC_STATUSES.filter((s) => s !== "confirmed_fact")) {
      expect(canAssignStatus(s, "system")).toBe(true);
    }
  });
});
