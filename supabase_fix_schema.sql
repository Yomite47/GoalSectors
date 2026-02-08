-- Fix missing columns for AI features

-- 1. Add prompt_version to ai_runs
ALTER TABLE ai_runs ADD COLUMN IF NOT EXISTS prompt_version TEXT;

-- 2. Add AI tracking to Tasks
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS created_by TEXT DEFAULT 'user';
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS source_run_id UUID;

-- 3. Add AI tracking to Habits
ALTER TABLE habits ADD COLUMN IF NOT EXISTS created_by TEXT DEFAULT 'user';
ALTER TABLE habits ADD COLUMN IF NOT EXISTS source_run_id UUID;

-- 4. Add AI tracking to Milestones
ALTER TABLE milestones ADD COLUMN IF NOT EXISTS created_by TEXT DEFAULT 'user';
ALTER TABLE milestones ADD COLUMN IF NOT EXISTS source_run_id UUID;

-- 5. Create AI Feedback table
CREATE TABLE IF NOT EXISTS ai_feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) NOT NULL,
    run_id UUID REFERENCES ai_runs(id) ON DELETE CASCADE NOT NULL,
    helpful BOOLEAN NOT NULL,
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_ai_feedback_run_id ON ai_feedback(run_id);
CREATE INDEX IF NOT EXISTS idx_tasks_created_by ON tasks(user_id, created_by);
CREATE INDEX IF NOT EXISTS idx_habits_created_by ON habits(user_id, created_by);
