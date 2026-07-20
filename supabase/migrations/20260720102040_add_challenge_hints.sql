alter table public.profiles
  add column if not exists nudges_enabled boolean not null default true;

create table if not exists public.challenge_hints (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid not null references public.challenges(id) on delete cascade,
  level smallint not null check (level between 1 and 3),
  content text not null check (char_length(content) between 1 and 1000),
  created_at timestamptz not null default now(),
  unique (challenge_id, level)
);

alter table public.challenge_hints enable row level security;
revoke all on table public.challenge_hints from anon, authenticated;

create table if not exists public.hints_used (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  challenge_id uuid not null references public.challenges(id) on delete cascade,
  hint_level smallint not null check (hint_level between 1 and 3),
  created_at timestamptz not null default now(),
  unique (user_id, challenge_id, hint_level)
);

alter table public.hints_used enable row level security;
drop policy if exists "Users can read their own hint activity" on public.hints_used;
create policy "Users can read their own hint activity"
on public.hints_used
for select
to authenticated
using ((select auth.uid()) = user_id);

create index if not exists hints_used_user_challenge_created_at_idx
  on public.hints_used (user_id, challenge_id, created_at desc);

insert into public.challenge_hints (challenge_id, level, content)
select challenges.id, seeded.level, seeded.content
from public.challenges as challenges
join (
  values
    ('pseudo-range', 1, 'First decide which values belong in the returned sequence.'),
    ('pseudo-range', 2, 'Python range stops before its upper bound, so think about how to include n.'),
    ('pseudo-range', 3, 'Build the result one value at a time and return the completed sequence.'),
    ('do-not-panic', 1, 'State the rule in plain language first: you only need to decide whether a sum is even.'),
    ('do-not-panic', 2, 'The sum from zero through n can be calculated without listing every number.'),
    ('do-not-panic', 3, 'Use the remainder after division by two to decide which boolean to return.'),
    ('countdown-even', 1, 'Identify the first even value to print and the direction the loop must travel.'),
    ('countdown-even', 2, 'A loop can count backwards when its step is negative.'),
    ('countdown-even', 3, 'Check the stopping boundary carefully so the final value is included only when required.'),
    ('check-password', 1, 'Break the password rule into smaller checks before combining them.'),
    ('check-password', 2, 'String methods can help you inspect case, digits, and character types.'),
    ('check-password', 3, 'Return the exact expected response after every condition has been evaluated.'),
    ('reverse-words', 1, 'Separate reversing the word order from reversing every character.'),
    ('reverse-words', 2, 'Split the sentence into individual words before you transform it.'),
    ('reverse-words', 3, 'Reverse the list of words, then join it back together with spaces.')
) as seeded(slug, level, content)
  on challenges.slug = seeded.slug
on conflict (challenge_id, level)
do update set content = excluded.content;
