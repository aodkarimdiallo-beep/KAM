# Brancher Supabase — guide pas à pas

Ce guide prépare la base de données de DIGITAL TWIN. Il se fait **une seule fois**,
de préférence depuis un **ordinateur** (plus confortable que le téléphone).
Comptez 15 minutes.

---

## Étape A — Créer les tables (copier-coller)

> ✅ **Déjà fait** pour le projet `khjrfjnjgeywrlqdqsve` (10/11/2026), migrations 01 à 06 appliquées
> via le connecteur Supabase. Cette étape ne sert que pour un nouveau projet.

La base est vide au départ. Il faut y « installer » les tables, c'est-à-dire les tiroirs
où DIGITAL TWIN rangera vos informations.

1. Ouvrez https://supabase.com/dashboard et cliquez sur votre projet.
2. Dans le menu de gauche, cliquez sur **SQL Editor** (icône `>_`).
3. Cliquez sur **New query** (nouvelle requête).
4. Sur GitHub, ouvrez le dossier `supabase/migrations` du dépôt KAM.
5. Pour **chaque fichier, dans l'ordre** (01 à 06, dans l'ordre) :
   - ouvrez le fichier, cliquez sur l'icône **Copier** (deux petits carrés) ;
   - collez tout dans l'éditeur Supabase (en remplaçant ce qu'il contient) ;
   - cliquez sur **Run** (en bas à droite) ;
   - vous devez voir **« Success. No rows returned »**. Passez au fichier suivant.

| Ordre | Fichier |
| --- | --- |
| 1 | `20261102000100_core.sql` |
| 2 | `20261102000200_projects.sql` |
| 3 | `20261102000300_knowledge.sql` |
| 4 | `20261102000400_agents_and_operations.sql` |
| 5 | `20261110000500_harden_function_privileges.sql` |
| 6 | `20261110000600_usage_logging.sql` |

> Si un message rouge apparaît, ne relancez pas le même fichier : faites une capture d'écran et
> envoyez-la. Chaque fichier ne doit être exécuté qu'**une seule fois**.

**Vérification** : menu **Table Editor** → vous devez voir `profiles`, `memories`, `projects`, etc.,
chacune avec la mention **RLS enabled**.

---

## Étape B — Régler l'authentification

1. Menu **Authentication** → **Sign In / Providers** → **Email** : vérifiez que c'est activé.
   - **Confirm email** : laissez **activé** (recommandé : chaque inscription est confirmée par e-mail).
   - **Minimum password length** : mettez **10**.
2. Menu **Authentication** → **URL Configuration** :
   - **Site URL** : l'adresse de votre application (ex. `https://votre-app.vercel.app`, ou
     `http://localhost:3000` tant qu'elle n'est pas en ligne).
   - **Redirect URLs** : ajoutez `http://localhost:3000/auth/callback` et, plus tard,
     `https://votre-app.vercel.app/auth/callback`.

Sans cette étape, les liens reçus par e-mail ne ramèneront pas vers l'application.

---

## Étape C — Les clés (déjà faite en partie)

| Variable | Où la trouver | Secrète ? |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Project Settings → API | Non |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Project Settings → API Keys (`sb_publishable_…`) | Non |
| `SUPABASE_SECRET_KEY` | Project Settings → API Keys (`sb_secret_…`) | **Oui — ne jamais la partager** |

Elles se saisissent dans `.env.local` (sur un ordinateur) et, au moment de la mise en ligne,
dans **Vercel → Project → Settings → Environment Variables**.

---

## Bon à savoir

- **Envoi d'e-mails** : le service d'e-mail intégré de Supabase est limité à quelques messages
  par heure et sert aux essais. Avant d'ouvrir le service à d'autres personnes, il faudra
  brancher un fournisseur d'e-mails (SMTP) — gratuit au début chez la plupart des fournisseurs.
- **Développeurs** : avec la CLI Supabase, `npx supabase link --project-ref <ref>` puis
  `npx supabase db push` remplace l'étape A.
