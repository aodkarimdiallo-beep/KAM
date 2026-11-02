# DIGITAL TWIN — Feuille de route

L'état affiché dans l'application provient de `src/config/modules.ts` (`CURRENT_STAGE`).

| Étape | Contenu | État |
| --- | --- | --- |
| 1 | Audit et planification | ✅ Terminé |
| 2 | Fondations : Next.js, design system, navigation, pages, structure backend, clients Supabase | ✅ Livré |
| 3 | Authentification (inscription, connexion, déconnexion), profil, schéma SQL, migrations, RLS, stockage privé, `proxy.ts` | 🟡 Code livré et testé localement — reste à brancher sur Supabase (voir ci-dessous) |
| 4 | Couche AI Provider, Gemini, chat en streaming, historique, gestion du contexte, journal des coûts, limitation de débit | |
| 5 | Mémoire : extraction, catégorisation, embeddings, recherche hybride, correction et validation, fusion des doublons | |
| 6 | Documents (PDF, DOCX, TXT, CSV), recherche Internet avec sources, agents spécialisés et Agent Factory | |
| 7 | Tests de bout en bout, revue de sécurité, accessibilité, déploiement Vercel | |

## Étape 3 — ce qui a été livré

**Base de données** (`supabase/migrations/`, 4 migrations versionnées) :
- 19 tables : profils, réglages, conversations, messages, documents et extraits, mémoire, sources et
  révisions de souvenirs, projets, tâches de projet, objectifs, décisions, agents, outils, exécutions,
  tâches/approbations, journal d'audit, usage IA.
- Row Level Security sur **toutes** les tables ; le rôle `anon` n'a aucun accès.
- Clés étrangères composites `(id, user_id)` : impossible de rattacher une donnée à l'objet d'un autre utilisateur.
- Garde-fous mémoire en base : le système ne peut pas créer de fait confirmé ; chaque correction est historisée.
- Colonnes sensibles protégées (`role`, `plan`, quotas) ; journal d'audit et usage non falsifiables.
- pgvector (vecteurs 1536 dimensions, index HNSW) et recherche plein texte prêts pour l'étape 5.
- Bucket de stockage privé `documents`, un dossier par utilisateur.

**Application** :
- Inscription, connexion par mot de passe ou lien e-mail, déconnexion, callback des liens e-mail.
- `src/proxy.ts` : rafraîchit la session, protège **toutes** les pages par défaut, 401 sur l'API.
- Protection contre les redirections ouvertes et l'énumération des comptes.
- Settings → Profil modifiable ; menu utilisateur ; checklist du Dashboard reliée à l'état réel.

**Vérifié** :
- 35 tests de sécurité SQL exécutés sur un vrai PostgreSQL 16 + pgvector (`npm run test:db`) ;
- 42 tests unitaires ; lint ; TypeScript ; build de production ;
- navigateur : redirections, erreurs de formulaire, message « service injoignable » (ce test a révélé
  puis permis de corriger un faux message de succès).

**Pas encore vérifié** : le parcours complet avec le vrai projet Supabase (inscription, e-mail,
connexion réelle). L'environnement de développement n'a pas accès à Supabase. Prochaine action :
suivre [`docs/SUPABASE_SETUP.md`](SUPABASE_SETUP.md), puis tester ensemble.

## Étape 2 — ce qui a été livré

- Projet Next.js 16 / React 19 / TypeScript strict / Tailwind CSS 4.
- Design system : jetons de couleur (palette fournie), typographies (Geist + Instrument Serif), composants `Button`, `Card`, `Badge`, `PageHeader`, `SectionTitle`, `Skeleton`, `ModuleStatusBadge`, `ModuleRoadmapCard`.
- Navigation latérale (desktop) et tiroir accessible (mobile : Échap, focus, fermeture à la navigation).
- Les 9 sections. Celles qui ne sont pas encore connectées l'indiquent explicitement, sans faux boutons ni fausses données.
- Dashboard et Settings affichent l'état **réel** de configuration des services (lu à l'exécution, sans jamais exposer de valeur).
- Validation Zod des variables d'environnement ; clients Supabase serveur / navigateur / admin.
- Taxonomie de la mémoire (catégories, statuts épistémiques, règle « jamais de fait confirmé automatique »).
- En-têtes de sécurité HTTP ; sonde `/api/health`.
- 17 tests unitaires (Vitest).


## Coûts à anticiper (ordre de grandeur, à vérifier sur les sites officiels)

| Service | Démarrage | Quand payer | Remarque |
| --- | --- | --- | --- |
| Vercel | Hobby gratuit | Plan Pro (~20 $/mois/membre) dès l'usage commercial | Les conditions Hobby interdisent l'usage commercial |
| Supabase | Gratuit (500 Mo de base, 1 Go de stockage) | Pro (~25 $/mois) pour l'usage quotidien | Projets gratuits mis en pause après une semaine d'inactivité ; sauvegardes quotidiennes en Pro |
| Gemini API | Niveau gratuit limité | Facturation à l'usage (tokens) | **Important** : sur le niveau gratuit, Google peut utiliser les données pour améliorer ses produits — à éviter pour des données personnelles réelles |
| Recherche Internet | Niveaux gratuits (Tavily, Brave Search…) | Au-delà du quota mensuel | Choix du fournisseur à l'étape 6 |
| Nom de domaine | — | ~10–20 €/an | Optionnel |

Usage personnel réaliste au départ : **0 à ~50 $/mois**, essentiellement Supabase Pro + consommation IA.
Aucun service payant n'est intégré sans votre accord préalable.
