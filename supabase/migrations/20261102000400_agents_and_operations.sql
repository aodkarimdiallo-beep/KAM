-- ─────────────────────────────────────────────────────────────────────────────
-- DIGITAL TWIN — 04 · Agents, tâches/approbations, journal d'audit, usage IA,
-- stockage privé des documents.
-- ─────────────────────────────────────────────────────────────────────────────

create type public.agent_run_status as enum (
  'queued', 'running', 'awaiting_approval', 'succeeded', 'failed', 'cancelled'
);
create type public.work_item_kind as enum ('todo', 'approval');
create type public.work_item_status as enum ('open', 'approved', 'rejected', 'done', 'cancelled');

-- ── Agents ──────────────────────────────────────────────────────────────────
create table public.agents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  slug text not null check (slug ~ '^[a-z0-9][a-z0-9-]{1,48}$'),
  name text not null check (char_length(name) between 1 and 80),
  description text check (char_length(description) <= 1000),
  mission text check (char_length(mission) <= 2000),
  instructions text check (char_length(instructions) <= 20000),
  is_master boolean not null default false,
  is_active boolean not null default true,
  -- Principe du moindre privilège : catégories de mémoire lisibles, écriture désactivée par défaut.
  memory_read_categories public.memory_category[] not null default '{}',
  memory_can_propose boolean not null default false,
  -- Limites : { "max_tokens_per_run": 8000, "max_runs_per_day": 50, ... }
  limits jsonb not null default '{}'::jsonb check (jsonb_typeof(limits) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id),
  unique (user_id, slug)
);
-- Un seul Master Agent par utilisateur.
create unique index agents_one_master_per_user on public.agents (user_id) where is_master;

create table public.agent_tools (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  agent_id uuid not null,
  tool_key text not null check (tool_key ~ '^[a-z][a-z0-9_.]{1,63}$'),
  requires_approval boolean not null default true,
  config jsonb not null default '{}'::jsonb check (jsonb_typeof(config) = 'object'),
  created_at timestamptz not null default now(),
  unique (agent_id, tool_key),
  foreign key (agent_id, user_id) references public.agents (id, user_id) on delete cascade
);

create table public.agent_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  agent_id uuid not null,
  conversation_id uuid,
  parent_run_id uuid,
  status public.agent_run_status not null default 'queued',
  input text,
  output text,
  error text,
  input_tokens integer check (input_tokens >= 0),
  output_tokens integer check (output_tokens >= 0),
  cost_usd numeric(12, 6) check (cost_usd >= 0),
  started_at timestamptz,
  finished_at timestamptz,
  created_at timestamptz not null default now(),
  unique (id, user_id),
  foreign key (agent_id, user_id) references public.agents (id, user_id) on delete cascade,
  foreign key (conversation_id, user_id) references public.conversations (id, user_id) on delete set null (conversation_id),
  foreign key (parent_run_id, user_id) references public.agent_runs (id, user_id) on delete set null (parent_run_id)
);
create index agent_runs_agent_idx on public.agent_runs (agent_id, created_at desc);

-- ── Tâches et demandes d'approbation humaine ────────────────────────────────
create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  kind public.work_item_kind not null default 'todo',
  status public.work_item_status not null default 'open',
  title text not null check (char_length(title) between 1 and 300),
  details text check (char_length(details) <= 8000),
  agent_run_id uuid,
  -- Pour une approbation : description précise de l'action demandée.
  payload jsonb not null default '{}'::jsonb check (jsonb_typeof(payload) = 'object'),
  due_at timestamptz,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (status in ('open', 'cancelled') or resolved_at is not null),
  check (kind = 'approval' or status not in ('approved', 'rejected')),
  foreign key (agent_run_id, user_id) references public.agent_runs (id, user_id) on delete set null (agent_run_id)
);
create index tasks_open_idx on public.tasks (user_id, created_at desc) where status = 'open';

create trigger agents_set_updated_at before update on public.agents
  for each row execute function public.set_updated_at();
