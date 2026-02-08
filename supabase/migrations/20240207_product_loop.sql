-- Migration for Product Loop Features
-- Created: 2026-02-07

-- 1. Daily Check-ins
CREATE TABLE IF NOT EXISTS daily_checkins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    checkin_date DATE NOT NULL,
    top_priority TEXT NOT NULL,
    blockers TEXT,
    energy_level INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, checkin_date)
);

-- 2. AI Feedback
CREATE TABLE IF NOT EXISTS ai_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    run_id UUID NOT NULL REFERENCES ai_runs(id) ON DELETE CASCADE,
    helpful BOOLEAN NOT NULL,
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. AI Run Extensions (Prompt Versioning)
ALTER TABLE ai_runs ADD COLUMN IF NOT EXISTS prompt_version TEXT;

-- 4. Tracking AI-Created Items
-- Tasks
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS created_by TEXT DEFAULT 'user'; -- 'user' or 'ai'
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS source_run_id UUID;

-- Habits
ALTER TABLE habits ADD COLUMN IF NOT EXISTS created_by TEXT DEFAULT 'user';
ALTER TABLE habits ADD COLUMN IF NOT EXISTS source_run_id UUID;

-- Milestones
ALTER TABLE milestones ADD COLUMN IF NOT EXISTS created_by TEXT DEFAULT 'user';
ALTER TABLE milestones ADD COLUMN IF NOT EXISTS source_run_id UUID;

-- 5. Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_daily_checkins_user_date ON daily_checkins(user_id, checkin_date);
CREATE INDEX IF NOT EXISTS idx_ai_feedback_run_id ON ai_feedback(run_id);
CREATE INDEX IF NOT EXISTS idx_tasks_created_by ON tasks(user_id, created_by);
CREATE INDEX IF NOT EXISTS idx_habits_created_by ON habits(user_id, created_by);
