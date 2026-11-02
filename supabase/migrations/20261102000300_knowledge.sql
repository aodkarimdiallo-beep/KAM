-- ─────────────────────────────────────────────────────────────────────────────
-- DIGITAL TWIN — 03 · Conversations, documents et mémoire.
--
-- Embeddings : vector(1536). Dimension compatible avec Gemini (sortie réglable),
-- OpenAI text-embedding-3 et la limite des index HNSW (2000). Le modèle utilisé
-- est stocké à côté de chaque vecteur : changer de modèle impose de recalculer.
-- ─────────────────────────────────────────────────────────────────────────────

create type public.message_role as enum ('user', 'assistant', 'system', 'tool');
create type public.document_status as enum ('uploaded', 'processing', 'ready', 'failed');
create type public.memory_source_type as enum ('message', 'conversation', 'document', 'web', 'manual');

-- ── Conversations ───────────────────────────────────────────────────────────
create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  project_id uuid,
  title text check (char_length(title) <= 200),
  pinned boolean not null default false,
  archived_at timestamptz,
  last_message_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id),
  foreign key (project_id, user_id) references public.projects (id, user_id) on delete set null (project_id)
);
create index conversations_user_recent_idx
  on public.conversations (user_id, last_message_at desc nulls last)
  where archived_at is null;

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  conversation_id uuid not null,
  role public.message_role not null,
  content text not null check (char_length(content) <= 100000),
  provider text,
  model text,
  input_tokens integer check (input_tokens >= 0),
  output_tokens integer check (output_tokens >= 0),
  -- Souvenirs et sources utilisés pour produire une réponse (affichés dans le chat).
  context jsonb not null default '{}'::jsonb,
  fts tsvector generated always as (to_tsvector('simple', content)) stored,
  created_at timestamptz not null default now(),
  unique (id, user_id),
  foreign key (conversation_id, user_id) references public.conversations (id, user_id) on delete cascade
);
create index messages_conversation_idx on public.messages (conversation_id, created_at);
create index messages_fts_idx on public.messages using gin (fts);

-- ── Documents importés (fichiers dans le bucket privé `documents`) ──────────
create table public.documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  project_id uuid,
  filename text not null check (char_length(filename) between 1 and 255),
  storage_path text not null unique,
  mime_type text not null,
  size_bytes bigint not null check (size_bytes >= 0),
  checksum_sha256 text check (checksum_sha256 ~ '^[0-9a-f]{64}$'),
  status public.document_status not null default 'uploaded',
  error text,
  page_count integer check (page_count >= 0),
  processed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id),
  -- Le chemin de stockage commence obligatoirement par l'identifiant du propriétaire.
  check (split_part(storage_path, '/', 1) = user_id::text),
  foreign key (project_id, user_id) references public.projects (id, user_id) on delete set null (project_id)
);
create index documents_user_idx on public.documents (user_id, created_at desc);

create table public.document_chunks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  document_id uuid not null,
  chunk_index integer not null check (chunk_index >= 0),
  content text not null,
  token_count integer check (token_count >= 0),
  embedding extensions.vector(1536),
  embedding_model text,
  fts tsvector generated always as (to_tsvector('simple', content)) stored,
  created_at timestamptz not null default now(),
  unique (document_id, chunk_index),
  check ((embedding is null) = (embedding_model is null)),
  foreign key (document_id, user_id) references public.documents (id, user_id) on delete cascade
);
create index document_chunks_user_idx on public.document_chunks (user_id);
create index document_chunks_fts_idx on public.document_chunks using gin (fts);
create index document_chunks_embedding_idx
  on public.document_chunks using hnsw (embedding extensions.vector_cosine_ops);

-- ── Mémoire ─────────────────────────────────────────────────────────────────
create table public.memories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  project_id uuid,
  category public.memory_category not null,
  title text check (char_length(title) <= 200),
  content text not null check (char_length(content) between 1 and 8000),
  epistemic_status public.epistemic_status not null,
  validation_status public.validation_status not null default 'pending',
  origin public.record_origin not null,
  confidence numeric(3, 2) check (confidence between 0 and 1),
  tags text[] not null default '{}',
  -- Période pendant laquelle l'information est vraie (ex. « habite à Lyon » de 2019 à 2023).
  valid_from date,
  valid_until date,
  -- Fusion des doublons : le souvenir absorbé pointe vers celui qui le remplace.
  merged_into uuid,
  validated_at timestamptz,
  embedding extensions.vector(1536),
  embedding_model text,
  fts tsvector generated always as (
    to_tsvector('simple', coalesce(title, '') || ' ' || content)
  ) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id),
  -- Règle fondamentale : un fait confirmé est forcément validé par l'utilisateur.
  constraint memories_confirmed_fact_requires_validation
    check (epistemic_status <> 'confirmed_fact' or validation_status in ('validated', 'corrected')),
  check (validation_status = 'pending' or validated_at is not null),
  check (valid_until is null or valid_from is null or valid_until >= valid_from),
  check (merged_into is null or merged_into <> id),
  check ((embedding is null) = (embedding_model is null)),
  foreign key (project_id, user_id) references public.projects (id, user_id) on delete set null (project_id),
  foreign key (merged_into, user_id) references public.memories (id, user_id) on delete set null (merged_into)
);
create index memories_user_category_idx
  on public.memories (user_id, category, updated_at desc)
  where merged_into is null and validation_status <> 'rejected';
