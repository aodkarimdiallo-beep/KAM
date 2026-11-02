import { describe, expect, it } from "vitest";
import { profileUpdateSchema } from "./schema";

const base = { display_name: "Karim", full_name: "", headline: "", bio: "", timezone: "Europe/Paris" };

describe("profileUpdateSchema", () => {
  it("convertit les champs vides en null", () => {
    const result = profileUpdateSchema.parse(base);
    expect(result.full_name).toBeNull();
    expect(result.display_name).toBe("Karim");
  });

  it("refuse un fuseau horaire inconnu", () => {
    expect(profileUpdateSchema.safeParse({ ...base, timezone: "Mars/Olympus" }).success).toBe(false);
  });

  it("limite la longueur de la biographie", () => {
    expect(profileUpdateSchema.safeParse({ ...base, bio: "x".repeat(4001) }).success).toBe(false);
  });
});
