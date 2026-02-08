
-- AI Evaluations Table
create table ai_evals (
  id uuid default gen_random_uuid() primary key,
  run_id uuid, -- Intentionally nullable/loose reference to allow loose coupling if needed, but ideally FK
  user_id uuid not null references users(id),
  score_total int not null,
  schema_score int not null,
  sector_score int not null,
  usefulness_score int not null,
  efficiency_score int not null,
  violated_sector boolean default false,
  empty_actions boolean default false,
  reasons text, -- JSON string or simple text
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Optional: Index for faster lookups
create index idx_ai_evals_user_id on ai_evals(user_id);
create index idx_ai_evals_run_id on ai_evals(run_id);
