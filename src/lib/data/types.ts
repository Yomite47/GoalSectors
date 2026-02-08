export interface Goal {
    id: string;
    user_id: string;
    title: string;
    deadline: string | null;
    created_at: string;
}

export interface AiRun {
    id: string;
    user_id: string;
    route: string;
    prompt: string;
    response: string;
    schema_valid: boolean;
    latency_ms: number;
    created_at: string;
    prompt_version?: string; // New field
}

export interface AiEval {
    id: string;
    run_id: string | null;
    user_id: string;
    score_total: number;
    schema_score: number;
    sector_score: number;
    usefulness_score: number;
    efficiency_score: number;
    violated_sector: boolean;
    empty_actions: boolean;
    reasons: string; // JSON string
    created_at: string;
}

export interface AiRunWithEval extends AiRun {
    eval?: AiEval;
    feedback?: AiFeedback; // New field for convenience
}

export interface Task {
    id: string;
    user_id: string;
    title: string;
    due_date: string | null;
    status: 'open' | 'completed';
    created_at: string;
    goal_id?: string | null;
    created_by?: 'user' | 'ai'; // New field
    source_run_id?: string | null; // New field
}

export interface Habit {
    id: string;
    user_id: string;
    title: string;
    frequency: string;
    created_at: string;
    created_by?: 'user' | 'ai'; // New field
    source_run_id?: string | null; // New field
}

export interface HabitStreak {
    habitId: string;
    currentStreak: number;
    lastDoneDate: string | null;
}

export interface Milestone {
    id: string;
    user_id: string;
    goal_id: string;
    title: string;
    target_date: string | null;
    completed: boolean;
    created_at: string;
    created_by?: 'user' | 'ai'; // New field
    source_run_id?: string | null; // New field
}

export interface WeeklyPlan {
    id: string;
    user_id: string;
    goal_id: string;
    week_start: string; // YYYY-MM-DD
    focus: string;
    created_at: string;
}

// New Interfaces

export interface DailyCheckin {
    id: string;
    user_id: string;
    checkin_date: string; // YYYY-MM-DD
    top_priority: string;
    blockers: string | null;
    energy_level: number | null;
    created_at: string;
}

export interface AiFeedback {
    id: string;
    user_id: string;
    run_id: string;
    helpful: boolean;
    comment: string | null;
    created_at: string;
}

export interface AiOutcomeStats {
    aiCreated: number;
    completedWithin24h: number;
    completionRate: number;
}

export interface AiFeedbackStats {
    helpfulRate: number;
    total: number;
}
