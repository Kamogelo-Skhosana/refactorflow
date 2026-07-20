alter table public.profiles
  add column if not exists avatar_url text;

alter table public.sessions
  add column if not exists user_id uuid references auth.users(id) on delete cascade;

alter table public.sessions
  alter column user_id set not null;

create index if not exists sessions_user_created_at_idx
  on public.sessions (user_id, created_at desc);
