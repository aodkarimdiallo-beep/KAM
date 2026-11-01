# DIGITAL TWIN — Feuille de route

L'état affiché dans l'application provient de `src/config/modules.ts` (`CURRENT_STAGE`).

| Étape | Contenu | État |
| --- | --- | --- |
| 1 | Audit et planification | ✅ Terminé |
| 2 | Fondations : Next.js, design system, navigation, pages, structure backend, clients Supabase | ✅ Livré (voir ci-dessous) |
| 3 | Authentification (inscription, connexion, déconnexion), profil, schéma SQL, migrations, RLS, stockage privé, `proxy.ts` | ⏭ Suivante |
| 4 | Couche AI Provider, Gemini, chat en streaming, historique, gestion du contexte, journal des coûts, limitation de débit | |
| 5 | Mémoire : extraction, catégorisation, embeddings, recherche hybride, correction et validation, fusion des doublons | |
| 6 | Documents (PDF, DOCX, TXT, CSV), recherche Internet avec sources, agents spécialisés et Agent Factory | |
| 7 | Tests de bout en bout, revue de sécurité, accessibilité, déploiement Vercel | |

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

**Non testé à ce stade** : les clients Supabase n'ont pas encore été exercés contre un vrai projet (aucun identifiant fourni) ; ils le seront à l'étape 3.

## Ce dont l'étape 3 a besoin de votre part

1. Créer un projet sur https://supabase.com (région UE conseillée, ex. Frankfurt ou Paris).
2. Copier dans `.env.local` : l'URL du projet, la clé *publishable*, la clé *secret*.
3. Choisir : connexion par e-mail + mot de passe, lien magique, ou les deux ? (Recommandation : les deux.)

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
