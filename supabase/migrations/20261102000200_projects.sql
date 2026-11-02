-- ─────────────────────────────────────────────────────────────────────────────
-- DIGITAL TWIN — 02 · Projets, tâches de projet, objectifs, décisions.
-- ─────────────────────────────────────────────────────────────────────────────

create type public.project_status as enum ('idea', 'active', 'paused', 'completed', 'archived');
create type public.task_status as enum ('todo', 'in_progress', 'done', 'cancelled');
create type public.goal_horizon as enum ('short', 'medium', 'long');
create type public.goal_status as enum ('active', 'achieved', 'abandoned');

-- ── Projets ─────────────────────────────────────────────────────────────────
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 160),
  description text check (char_length(description) <= 8000),
  objectives text check (char_length(objectives) <= 8000),
  status public.project_status not null default 'active',
  progress smallint not null default 0 check (progress between 0 and 100),
  started_on date,
  due_on date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id)
);
create index projects_user_status_idx on public.projects (user_id, status, updated_at desc);

-- ── Étapes / tâches d'un projet ─────────────────────────────────────────────
create table public.project_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  project_id uuid not null,
  title text not null check (char_length(title) between 1 and 300),
  notes text check (char_length(notes) <= 8000),
  status public.task_status not null default 'todo',
  position integer not null default 0,
  due_on date,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (project_id, user_id) references public.projects (id, user_id) on delete cascade
);
create index project_tasks_project_idx on public.project_tasks (project_id, position);

-- ── Objectifs (mémoire prospective structurée) ──────────────────────────────
create table public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  project_id uuid,
  title text not null check (char_length(title) between 1 and 300),
  description text check (char_length(description) <= 8000),
  horizon public.goal_horizon not null default 'medium',
  status public.goal_status not null default 'active',
  target_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (project_id, user_id) references public.projects (id, user_id) on delete set null (project_id)
);
create index goals_user_idx on public.goals (user_id, status, target_date);

-- ── Journal des décisions ───────────────────────────────────────────────────
create table public.decisions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  project_id uuid,
  title text not null check (char_length(title) between 1 and 300),
  decided_on date not null default current_date,
  context text check (char_length(context) <= 8000),
  reasons text check (char_length(reasons) <= 8000),
  -- Options envisagées : [{ "label": "...", "pros": "...", "cons": "..." }]
  options jsonb not null default '[]'::jsonb check (jsonb_typeof(options) = 'array'),
  outcome text check (char_length(outcome) <= 8000),
  lessons text check (char_length(lessons) <= 8000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (project_id, user_id) references public.projects (id, user_id) on delete set null (project_id)
);
create index decisions_user_idx on public.decisions (user_id, decided_on desc);

-- ── Horodatage automatique ──────────────────────────────────────────────────
create trigger projects_set_updated_at before update on public.projects
  for each row execute function public.set_updated_at();
create trigger project_tasks_set_updated_at before update on public.project_tasks
  for each row execute function public.set_updated_at();
create trigger goals_set_updated_at before update on public.goals
  for each row execute function public.set_updated_at();
create trigger decisions_set_updated_at before update on public.decisions
  for each row execute function public.set_updated_at();

-- ── RLS : chaque utilisateur ne voit et ne modifie que ses lignes ───────────
alter table public.projects enable row level security;
alter table public.project_tasks enable row level security;
alter table public.goals enable row level security;
alter table public.decisions enable row level security;

revoke all on public.projects, public.project_tasks, public.goals, public.decisions from anon;

create policy "projects: propriétaire" on public.projects for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "project_tasks: propriétaire" on public.project_tasks for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "goals: propriétaire" on public.goals for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "decisions: propriétaire" on public.decisions for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
