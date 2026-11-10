import { describe, expect, it } from "vitest";
import { buildChatMessages, buildSystemPrompt, conversationTitleFrom, selectHistory } from "./context";

const profile = {
  displayName: "Karim",
  fullName: "Karim Diallo",
  headline: "Entrepreneur",
  bio: null,
  timezone: "Europe/Paris",
  locale: "fr",
};

describe("buildSystemPrompt", () => {
  const prompt = buildSystemPrompt(profile, new Date("2026-11-10T09:00:00Z"));

  it("rappelle que le Twin est une IA et ne doit rien inventer", () => {
    expect(prompt).toMatch(/Tu ne prétends jamais être l'utilisateur/);
    expect(prompt).toMatch(/n'inventes jamais/);
  });

  it("inclut uniquement ce que l'utilisateur a déclaré", () => {
    expect(prompt).toContain("Nom complet : Karim Diallo");
    expect(prompt).not.toContain("Présentation");
  });

  it("donne la date dans le fuseau de l'utilisateur", () => {
    expect(prompt).toMatch(/10 novembre 2026/);
  });

  it("fonctionne sans profil", () => {
    expect(buildSystemPrompt(null, new Date())).toMatch(/pas encore rempli son profil/);
  });
});

describe("selectHistory", () => {
  const msgs = [
    { role: "user" as const, content: "a".repeat(50) },
    { role: "assistant" as const, content: "b".repeat(50) },
    { role: "user" as const, content: "c".repeat(50) },
  ];

  it("garde les messages les plus récents dans le budget", () => {
    expect(selectHistory(msgs, 100).map((m) => m.content[0])).toEqual(["c"]);
  });

  it("commence toujours par un message de l'utilisateur", () => {
    const selected = selectHistory(msgs, 120);
    expect(selected[0]?.role).toBe("user");
  });

  it("conserve le dernier message même s'il dépasse le budget", () => {
    expect(selectHistory([{ role: "user", content: "x".repeat(500) }], 10)).toHaveLength(1);
  });
});

describe("buildChatMessages", () => {
  it("place les consignes système en premier", () => {
    const messages = buildChatMessages(profile, [{ role: "user", content: "Bonjour" }]);
    expect(messages[0]?.role).toBe("system");
    expect(messages.at(-1)).toEqual({ role: "user", content: "Bonjour" });
  });
});

describe("conversationTitleFrom", () => {
  it("raccourcit les longs messages", () => {
    const title = conversationTitleFrom("Comment préparer le lancement de mon entreprise au Sénégal en 2027 avec un petit budget ?");
    expect(title.length).toBeLessThanOrEqual(60);
    expect(title.endsWith("…")).toBe(true);
  });
});
