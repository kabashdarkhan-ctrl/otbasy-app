-- Supabase Dashboard → SQL Editor ішінде бір рет іске қосыңыз.
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  title text not null,
  status text not null default 'active',
  items jsonb not null default '[]'::jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);
alter table public.projects enable row level security;
create policy "family members read projects" on public.projects for select
  using (exists (select 1 from public.family_members m where m.family_id = projects.family_id and m.user_id = auth.uid()));
create policy "family members add projects" on public.projects for insert
  with check (exists (select 1 from public.family_members m where m.family_id = projects.family_id and m.user_id = auth.uid()));
create policy "family members update projects" on public.projects for update
  using (exists (select 1 from public.family_members m where m.family_id = projects.family_id and m.user_id = auth.uid()));
create policy "family members delete projects" on public.projects for delete
  using (exists (select 1 from public.family_members m where m.family_id = projects.family_id and m.user_id = auth.uid()));

-- Кесте бұрын жасалған болса:
alter table public.projects add column if not exists items jsonb not null default '[]'::jsonb;
