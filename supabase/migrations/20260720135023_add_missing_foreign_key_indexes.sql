create index if not exists challenge_tests_challenge_id_idx
  on public.challenge_tests (challenge_id);

create index if not exists hints_used_challenge_id_idx
  on public.hints_used (challenge_id);

create index if not exists metrics_session_id_idx
  on public.metrics (session_id);

create index if not exists sessions_exercise_id_idx
  on public.sessions (exercise_id);
