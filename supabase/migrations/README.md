# Migrations SQL

Les migrations versionnées de la base de données seront ajoutées ici à l'**étape 3**
(schéma complet, Row Level Security, pgvector, stockage privé).

Convention : `AAAAMMJJHHMMSS_description.sql`, appliquées dans l'ordre avec la CLI Supabase :

```bash
npx supabase link --project-ref <votre-project-ref>
npx supabase db push
```

Une migration déjà appliquée en production n'est jamais modifiée : on en crée une nouvelle.