create index memories_pending_idx on public.memories (user_id, created_at desc) where validation_status = 'pending';
create index memories_fts_idx on public.memories using gin (fts);
create index memories_tags_idx on public.memories using gin (tags);
create index memories_embedding_idx on public.memories using hnsw (embedding extensions.vector_cosine_ops);

-- D'où vient un souvenir : message, conversation, document, page web ou saisie manuelle.
create table public.memory_sources (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  memory_id uuid not null,
  source_type public.memory_source_type not null,
  message_id uuid,
  conversation_id uuid,
  document_id uuid,
  url text check (url ~ '^https?://'),
  excerpt text check (char_length(excerpt) <= 2000),
  created_at timestamptz not null default now(),
  check (
    (source_type = 'message' and message_id is not null)
    or (source_type = 'conversation' and conversation_id is not null)
    or (source_type = 'document' and document_id is not null)
    or (source_type = 'web' and url is not null)
    or source_type = 'manual'
  ),
  foreign key (memory_id, user_id) references public.memories (id, user_id) on delete cascade,
  foreign key (message_id, user_id) references public.messages (id, user_id) on delete set null (message_id),
  foreign key (conversation_id, user_id) references public.conversations (id, user_id) on delete set null (conversation_id),
  foreign key (document_id, user_id) references public.documents (id, user_id) on delete set null (document_id)
);
create index memory_sources_memory_idx on public.memory_sources (memory_id);

-- Historique des corrections : alimenté automatiquement, lecture seule pour l'utilisateur.
create table public.memory_revisions (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  memory_id uuid not null,
  previous_content text not null,
  previous_title text,
  previous_category public.memory_category not null,
  previous_epistemic_status public.epistemic_status not null,
  previous_validation_status public.validation_status not null,
  changed_by uuid,
  changed_at timestamptz not null default now(),
  foreign key (memory_id, user_id) references public.memories (id, user_id) on delete cascade
);
create index memory_revisions_memory_idx on public.memory_revisions (memory_id, changed_at desc);

-- ── Garde-fous de la mémoire ────────────────────────────────────────────────
-- Un souvenir produit par le système arrive TOUJOURS « à valider » et ne peut
-- jamais naître comme fait confirmé.
create function public.guard_system_memory() returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.origin = 'system'
     and (new.validation_status <> 'pending' or new.epistemic_status = 'confirmed_fact') then
    raise exception 'Un souvenir créé par le système doit être en attente de validation'
      using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

create trigger memories_guard_system_insert
  before insert on public.memories
  for each row execute function public.guard_system_memory();

-- L'origine d'un souvenir est immuable.
create function public.guard_memory_origin() returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.origin is distinct from old.origin or new.user_id is distinct from old.user_id then
    raise exception 'L''origine et le propriétaire d''un souvenir ne peuvent pas changer'
      using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

create trigger memories_guard_origin_update
  before update on public.memories
  for each row execute function public.guard_memory_origin();

create function public.record_memory_revision() returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.content is distinct from old.content
     or new.title is distinct from old.title
     or new.category is distinct from old.category
     or new.epistemic_status is distinct from old.epistemic_status
     or new.validation_status is distinct from old.validation_status then
    insert into public.memory_revisions (
      user_id, memory_id, previous_content, previous_title, previous_category,
      previous_epistemic_status, previous_validation_status, changed_by
    ) values (
      old.user_id, old.id, old.content, old.title, old.category,
      old.epistemic_status, old.validation_status, auth.uid()
    );
  end if;
  return new;
end;
$$;

create trigger memories_record_revision
  after update on public.memories
  for each row execute function public.record_memory_revision();

-- ── Horodatage automatique ──────────────────────────────────────────────────
create trigger conversations_set_updated_at before update on public.conversations
  for each row execute function public.set_updated_at();
create trigger documents_set_updated_at before update on public.documents
  for each row execute function public.set_updated_at();
create trigger memories_set_updated_at before update on public.memories
  for each row execute function public.set_updated_at();

-- ── RLS ─────────────────────────────────────────────────────────────────────
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.documents enable row level security;
alter table public.document_chunks enable row level security;
alter table public.memories enable row level security;
alter table public.memory_sources enable row level security;
alter table public.memory_revisions enable row level security;

revoke all on public.conversations, public.messages, public.documents, public.document_chunks,
  public.memories, public.memory_sources, public.memory_revisions from anon;
revoke insert, update, delete on public.memory_revisions from authenticated;
revoke execute on function public.record_memory_revision() from anon, authenticated;

create policy "conversations: propriétaire" on public.conversations for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "messages: propriétaire" on public.messages for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "documents: propriétaire" on public.documents for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "document_chunks: propriétaire" on public.document_chunks for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "memories: propriétaire" on public.memories for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "memory_sources: propriétaire" on public.memory_sources for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "memory_revisions: lecture par le propriétaire" on public.memory_revisions for select to authenticated
  using (user_id = (select auth.uid()));
