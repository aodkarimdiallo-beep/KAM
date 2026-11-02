# DIGITAL TWIN

Plateforme d'intelligence personnelle : une IA qui apprend à connaître une personne — son parcours,
ses connaissances, ses projets, ses décisions — pour l'assister de façon contextualisée.
Le Twin modélise une façon de penser et de travailler ; il ne prétend jamais être la personne.

> **État actuel : étape 3 (authentification et base de données)** — code livré et testé localement,
> branchement au projet Supabase en cours : voir [`docs/SUPABASE_SETUP.md`](docs/SUPABASE_SETUP.md).
> IA, mémoire et agents arrivent aux étapes 4 à 6 — voir [`docs/ROADMAP.md`](docs/ROADMAP.md).

## Démarrage

Prérequis : Node.js 22 ou plus récent.

```bash
npm install
cp .env.example .env.local   # puis renseignez les valeurs (facultatif à l'étape 2)
npm run dev                  # http://localhost:3000
```

L'application démarre même sans configuration : la page **Settings** indique quelles variables manquent.

## Commandes

| Commande | Rôle |
| --- | --- |
| `npm run dev` | Serveur de développement |
| `npm run build` / `npm start` | Build et serveur de production |
| `npm run lint` | ESLint |
| `npm run typecheck` | Génération des types de routes + TypeScript strict |
| `npm test` | Tests unitaires (Vitest) |
| `npm run check` | Les trois vérifications d'un coup |
| `npm run test:db` | Migrations + 35 tests de sécurité SQL sur un PostgreSQL local jetable (`DATABASE_ADMIN_URL`) |

## Stack

Next.js 16 (App Router, Cache Components) · React 19 · TypeScript strict · Tailwind CSS 4 ·
Supabase (Auth, PostgreSQL, pgvector, Storage, RLS) · Zod · Gemini en premier fournisseur IA, derrière une couche d'abstraction.

## Documentation

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — diagnostic, architecture, arborescence, modèle de données, sécurité, risques.
- [`docs/ROADMAP.md`](docs/ROADMAP.md) — étapes de développement, prérequis, coûts.
- [`docs/SUPABASE_SETUP.md`](docs/SUPABASE_SETUP.md) — brancher la base, pas à pas.
- [`.env.example`](.env.example) — variables d'environnement commentées.

## Règles de sécurité

- Aucun secret dans le code ni dans une variable `NEXT_PUBLIC_*`.
- Tout code qui touche un secret ou une API externe vit dans `src/server/` (protégé par `server-only`).
- Toute table privée a la Row Level Security activée ; l'identité de l'utilisateur est toujours vérifiée côté serveur.
