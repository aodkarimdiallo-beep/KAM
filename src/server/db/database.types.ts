/**
 * Types de la base utilisés par l'application.
 *
 * Écrits à la main pour l'étape 3 (alias `type`, pas `interface` : supabase-js exige
 * des types indexables) (tables effectivement utilisées). Une fois le
 * projet Supabase relié, ce fichier sera REMPLACÉ par la version générée :
 *   npx supabase gen types typescript --project-id <project-ref> > src/server/db/database.types.ts
 */

type Timestamp = string;

export type ProfileRow = {
  id: string;
  display_name: string | null;
  full_name: string | null;
  headline: string | null;
  bio: string | null;
  avatar_path: string | null;
  locale: string;
  timezone: string;
  role: "user" | "admin";
  onboarding_completed_at: Timestamp | null;
  created_at: Timestamp;
  updated_at: Timestamp;
};

/** Colonnes que l'utilisateur a le droit de modifier (cf. GRANT dans la migration 01). */
export type ProfileUpdate = Partial<
  Pick<ProfileRow, "display_name" | "full_name" | "headline" | "bio" | "avatar_path" | "locale" | "timezone" | "onboarding_completed_at">
>;

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRow;
        // Insertion réservée au trigger `handle_new_user` (refusée par les privilèges SQL).
        Insert: ProfileUpdate & { id: string };
        Update: ProfileUpdate;
        Relationships: [];
      };
    };
    Views: Record<never, never>;
    Functions: {
      record_audit_event: {
        Args: { p_action: string; p_entity_type?: string; p_entity_id?: string; p_metadata?: Record<string, unknown> };
        Returns: undefined;
      };
    };
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
};
