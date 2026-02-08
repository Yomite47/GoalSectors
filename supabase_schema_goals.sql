-- Goals Sector Schema

-- 1. Milestones
-- Stores sub-tasks/milestones for a specific goal
create table if not exists milestones (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references users(id),
  goal_id uuid not null references goals(id) on delete cascade,
  title text not null,
  target_date date,
  completed boolean default false,
  created_at timestamptz default now()
);

-- Enable RLS for milestones
alter table milestones enable row level security;

create policy "Users can view their own milestones"
  on milestones for select
  using (auth.uid() = user_id);

create policy "Users can insert their own milestones"
  on milestones for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own milestones"
  on milestones for update
  using (auth.uid() = user_id);

create policy "Users can delete their own milestones"
  on milestones for delete
  using (auth.uid() = user_id);


-- 2. Weekly Plans
-- Stores weekly focus text for a specific goal
create table if not exists weekly_plans (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references users(id),
  goal_id uuid not null references goals(id) on delete cascade,
  week_start date not null,
  focus text not null,
  created_at timestamptz default now(),
  -- Ensure one plan per goal per week
  unique(user_id, goal_id, week_start)
);

-- Enable RLS for weekly_plans
alter table weekly_plans enable row level security;

create policy "Users can view their own weekly plans"
  on weekly_plans for select
  using (auth.uid() = user_id);

create policy "Users can insert their own weekly plans"
  on weekly_plans for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own weekly plans"
  on weekly_plans for update
  using (auth.uid() = user_id);

create policy "Users can delete their own weekly plans"
  on weekly_plans for delete
  using (auth.uid() = user_id);
