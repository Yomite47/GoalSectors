-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Users Table
create table if not exists users (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Sectors Enabled
create table if not exists sectors_enabled (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) not null,
  sector text not null,
  enabled boolean default true,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, sector)
);

-- 3. Goals
create table if not exists goals (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) not null,
  title text not null,
  deadline date null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Milestones (Detailed)
create table if not exists milestones (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references users(id),
  goal_id uuid not null references goals(id) on delete cascade,
  title text not null,
  target_date date,
  completed boolean default false,
  created_at timestamptz default now()
);

-- 5. Weekly Plans
create table if not exists weekly_plans (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references users(id),
  goal_id uuid not null references goals(id) on delete cascade,
  week_start date not null,
  focus text not null,
  created_at timestamptz default now(),
  unique(user_id, goal_id, week_start)
);

-- 6. Tasks
create table if not exists tasks (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) not null,
  title text not null,
  due_date date null,
  status text default 'open',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. Task Logs
create table if not exists task_logs (
  id uuid primary key default uuid_generate_v4(),
  task_id uuid references tasks(id) on delete cascade not null,
  user_id uuid references users(id) not null,
  action text not null, -- created, completed, reopened
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 8. Habits
create table if not exists habits (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) not null,
  title text not null,
  frequency text default 'daily',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 9. Habit Logs
create table if not exists habit_logs (
  id uuid primary key default uuid_generate_v4(),
  habit_id uuid references habits(id) on delete cascade not null,
  user_id uuid references users(id) not null,
  done_date date not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(habit_id, done_date)
);

-- 10. AI Runs
create table if not exists ai_runs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) not null,
  route text not null,
  prompt text not null,
  response text not null,
  schema_valid boolean default true,
  latency_ms int default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 11. AI Evals
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
  reasons text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 12. Daily Check-ins
create table if not exists daily_checkins (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references users(id) not null,
    checkin_date date not null,
    top_priority text not null,
    blockers text,
    energy_level int,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(user_id, checkin_date)
);

-- Indexes for performance
create index if not exists idx_sectors_user on sectors_enabled(user_id);
create index if not exists idx_goals_user on goals(user_id);
create index if not exists idx_milestones_user on milestones(user_id);
create index if not exists idx_tasks_user on tasks(user_id);
create index if not exists idx_task_logs_user on task_logs(user_id);
create index if not exists idx_habits_user on habits(user_id);
create index if not exists idx_habit_logs_user on habit_logs(user_id);
create index if not exists idx_ai_runs_user on ai_runs(user_id);
create index if not exists idx_ai_evals_user_id on ai_evals(user_id);
create index if not exists idx_daily_checkins_user on daily_checkins(user_id);
