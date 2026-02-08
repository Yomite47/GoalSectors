-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users Table
create table if not exists users (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Sectors Enabled
create table if not exists sectors_enabled (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) not null,
  sector text not null,
  enabled boolean default true,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, sector)
);

-- Goals
create table if not exists goals (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) not null,
  title text not null,
  deadline date null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Milestones
create table if not exists milestones (
  id uuid primary key default uuid_generate_v4(),
  goal_id uuid references goals(id) on delete cascade not null,
  user_id uuid references users(id) not null,
  title text not null,
  target_date date null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tasks
create table if not exists tasks (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) not null,
  title text not null,
  due_date date null,
  status text default 'open',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Task Logs
create table if not exists task_logs (
  id uuid primary key default uuid_generate_v4(),
  task_id uuid references tasks(id) on delete cascade not null,
  user_id uuid references users(id) not null,
  action text not null, -- created, completed, reopened
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habits
create table if not exists habits (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) not null,
  title text not null,
  frequency text default 'daily',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habit Logs
create table if not exists habit_logs (
  id uuid primary key default uuid_generate_v4(),
  habit_id uuid references habits(id) on delete cascade not null,
  user_id uuid references users(id) not null,
  done_date date not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(habit_id, done_date)
);

-- AI Runs
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

-- Indexes
create index if not exists idx_sectors_user on sectors_enabled(user_id);
create index if not exists idx_goals_user on goals(user_id);
create index if not exists idx_milestones_user on milestones(user_id);
create index if not exists idx_tasks_user on tasks(user_id);
create index if not exists idx_task_logs_user on task_logs(user_id);
create index if not exists idx_habits_user on habits(user_id);
create index if not exists idx_habit_logs_user on habit_logs(user_id);
create index if not exists idx_ai_runs_user on ai_runs(user_id);
