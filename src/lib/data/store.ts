import { Goal, Task, Habit, HabitStreak, Milestone, WeeklyPlan, AiEval, AiRunWithEval, DailyCheckin, AiFeedback, AiFeedbackStats, AiOutcomeStats } from './types';

export interface DataStore {
    getOrCreateUser(userId: string): Promise<void>;
    
    getEnabledSectors(userId: string): Promise<string[]>;
    setEnabledSectors(userId: string, sectors: string[]): Promise<void>;
    
    createGoal(userId: string, title: string, deadline?: string | null): Promise<Goal>;
    listGoals(userId: string): Promise<Goal[]>;
    deleteGoal(userId: string, goalId: string): Promise<void>;
    
    createMilestone(userId: string, goalId: string, title: string, targetDateISO?: string | null, createdBy?: 'user'|'ai', sourceRunId?: string | null): Promise<Milestone>;
    listMilestones(userId: string, goalId: string): Promise<Milestone[]>;
    deleteMilestone(userId: string, milestoneId: string): Promise<void>;
    
    upsertWeeklyPlan(userId: string, goalId: string, weekStartISO: string, focus: string): Promise<void>;
    listWeeklyPlans(userId: string, goalId: string): Promise<WeeklyPlan[]>;
    
    createTask(userId: string, title: string, dueDateISO: string, goalId?: string, createdBy?: 'user'|'ai', sourceRunId?: string | null): Promise<Task>;
    linkTaskToGoal(userId: string, taskId: string, goalId: string): Promise<void>;
    listTasksForDate(userId: string, dateISO: string): Promise<Task[]>;
    toggleTask(userId: string, taskId: string, isCompleted: boolean): Promise<void>;
    rescheduleTask(userId: string, taskId: string, newDateISO: string): Promise<void>;
    deleteTask(userId: string, taskId: string): Promise<void>;
    
    createHabit(userId: string, title: string, frequency?: 'daily', createdBy?: 'user'|'ai', sourceRunId?: string | null): Promise<Habit>;
    listHabits(userId: string): Promise<Habit[]>;
    deleteHabit(userId: string, habitId: string): Promise<void>;
    completeHabit(userId: string, habitId: string, dateISO: string): Promise<void>;
    listHabitLogs(userId: string, habitId: string, fromISO: string, toISO: string): Promise<string[]>;
    getHabitStreaks(userId: string): Promise<HabitStreak[]>;
    
    logAiRun(userId: string, route: string, prompt: string, response: string, schemaValid: boolean, latencyMs: number, promptVersion?: string): Promise<string>;
    logAiEval(userId: string, runId: string, evalResult: Omit<AiEval, 'id' | 'user_id' | 'run_id' | 'created_at'>): Promise<void>;
    listAiRunsWithEvals(userId: string, limit?: number): Promise<AiRunWithEval[]>;

    // New methods
    getTodayCheckin(userId: string, dateISO: string): Promise<DailyCheckin | null>;
    upsertTodayCheckin(userId: string, dateISO: string, data: { topPriority: string; blockers?: string | null; energyLevel?: number | null }): Promise<DailyCheckin>;
    listRecentCheckins(userId: string, limit: number): Promise<DailyCheckin[]>;

    logAiFeedback(userId: string, runId: string, helpful: boolean, comment?: string | null): Promise<void>;
    getAiFeedbackStats(userId: string, lastNDays?: number): Promise<AiFeedbackStats>;
    
    getAiOutcomeStats(userId: string, lastNDays: number): Promise<AiOutcomeStats>;

    // Demo Mode
    seedDemoData(userId: string): Promise<void>;
}
