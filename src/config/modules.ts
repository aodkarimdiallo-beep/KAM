import type { LucideIcon } from "lucide-react";
import {
  Bot,
  BrainCircuit,
  Fingerprint,
  FolderKanban,
  LayoutDashboard,
  MessagesSquare,
  Scale,
  Settings,
  Telescope,
} from "lucide-react";

/**
 * Registre des modules de l'application.
 *
 * Source unique de vérité pour la navigation ET pour l'état d'avancement affiché
 * à l'utilisateur : un module n'est marqué « disponible » que lorsqu'il est
 * réellement connecté et testé.
 */

export type ModuleStatus = "available" | "in_progress" | "planned";

/** Étapes du plan de développement (voir docs/ROADMAP.md). */
export const DEVELOPMENT_STAGES = {
  2: "Fondations",
  3: "Authentification et base de données",
  4: "Intelligence artificielle",
  5: "Mémoire",
  6: "Documents, recherche et agents",
  7: "Tests et déploiement",
} as const;

export type DevelopmentStage = keyof typeof DEVELOPMENT_STAGES;

/** Étape de développement en cours — à faire évoluer à chaque livraison. */
export const CURRENT_STAGE: DevelopmentStage = 2;

export interface AppModule {
  id: string;
  href: `/${string}`;
  label: string;
  /** Sous-titre court affiché sous le titre de la page. */
  tagline: string;
  icon: LucideIcon;
  group: "core" | "knowledge" | "action" | "system";
  status: ModuleStatus;
  /** Étape à laquelle le module devient fonctionnel. */
  stage: DevelopmentStage;
  /** Ce que le module permettra de faire — affiché tant qu'il n'est pas livré. */
  capabilities: string[];
}

export const APP_MODULES = [
  {
    id: "dashboard",
    href: "/dashboard",
    label: "Dashboard",
    tagline: "Vue d'ensemble de votre Digital Twin",
    icon: LayoutDashboard,
    group: "core",
    status: "in_progress",
    stage: 3,
    capabilities: [
      "Activité récente de votre Digital Twin",
      "Projets en cours et échéances",
      "État de la mémoire et souvenirs à valider",
      "Statistiques d'usage et de coûts IA",
    ],
  },
  {
    id: "twin",
    href: "/twin",
    label: "My Digital Twin",
    tagline: "Le profil intelligent qui vous représente",
    icon: Fingerprint,
    group: "core",
    status: "planned",
    stage: 3,
    capabilities: [
      "Identité et parcours",
      "Compétences et domaines d'expertise",
      "Personnalité et préférences déclarées",
      "Méthodes de travail et objectifs",
    ],
  },
  {
    id: "chat",
    href: "/chat",
    label: "AI Chat",
    tagline: "Converser avec une IA qui vous connaît",
    icon: MessagesSquare,
    group: "core",
    status: "planned",
    stage: 4,
    capabilities: [
      "Conversations persistantes et historique",
      "Recherche dans les conversations",
      "Réponses contextualisées par vos souvenirs",
      "Affichage des souvenirs et sources utilisés",
      "Pièces jointes",
    ],
  },
  {
    id: "memory",
    href: "/memory",
    label: "My Memory",
    tagline: "Consulter, corriger et valider ce que votre Twin sait de vous",
    icon: BrainCircuit,
    group: "knowledge",
    status: "planned",
    stage: 5,
    capabilities: [
      "Mémoires épisodique, sémantique, procédurale et prospective",
      "Validation et correction des souvenirs",
      "Distinction faits / déclarations / hypothèses / déductions",
      "Détection des doublons et fusion",
      "Export et suppression",
    ],
  },
  {
    id: "projects",
    href: "/projects",
    label: "My Projects",
    tagline: "Vos projets, leurs étapes et leur histoire",
    icon: FolderKanban,
    group: "knowledge",
    status: "planned",
    stage: 5,
    capabilities: [
      "Description, objectifs et étapes",
      "Documents et décisions liés",
      "Historique et progression",
    ],
  },
  {
    id: "decisions",
    href: "/decisions",
    label: "My Decisions",
    tagline: "Le journal de vos décisions importantes",
    icon: Scale,
    group: "knowledge",
    status: "planned",
    stage: 5,
    capabilities: [
      "Décision, date et contexte",
      "Options envisagées et raisons",
      "Résultat connu et enseignements",
    ],
  },
  {
    id: "agents",
    href: "/agents",
    label: "My Agents",
    tagline: "Des agents spécialisés coordonnés par le Master Agent",
    icon: Bot,
    group: "action",
    status: "planned",
    stage: 6,
    capabilities: [
      "Master Agent qui oriente chaque tâche",
      "Agents Research, Business, Developer, Finance, Document, Project Manager",
      "Création d'agents personnalisés",
      "Permissions mémoire et outils par agent",
      "Approbation humaine des actions sensibles",
    ],
  },
  {
    id: "research",
    href: "/research",
    label: "Research",
    tagline: "Recherche documentaire et Internet, sources à l'appui",
    icon: Telescope,
    group: "action",
    status: "planned",
    stage: 6,
    capabilities: [
      "Import de PDF, DOCX, TXT, CSV",
      "Recherche Internet avec citations vérifiables",
      "Comparaison et vérification des sources",
      "Séparation claire mémoire / Internet",
    ],
  },
  {
    id: "settings",
    href: "/settings",
    label: "Settings",
    tagline: "Profil, sécurité, fournisseurs IA et données",
    icon: Settings,
    group: "system",
    status: "in_progress",
    stage: 3,
    capabilities: [
      "Profil et préférences",
      "Sécurité et sessions",
      "Choix du fournisseur IA",
      "Export des données et suppression du compte",
    ],
  },
] as const satisfies readonly AppModule[];

export type AppModuleId = (typeof APP_MODULES)[number]["id"];

export const MODULE_GROUP_LABELS: Record<AppModule["group"], string> = {
  core: "Essentiel",
  knowledge: "Connaissance",
  action: "Action",
  system: "Système",
};

export function getModule(id: AppModuleId): AppModule {
  const appModule = APP_MODULES.find((m) => m.id === id);
  if (!appModule) throw new Error(`Module inconnu : ${id}`);
  return appModule;
}

export function groupModules(modules: readonly AppModule[] = APP_MODULES) {
  return (Object.keys(MODULE_GROUP_LABELS) as AppModule["group"][])
    .map((group) => ({
      group,
      label: MODULE_GROUP_LABELS[group],
      modules: modules.filter((m) => m.group === group),
    }))
    .filter((entry) => entry.modules.length > 0);
}

/** Vrai si `pathname` correspond au module (route exacte ou sous-route). */
export function isModuleActive(href: string, pathname: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}
