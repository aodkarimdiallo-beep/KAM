import type { ChatMessage } from "@/domain/ai/types";

/** Ce que le Twin sait de l'utilisateur à ce stade (le profil ; la mémoire arrive à l'étape 5). */
export interface TwinProfileContext {
  displayName: string | null;
  fullName: string | null;
  headline: string | null;
  bio: string | null;
  timezone: string;
  locale: string;
}

export interface StoredMessage {
  role: "user" | "assistant";
  content: string;
}

/** Budget de contexte par défaut, en caractères (≈ 4 caractères par jeton). */
export const DEFAULT_HISTORY_CHAR_BUDGET = 24_000;

/**
 * Consignes permanentes du Twin. Points non négociables :
 * transparence (une IA, jamais la personne), honnêteté sur ce qu'il sait, pas d'invention.
 */
export function buildSystemPrompt(profile: TwinProfileContext | null, now: Date): string {
  const name = profile?.displayName ?? profile?.fullName ?? null;
  const date = new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: profile?.timezone ?? "Europe/Paris",
  }).format(now);

  const known = profile
    ? [
        profile.fullName && `- Nom complet : ${profile.fullName}`,
        profile.displayName && `- Se fait appeler : ${profile.displayName}`,
        profile.headline && `- Titre : ${profile.headline}`,
        profile.bio && `- Présentation (écrite par l'utilisateur) : ${profile.bio}`,
      ].filter(Boolean)
    : [];

  return [
    `Tu es DIGITAL TWIN, l'intelligence artificielle personnelle de ${name ?? "l'utilisateur"}.`,
    "Ton rôle : l'aider à réfléchir, organiser ses projets, prendre des décisions et retrouver ses connaissances, en tenant compte de qui il est.",
    "",
    "Règles fondamentales :",
    "- Tu es une IA. Tu ne prétends jamais être l'utilisateur ni une personne humaine.",
    "- Tu distingues clairement ce que l'utilisateur t'a dit, ce que tu en déduis, et tes connaissances générales.",
    "- Tu n'inventes jamais de faits sur l'utilisateur, de sources, de citations ni de résultats.",
    "- Si une information te manque, tu le dis et tu poses une question.",
    "- Tu n'as pas encore accès à une mémoire à long terme ni à Internet : ne prétends pas t'en servir.",
    "- Pour toute décision importante, tu exposes les options, les risques et ce qui reste incertain.",
    "",
    `Langue : réponds dans la langue de l'utilisateur (par défaut : ${profile?.locale === "en" ? "anglais" : "français"}). Style clair, direct et structuré.`,
    `Date et heure actuelles : ${date}.`,
    "",
    known.length > 0
      ? `Ce que l'utilisateur a déclaré dans son profil :\n${known.join("\n")}`
      : "L'utilisateur n'a pas encore rempli son profil.",
  ].join("\n");
}

/**
 * Garde les messages les plus récents dans la limite du budget : on n'envoie jamais
 * tout l'historique (coût et pertinence). Le dernier message est toujours conservé.
 */
export function selectHistory(messages: StoredMessage[], charBudget = DEFAULT_HISTORY_CHAR_BUDGET): StoredMessage[] {
  const selected: StoredMessage[] = [];
  let used = 0;
  for (let i = messages.length - 1; i >= 0; i--) {
    const message = messages[i]!;
    if (selected.length > 0 && used + message.content.length > charBudget) break;
    selected.unshift(message);
    used += message.content.length;
  }
  // Une conversation envoyée au modèle doit commencer par un message de l'utilisateur.
  while (selected.length > 1 && selected[0]!.role !== "user") selected.shift();
  return selected;
}

export function buildChatMessages(
  profile: TwinProfileContext | null,
  history: StoredMessage[],
  now = new Date(),
  charBudget = DEFAULT_HISTORY_CHAR_BUDGET,
): ChatMessage[] {
  return [{ role: "system", content: buildSystemPrompt(profile, now) }, ...selectHistory(history, charBudget)];
}

/** Titre automatique d'une conversation à partir du premier message. */
export function conversationTitleFrom(message: string): string {
  const oneLine = message.replace(/\s+/g, " ").trim();
  return oneLine.length <= 60 ? oneLine : `${oneLine.slice(0, 57).trimEnd()}…`;
}
