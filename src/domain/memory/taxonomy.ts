/**
 * Taxonomie de la mémoire — partagée par l'interface, les services et (à l'étape 3)
 * reflétée par des types ENUM PostgreSQL.
 */

export const MEMORY_CATEGORIES = ["episodic", "semantic", "procedural", "prospective"] as const;
export type MemoryCategory = (typeof MEMORY_CATEGORIES)[number];

/**
 * Statut épistémique : d'où vient l'information et quel crédit lui accorder.
 * Règle absolue : une `hypothesis` ou une `ai_inference` ne devient jamais un
 * `confirmed_fact` sans validation explicite de l'utilisateur.
 */
export const EPISTEMIC_STATUSES = [
  "confirmed_fact",
  "user_statement",
  "opinion",
  "hypothesis",
  "ai_inference",
  "uncertain",
] as const;
export type EpistemicStatus = (typeof EPISTEMIC_STATUSES)[number];

export const VALIDATION_STATUSES = ["pending", "validated", "corrected", "rejected"] as const;
export type ValidationStatus = (typeof VALIDATION_STATUSES)[number];

export const MEMORY_CATEGORY_INFO: Record<
  MemoryCategory,
  { label: string; question: string; description: string; examples: string[] }
> = {
  episodic: {
    label: "Mémoire épisodique",
    question: "Que s'est-il passé ?",
    description: "Les événements vécus : expériences, conversations marquantes, projets réalisés, décisions prises.",
    examples: ["Lancement d'un projet", "Rencontre professionnelle", "Décision et son contexte"],
  },
  semantic: {
    label: "Mémoire sémantique",
    question: "Que savez-vous ?",
    description: "Les connaissances : compétences, concepts, expertise, informations apprises.",
    examples: ["Compétences techniques", "Domaines d'expertise", "Connaissances métier"],
  },
  procedural: {
    label: "Mémoire procédurale",
    question: "Comment fonctionnez-vous ?",
    description: "Vos façons de faire : méthodes de travail, communication, habitudes, critères de décision.",
    examples: ["Style de communication", "Organisation des tâches", "Critères de choix"],
  },
  prospective: {
    label: "Mémoire prospective",
    question: "Que préparez-vous ?",
    description: "Le futur : objectifs, ambitions, plans, engagements et échéances.",
    examples: ["Objectifs à 3 ans", "Engagements pris", "Échéances à venir"],
  },
};

export const EPISTEMIC_STATUS_INFO: Record<
  EpistemicStatus,
  { label: string; description: string; tone: "solid" | "neutral" | "soft" }
> = {
  confirmed_fact: {
    label: "Fait confirmé",
    description: "Validé explicitement par vous.",
    tone: "solid",
  },
  user_statement: {
    label: "Déclaration",
    description: "Ce que vous avez affirmé, pas encore validé comme fait.",
    tone: "neutral",
  },
  opinion: { label: "Opinion", description: "Un point de vue, pas un fait.", tone: "neutral" },
  hypothesis: {
    label: "Hypothèse",
    description: "Une supposition à vérifier.",
    tone: "soft",
  },
  ai_inference: {
    label: "Déduction de l'IA",
    description: "Inférée par l'IA — à confirmer ou rejeter.",
    tone: "soft",
  },
  uncertain: { label: "Incertain", description: "Information douteuse ou contradictoire.", tone: "soft" },
};

/** Statuts qu'une déduction automatique a le droit de produire (jamais `confirmed_fact`). */
export const MACHINE_ALLOWED_STATUSES: readonly EpistemicStatus[] = [
  "user_statement",
  "opinion",
  "hypothesis",
  "ai_inference",
  "uncertain",
];

/** Un statut ne peut être promu en fait confirmé que par une action humaine. */
export function canAssignStatus(status: EpistemicStatus, actor: "user" | "system"): boolean {
  return actor === "user" || MACHINE_ALLOWED_STATUSES.includes(status);
}
