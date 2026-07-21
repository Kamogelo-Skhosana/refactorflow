grant select on table public.sessions to authenticated;
grant select on table public.metrics to authenticated;
grant insert on table public.profiles to authenticated;

create policy "Users can read their own sessions"
on public.sessions
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can read metrics for their sessions"
on public.metrics
for select
to authenticated
using (
  exists (
    select 1
    from public.sessions as session
    where session.id = metrics.session_id
      and session.user_id = (select auth.uid())
  )
);

create policy "Users can create their own profile"
on public.profiles
for insert
to authenticated
with check ((select auth.uid()) = id);