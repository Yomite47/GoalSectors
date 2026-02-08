-- Create ai_evals table
create table if not exists ai_evals (
  id uuid default gen_random_uuid() primary key,
  run_id uuid references ai_runs(id) on delete cascade,
  user_id uuid references users(id) not null,
  score_total int not null,
  schema_score int not null,
  sector_score int not null,
  usefulness_score int not null,
  efficiency_score int not null,
  violated_sector boolean default false,
  empty_actions boolean default false,
  reasons text, -- JSON string or plain text
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Index for faster joins
create index if not exists ai_evals_run_id_idx on ai_evals(run_id);
create index if not exists ai_evals_user_id_idx on ai_evals(user_id);
