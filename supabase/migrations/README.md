# Migrations SQL

Schéma versionné de la base. Guide d'application pas à pas : [`docs/SUPABASE_SETUP.md`](../../docs/SUPABASE_SETUP.md).

| Fichier | Contenu |
| --- | --- |
| `…000100_core.sql` | Extensions, types, profils, réglages, création automatique du profil |
| `…000200_projects.sql` | Projets, tâches de projet, objectifs, décisions |
| `…000300_knowledge.sql` | Conversations, messages, documents, mémoire, sources, révisions |
| `…000400_agents_and_operations.sql` | Agents, approbations, audit, usage IA, stockage privé |
| `…000500_harden_function_privileges.sql` | Fonctions internes non appelables via l'API |
| `…000600_usage_logging.sql` | Journalisation de l'usage IA (`record_usage_event`) |

Règles :
- une migration déjà appliquée n'est **jamais modifiée** : on en crée une nouvelle ;
- toute nouvelle table privée : `user_id`, RLS activée, politique propriétaire, `revoke all … from anon` ;
- tester avant d'appliquer : `npm run test:db` (voir `scripts/test-db.sh`).

Avec la CLI : `npx supabase link --project-ref <ref>` puis `npx supabase db push`.
