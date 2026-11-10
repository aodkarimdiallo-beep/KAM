# DIGITAL TWIN — Feuille de route

L'état affiché dans l'application provient de `src/config/modules.ts` (`CURRENT_STAGE`).

| Étape | Contenu | État |
| --- | --- | --- |
| 1 | Audit et planification | ✅ Terminé |
| 2 | Fondations : Next.js, design system, navigation, pages, structure backend, clients Supabase | ✅ Livré |
| 3 | Authentification (inscription, connexion, déconnexion), profil, schéma SQL, migrations, RLS, stockage privé, `proxy.ts` | 🟡 Base installée sur Supabase et vérifiée — reste le test d'inscription réel (voir ci-dessous) |
| 4 | Couche AI Provider, Gemini, chat en streaming, historique, gestion du contexte, journal des coûts, limitation de débit | 🟡 Code livré et testé de bout en bout avec une IA simulée — reste la clé Gemini valide |
| 5 | Mémoire : extraction, catégorisation, embeddings, recherche hybride, correction et validation, fusion des doublons | |
| 6 | Documents (PDF, DOCX, TXT, CSV), recherche Internet avec sources, agents spécialisés et Agent Factory | |
| 7 | Tests de bout en bout, revue de sécurité, accessibilité, déploiement Vercel | |

## Étape 4 — le cerveau : ce qui a été livré

- **Couche AI Provider** (`src/domain/ai`, `src/server/ai`) : un contrat unique (`AIProvider`) et un
  fournisseur générique « compatible OpenAI » sans dépendance externe. Gemini (point d'accès OpenAI
  de Google) et OpenAI fonctionnent par simple configuration ; Claude demandera un adaptateur dédié.
- **Contexte** (`src/domain/chat/context.ts`) : consignes permanentes (le Twin est une IA, n'invente
  rien, distingue ce qu'il sait de ce qu'il déduit), profil déclaré, date dans le fuseau de
  l'utilisateur, historique récent limité par un budget (jamais toute la conversation).
- **Route `/api/chat`** : réponse diffusée mot à mot (NDJSON), enregistrement du message, de la
  réponse (même partielle), des jetons et de la latence ; erreurs du fournisseur traduites en
  messages clairs.
- **Coûts et limites** : migration 06 (`record_usage_event`, usage non falsifiable), estimation du
  coût si les tarifs sont configurés, limite de messages par minute, quota mensuel optionnel.
- **Interface AI Chat** : nouvelle conversation, liste, recherche (titres et contenu), suppression
  avec confirmation, bouton « Arrêter », version mobile.
- **Types de base générés** depuis Supabase (`src/server/db/database.types.ts`).

**Vérifié** : 72 tests unitaires ; 41 tests de sécurité SQL ; scénario complet dans un vrai
navigateur, contre le vrai Supabase, avec une **IA simulée** (serveur local imitant Gemini) :
connexion, réponse en streaming, persistance après rechargement, recherche, suppression, limite
de débit (3ᵉ message bloqué), requête invalide (400), accès sans session (401), usage enregistré.

**Pas encore vérifié** : une réponse de la **vraie** IA Gemini. La clé enregistrée est refusée par
Google (« clé invalide ») ; le modèle exact (`GEMINI_CHAT_MODEL`) sera choisi dans la liste des
modèles disponibles dès qu'une clé valide sera en place.

## Étape 3 — ce qui a été livré

**Base de données** (`supabase/migrations/`, 5 migrations versionnées) :
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
- 41 tests de sécurité SQL exécutés (à jour à l'étape 4) sur un vrai PostgreSQL 16 + pgvector (`npm run test:db`) ;
- 42 tests unitaires ; lint ; TypeScript ; build de production ;
- navigateur : redirections, erreurs de formulaire, message « service injoignable » (ce test a révélé
  puis permis de corriger un faux message de succès).

**Installé sur Supabase (10/11/2026)** : les 5 migrations ont été appliquées au projet
`khjrfjnjgeywrlqdqsve` via le connecteur Supabase. Vérifications : 19 tables, toutes avec RLS ;
bucket `documents` privé ; conseiller de sécurité Supabase sans alerte sur nos fonctions (la
migration 05 corrige les deux qu'il avait signalées). Alertes restantes, assumées :
`record_audit_event` (appelable par un utilisateur connecté, par conception) et `rls_auto_enable`
(fonction fournie par Supabase qui active la RLS sur toute nouvelle table).

**Vérifié contre le vrai Supabase** : l'application joint le service d'authentification ;
une connexion avec un mauvais mot de passe renvoie bien « incorrect ».

**Pas encore vérifié** : une inscription complète (e-mail de confirmation, puis connexion).
Le service d'e-mail intégré de Supabase est limité à quelques envois par heure et la limite a
été atteinte pendant les tests. Le test se fera avec l'adresse du fondateur.

> Note pour le développement dans l'environnement cloud Claude : Node.js n'utilise pas le proxy
> réseau par défaut. Lancer le serveur avec `NODE_USE_ENV_PROXY=1 npm start` (inutile sur Vercel).

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