create trigger tasks_set_updated_at before update on public.tasks
  for each row execute function public.set_updated_at();

-- ── Journal d'audit (append-only) ───────────────────────────────────────────
create table public.audit_logs (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users (id) on delete set null,
  action text not null check (action ~ '^[a-z_]+(\.[a-z_]+)+$'),
  entity_type text,
  entity_id text,
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  created_at timestamptz not null default now()
);
create index audit_logs_user_idx on public.audit_logs (user_id, created_at desc);

-- Seul moyen pour un utilisateur connecté d'écrire dans le journal : l'identité
-- est imposée par la base (auth.uid()), jamais fournie par l'appelant.
create function public.record_audit_event(
  p_action text,
  p_entity_type text default null,
  p_entity_id text default null,
  p_metadata jsonb default '{}'::jsonb
) returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'Authentification requise' using errcode = 'insufficient_privilege';
  end if;
  insert into public.audit_logs (user_id, action, entity_type, entity_id, metadata)
  values (auth.uid(), p_action, p_entity_type, p_entity_id, coalesce(p_metadata, '{}'::jsonb));
end;
$$;

-- ── Usage et coûts IA (écrits par le serveur uniquement) ────────────────────
create table public.usage_events (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  provider text not null,
  model text not null,
  operation text not null check (operation in ('chat', 'embedding', 'extraction', 'agent', 'search')),
  input_tokens integer not null default 0 check (input_tokens >= 0),
  output_tokens integer not null default 0 check (output_tokens >= 0),
  cost_usd numeric(12, 6) not null default 0 check (cost_usd >= 0),
  latency_ms integer check (latency_ms >= 0),
  created_at timestamptz not null default now()
);
create index usage_events_user_month_idx on public.usage_events (user_id, created_at desc);

-- ── RLS ─────────────────────────────────────────────────────────────────────
alter table public.agents enable row level security;
alter table public.agent_tools enable row level security;
alter table public.agent_runs enable row level security;
alter table public.tasks enable row level security;
alter table public.audit_logs enable row level security;
alter table public.usage_events enable row level security;

revoke all on public.agents, public.agent_tools, public.agent_runs, public.tasks,
  public.audit_logs, public.usage_events from anon;
-- Journal et usage : lecture seule pour l'utilisateur (aucune falsification possible).
revoke insert, update, delete on public.audit_logs, public.usage_events from authenticated;
revoke execute on function public.record_audit_event(text, text, text, jsonb) from public, anon;
grant execute on function public.record_audit_event(text, text, text, jsonb) to authenticated;

create policy "agents: propriétaire" on public.agents for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "agent_tools: propriétaire" on public.agent_tools for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "agent_runs: propriétaire" on public.agent_runs for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "tasks: propriétaire" on public.tasks for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "audit_logs: lecture par le propriétaire" on public.audit_logs for select to authenticated
  using (user_id = (select auth.uid()));
create policy "usage_events: lecture par le propriétaire" on public.usage_events for select to authenticated
  using (user_id = (select auth.uid()));

-- ── Stockage privé des documents ────────────────────────────────────────────
-- Chemin imposé : <user_id>/<document_id>/<nom_du_fichier>
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'documents', 'documents', false, 52428800,
  array[
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'text/csv',
    'text/markdown'
  ]
)
on conflict (id) do nothing;

create policy "documents bucket: lecture de ses fichiers" on storage.objects for select to authenticated
  using (bucket_id = 'documents' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "documents bucket: dépôt dans son dossier" on storage.objects for insert to authenticated
  with check (bucket_id = 'documents' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "documents bucket: modification de ses fichiers" on storage.objects for update to authenticated
  using (bucket_id = 'documents' and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (bucket_id = 'documents' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "documents bucket: suppression de ses fichiers" on storage.objects for delete to authenticated
  using (bucket_id = 'documents' and (storage.foldername(name))[1] = (select auth.uid())::text);
