# DIGITAL TWIN — Architecture

> Document de référence. À mettre à jour à chaque décision structurante.

## 1. Diagnostic initial (audit du dépôt)

| Élément | Constat |
| --- | --- |
| Dépôt | Vide (aucun commit, aucun fichier) — aucun travail existant à préserver |
| Environnement | Node.js 22, npm 10 disponibles |
| Framework | Next.js **16.4** (App Router) — version récente : `middleware` renommé `proxy`, *Cache Components* activé par défaut |
| Conséquence | Le code doit suivre le modèle Next 16 : coquille statique + données utilisateur streamées derrière `<Suspense>` |

## 2. Principes

1. **Séparation stricte des responsabilités** : UI ↔ services ↔ accès aux données ↔ IA ↔ mémoire ↔ authentification.
2. **Sécurité par défaut** : secrets uniquement côté serveur, Row Level Security sur toute table privée, identité vérifiée côté serveur (jamais d'`user_id` reçu du client).
3. **Indépendance vis-à-vis des fournisseurs** : IA, recherche Internet et embeddings derrière des interfaces.
4. **Honnêteté produit** : aucune fonctionnalité simulée ; l'état de chaque module est déclaré dans `src/config/modules.ts`.
5. **Multi-tenant dès le départ** : chaque ligne appartient à un `user_id`, même si la V1 n'a qu'un utilisateur.

## 3. Vue d'ensemble

```
Navigateur (React, Client Components minimaux)
        │  HTTPS — cookie de session Supabase (httpOnly)
        ▼
Next.js sur Vercel
  ├─ proxy.ts ............ rafraîchissement de session, protection des routes   (étape 3)
  ├─ Server Components ... lecture des données (RLS appliquée)
  ├─ Server Actions ...... mutations validées par Zod
  ├─ Route Handlers ...... streaming du chat, webhooks, santé
  └─ src/server/ ......... services métier (seul endroit qui parle aux API externes)
        ├─ ai/ ........... couche AI Provider (Gemini → OpenAI, Claude…)   (étape 4)
        ├─ memory/ ....... extraction, déduplication, récupération         (étape 5)
        ├─ documents/ .... import, découpage, embeddings                   (étape 6)
        ├─ search/ ....... fournisseur de recherche Internet               (étape 6)
        └─ agents/ ....... Master Agent + Agent Factory                    (étape 6)
        ▼
Supabase
  ├─ Auth ................ comptes et sessions
  ├─ PostgreSQL + RLS .... données isolées par utilisateur
  ├─ pgvector ............ mémoire sémantique (embeddings)
  └─ Storage (privé) ..... documents importés
```

## 4. Arborescence

```
.
├─ docs/                     Architecture, feuille de route
├─ supabase/migrations/      Migrations SQL versionnées (étape 3)
├─ tests/                    Utilitaires de test
└─ src/
   ├─ app/                   Routes Next.js (présentation uniquement)
   │  ├─ (app)/              Espace connecté : dashboard, twin, chat, memory,
   │  │                      projects, decisions, agents, research, settings
   │  ├─ (auth)/             Connexion / inscription                       (étape 3)
   │  └─ api/                Route Handlers (health, chat streaming…)
   ├─ components/
   │  ├─ ui/                 Design system (Button, Card, Badge, PageHeader…)
   │  ├─ layout/             Coquille : barre latérale, navigation mobile
   │  └─ system/             Composants serveur liés à l'état de l'installation
   ├─ config/                Registre des modules (navigation + état d'avancement)
   ├─ domain/                Types et règles métier purs (taxonomie mémoire…)
   ├─ lib/                   Utilitaires partagés client/serveur (env publique, cn…)
   │  └─ supabase/browser.ts Client Supabase navigateur (clé publique uniquement)
   └─ server/                Code exclusivement serveur (`import "server-only"`)
      ├─ supabase/           Clients serveur (RLS) et admin (contourne la RLS)
      └─ system/             État de configuration des services
```

Règle d'import : `app/` → `components/` → `server/` / `domain/` / `lib/`. Le dossier `domain/` ne dépend de rien d'autre.

## 5. Modèle de données (cible étape 3)

Toutes les tables privées portent `user_id uuid not null references auth.users on delete cascade`,
la RLS activée, et une politique `user_id = (select auth.uid())`.

| Domaine | Tables |
| --- | --- |
| Identité | `profiles`, `user_settings` |
| Conversation | `conversations`, `messages` |
| Mémoire | `memories` (catégorie, contenu, statut épistémique, statut de validation, confiance, embedding `vector`), `memory_sources` (liens vers messages / documents), `memory_revisions` (historique des corrections) |
| Documents | `documents` (métadonnées, chemin Storage privé), `document_chunks` (texte + embedding) |
| Projets | `projects`, `project_tasks`, `goals`, `decisions` |
| Agents | `agents`, `agent_tools`, `agent_runs`, `tasks` (dont approbations humaines) |
| Exploitation | `audit_logs`, `usage_events` (tokens et coûts par appel IA) |

La table `users` du cahier des charges correspond à `auth.users`, gérée par Supabase Auth ;
`profiles` la prolonge (relation 1–1).

### Mémoire : statuts

- **Catégorie** : `episodic`, `semantic`, `procedural`, `prospective`.
- **Statut épistémique** : `confirmed_fact`, `user_statement`, `opinion`, `hypothesis`, `ai_inference`, `uncertain`.
- **Validation** : `pending`, `validated`, `corrected`, `rejected`.
- Règle codée dans `src/domain/memory/taxonomy.ts` et testée : le système ne peut jamais produire `confirmed_fact`.
  Une contrainte SQL la doublera à l'étape 3.

## 6. Récupération contextuelle (étapes 4–5)

Recherche hybride côté Postgres (une fonction SQL `match_memories`) :
1. plein texte (`tsvector`) + similarité vectorielle (pgvector, HNSW),
2. filtres : catégorie, projet, dates, statut de validation,
3. score combiné (fusion par rang) pondéré par la confiance,
4. budget de contexte limité (quelques souvenirs pertinents, jamais toute la mémoire).

Chaque réponse enregistre les souvenirs et sources utilisés → affichables dans l'interface.

## 7. Couche AI Provider (étape 4)

```ts
interface AIProvider {
  id: "gemini" | "openai" | "anthropic";
  generate(input: ChatRequest): Promise<ChatResult>;           // réponse complète
  stream(input: ChatRequest): AsyncIterable<ChatChunk>;          // streaming
  embed(texts: string[]): Promise<number[][]>;                   // embeddings
}
```

- Un registre choisit le fournisseur (`AI_DEFAULT_PROVIDER`, puis préférence utilisateur).
- Chaque appel journalise tokens, coût estimé et latence dans `usage_events` → limites d'usage et facturation SaaS.
- Attention : la dimension des embeddings dépend du modèle ; changer de modèle d'embedding impose de recalculer les vecteurs. La colonne stocke donc aussi le modèle utilisé.

## 8. Sécurité

| Exigence | Mise en œuvre |
| --- | --- |
| Secrets | Variables serveur uniquement, validées par Zod (`src/lib/env`), modules `server-only` |
| Isolation | RLS sur chaque table privée ; client serveur agissant au nom de l'utilisateur |
| Client admin | `src/server/supabase/admin.ts`, usage exceptionnel et journalisé |
| Entrées | Validation Zod de toute Server Action / Route Handler ; requêtes paramétrées |
| En-têtes HTTP | `nosniff`, `DENY` (anti-clickjacking), HSTS, Referrer-Policy, Permissions-Policy (`next.config.ts`) |
| Limitation de débit | Compteur par utilisateur en base (étape 4), sans service payant au départ |
| Agents | Permissions minimales par agent ; approbation humaine des actions sensibles |
| Données | Export JSON complet et suppression de compte en cascade |
| Sauvegardes | Sauvegardes quotidiennes Supabase (plan Pro) ; export manuel possible avant |

## 9. Risques techniques identifiés

| Risque | Impact | Mitigation |
| --- | --- | --- |
| Next 16 très récent (Cache Components) | Pièges de rendu/caching | Respect strict du modèle documenté, build vérifié à chaque étape |
| Confidentialité des données envoyées à l'IA | Données personnelles | Niveau payant Gemini (les données du niveau gratuit peuvent servir à l'amélioration des produits Google), minimisation du contexte |
| Hallucinations transformées en « faits » | Mémoire corrompue | Statuts épistémiques, validation humaine, contrainte SQL |
| Coûts IA non maîtrisés | Budget | Journal des tokens, plafonds par utilisateur, modèles économiques par défaut |
| Changement de modèle d'embedding | Vecteurs incompatibles | Modèle stocké avec chaque vecteur, ré-indexation planifiée |
| Projet Supabase gratuit mis en pause après inactivité | Indisponibilité | Plan Pro au moment de l'usage quotidien |
