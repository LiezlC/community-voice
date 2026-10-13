-- Existing rows remain unowned and visible only to authorized operators.
alter table public.grievances
  add column if not exists owner_id uuid references auth.users(id) on delete set null;
alter table public.grievances alter column owner_id set default auth.uid();
create index if not exists grievances_owner_id_idx on public.grievances(owner_id);
alter table public.grievances enable row level security;

revoke all on table public.grievances from anon, public;
grant select, insert, update, delete on table public.grievances to authenticated;

-- Replace permissive policies in older source migrations as well as live installs.
do $$ declare existing_policy record; begin
  for existing_policy in
    select policyname from pg_policies
    where schemaname = 'public' and tablename = 'grievances'
  loop
    execute format('drop policy %I on public.grievances', existing_policy.policyname);
  end loop;
end $$;

create policy "Reporters read their own cases" on public.grievances
  for select to authenticated using (owner_id = (select auth.uid()));
create policy "Reporters submit their own cases" on public.grievances
  for insert to authenticated with check (owner_id = (select auth.uid()));
create policy "Reporters update their own cases" on public.grievances
  for update to authenticated using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));
create policy "Reporters remove their own cases" on public.grievances
  for delete to authenticated using (owner_id = (select auth.uid()));

-- app_metadata is assigned by the Auth administrator, never by the client.
create policy "Authorized operators manage cases" on public.grievances
  for all to authenticated
  using (
    (select auth.jwt())->'app_metadata'->>'grievance_admin' = 'true'
    and (select auth.jwt())->>'is_anonymous' = 'false'
  )
  with check (
    (select auth.jwt())->'app_metadata'->>'grievance_admin' = 'true'
    and (select auth.jwt())->>'is_anonymous' = 'false'
  );
