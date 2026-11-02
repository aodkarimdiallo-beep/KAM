import { describe, expect, it } from "vitest";
import { fieldErrors, signInSchema, signUpSchema } from "./schemas";

describe("signUpSchema", () => {
  const valid = { displayName: "Karim", email: "  Karim@Example.com ", password: "motdepasse42" };

  it("accepte une inscription valide et normalise l'e-mail", () => {
    const result = signUpSchema.parse(valid);
    expect(result.email).toBe("karim@example.com");
  });

  it("refuse un mot de passe trop court", () => {
    const result = signUpSchema.safeParse({ ...valid, password: "abc123" });
    expect(result.success).toBe(false);
    if (!result.success) expect(fieldErrors(result.error).password).toMatch(/10 caractères/);
  });

  it("exige lettres et chiffres", () => {
    expect(signUpSchema.safeParse({ ...valid, password: "seulementdeslettres" }).success).toBe(false);
  });

  it("refuse une adresse invalide", () => {
    const result = signUpSchema.safeParse({ ...valid, email: "pas-un-email" });
    expect(result.success).toBe(false);
    if (!result.success) expect(fieldErrors(result.error).email).toBe("Adresse e-mail invalide.");
  });
});

describe("signInSchema", () => {
  it("exige un mot de passe", () => {
    expect(signInSchema.safeParse({ email: "a@b.co", password: "" }).success).toBe(false);
  });
});
