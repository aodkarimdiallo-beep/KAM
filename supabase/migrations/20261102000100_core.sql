-- ─────────────────────────────────────────────────────────────────────────────
-- DIGITAL TWIN — 01 · Socle : extensions, types, fonctions utilitaires,
-- profils et réglages utilisateur.
--
-- Principes appliqués dans toutes les migrations :
--   • chaque table privée porte `user_id` (défaut : auth.uid()) et la RLS ;
--   • les liens entre tables utilisent des clés étrangères COMPOSITES
--     (id, user_id) : impossible de rattacher une ligne à un objet d'un autre
--     utilisateur, même en connaissant son identifiant (les FK ignorent la RLS) ;
--   • le rôle `anon` (visiteur non connecté) n'a aucun privilège.
-- ─────────────────────────────────────────────────────────────────────────────

create extension if not exists vector with schema extensions;

-- ── Types énumérés ──────────────────────────────────────────────────────────
create type public.user_role as enum ('user', 'admin');
create type public.memory_category as enum ('episodic', 'semantic', 'procedural', 'prospective');
create type public.epistemic_status as enum (
  'confirmed_fact', 'user_statement', 'opinion', 'hypothesis', 'ai_inference', 'uncertain'
);
create type public.validation_status as enum ('pending', 'validated', 'corrected', 'rejected');
create type public.record_origin as enum ('user', 'system');
create type public.memory_capture_mode as enum ('off', 'suggest');

-- ── Fonctions utilitaires ───────────────────────────────────────────────────
create function public.set_updated_at() returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ── Profils (1–1 avec auth.users) ───────────────────────────────────────────
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text check (char_length(display_name) <= 80),
  full_name text check (char_length(full_name) <= 160),
  headline text check (char_length(headline) <= 200),
  bio text check (char_length(bio) <= 4000),
  avatar_path text,
  locale text not null default 'fr' check (locale ~ '^[a-z]{2}(-[A-Z]{2})?$'),
  timezone text not null default 'Europe/Paris' check (char_length(timezone) <= 64),
  role public.user_role not null default 'user',
  onboarding_completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ── Réglages utilisateur ────────────────────────────────────────────────────
create table public.user_settings (
  user_id uuid primary key references auth.users (id) on delete cascade,
  ai_provider text check (ai_provider in ('gemini', 'openai', 'anthropic')),
  ai_model text check (char_length(ai_model) <= 100),
  memory_capture public.memory_capture_mode not null default 'suggest',
  -- Préparation SaaS : formule et plafonds d'usage, modifiables par le serveur uniquement.
  plan text not null default 'personal',
  monthly_token_limit integer check (monthly_token_limit is null or monthly_token_limit >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger user_settings_set_updated_at
  before update on public.user_settings
  for each row execute function public.set_updated_at();

-- ── Création automatique du profil et des réglages à l'inscription ─────────
create function public.handle_new_user() returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    nullif(left(coalesce(new.raw_user_meta_data ->> 'display_name', ''), 80), '')
  );
  insert into public.user_settings (user_id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── Sécurité : RLS et privilèges ────────────────────────────────────────────
alter table public.profiles enable row level security;
alter table public.user_settings enable row level security;

revoke all on public.profiles, public.user_settings from anon;

-- Le profil est créé par le trigger et supprimé en cascade : l'utilisateur
-- ne peut que le lire et modifier certaines colonnes (jamais `role`).
revoke insert, update, delete on public.profiles from authenticated;
grant update (display_name, full_name, headline, bio, avatar_path, locale, timezone, onboarding_completed_at)
  on public.profiles to authenticated;

create policy "profiles: lecture de son propre profil"
  on public.profiles for select to authenticated
  using (id = (select auth.uid()));

create policy "profiles: modification de son propre profil"
  on public.profiles for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- Réglages : `plan` et `monthly_token_limit` restent sous contrôle du serveur.
revoke insert, update, delete on public.user_settings from authenticated;
grant update (ai_provider, ai_model, memory_capture) on public.user_settings to authenticated;

create policy "user_settings: lecture de ses réglages"
  on public.user_settings for select to authenticated
  using (user_id = (select auth.uid()));

create policy "user_settings: modification de ses réglages"
  on public.user_settings for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

revoke execute on function public.handle_new_user() from anon, authenticated;
