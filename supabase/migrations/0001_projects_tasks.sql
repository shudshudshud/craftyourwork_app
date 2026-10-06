-- SPDX-License-Identifier: AGPL-3.0-or-later
-- Copyright (C) 2026 Irsyad Ramthan
--
-- Core to-do layer: projects and tasks.
-- A finished task's `outcome` line is the work log that later feeds
-- the development plan and tailored resumes.
-- Every row belongs to one user and row-level security keeps it private.

create table public.projects (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name        text not null check (char_length(name) between 1 and 120),
  description text,
  status      text not null default 'active' check (status in ('active', 'paused', 'done')),
  created_at  timestamptz not null default now()
);

create table public.tasks (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  project_id  uuid references public.projects (id) on delete set null, -- null = inbox
  title       text not null check (char_length(title) between 1 and 500),
  status      text not null default 'todo' check (status in ('todo', 'done')),
  due_date    date,
  outcome     text,          -- one line on what came out of it; the work log
  done_at     timestamptz,
  created_at  timestamptz not null default now(),
  constraint done_has_timestamp check ((status = 'done') = (done_at is not null))
);

create index tasks_user_status_idx on public.tasks (user_id, status);
create index tasks_user_done_at_idx on public.tasks (user_id, done_at desc) where status = 'done';
create index tasks_project_idx on public.tasks (project_id);
create index projects_user_idx on public.projects (user_id);

-- A task can only point at a project owned by the same user.
create or replace function public.enforce_task_project_owner()
returns trigger language plpgsql security invoker as $$
begin
  if new.project_id is not null and not exists (
    select 1 from public.projects p
    where p.id = new.project_id and p.user_id = new.user_id
  ) then
    raise exception 'project does not belong to this user';
  end if;
  return new;
end $$;

create trigger tasks_project_owner
  before insert or update of project_id, user_id on public.tasks
  for each row execute function public.enforce_task_project_owner();

alter table public.projects enable row level security;
alter table public.tasks    enable row level security;

create policy "own projects: select" on public.projects for select to authenticated using (user_id = (select auth.uid()));
create policy "own projects: insert" on public.projects for insert to authenticated with check (user_id = (select auth.uid()));
create policy "own projects: update" on public.projects for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "own projects: delete" on public.projects for delete to authenticated using (user_id = (select auth.uid()));

create policy "own tasks: select" on public.tasks for select to authenticated using (user_id = (select auth.uid()));
create policy "own tasks: insert" on public.tasks for insert to authenticated with check (user_id = (select auth.uid()));
create policy "own tasks: update" on public.tasks for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "own tasks: delete" on public.tasks for delete to authenticated using (user_id = (select auth.uid()));
