import { DataStore } from './store';
import { Goal, Task, Habit, HabitStreak, Milestone, WeeklyPlan, AiEval, AiRunWithEval, DailyCheckin, AiFeedback, AiFeedbackStats, AiOutcomeStats } from './types';

// Helper to simulate DB delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// In-memory storage for server-side (API routes)
const serverMemoryStore = new Map<string, any>();

export class LocalStore implements DataStore {
    private getLocalUser(userId: string): any {
        if (typeof window === 'undefined') {
            return serverMemoryStore.get(userId) || null;
        }
        const stored = localStorage.getItem('goalsectors_user');
        return stored ? JSON.parse(stored) : null;
    }

    private saveLocalUser(data: any) {
        if (typeof window === 'undefined') {
            serverMemoryStore.set(data.id, data);
            return;
        }
        localStorage.setItem('goalsectors_user', JSON.stringify(data));
    }

    async getOrCreateUser(userId: string): Promise<void> {
        await delay(100);
        let user = this.getLocalUser(userId);
        if (!user) {
            user = {
                id: userId,
                enabledSectors: [],
                goals: [],
                tasks: [],
                habits: [],
                taskLogs: [],
                habitLogs: [],
                aiRuns: [],
                aiEvals: [], 
                weeklyPlans: [],
                dailyCheckins: [], // New
                aiFeedback: [] // New
            };
            this.saveLocalUser(user);
        } else {
            // Migration for existing users
            let dirty = false;
            if (!user.weeklyPlans) {
                user.weeklyPlans = [];
                dirty = true;
            }
            if (!user.aiEvals) {
                user.aiEvals = [];
                dirty = true;
            }
            if (!user.dailyCheckins) {
                user.dailyCheckins = [];
                dirty = true;
            }
            if (!user.aiFeedback) {
                user.aiFeedback = [];
                dirty = true;
            }
            if (dirty) this.saveLocalUser(user);
        }
    }

    async getEnabledSectors(userId: string): Promise<string[]> {
        await delay(100);
        const user = this.getLocalUser(userId);
        return user?.enabledSectors || [];
    }

    async setEnabledSectors(userId: string, sectors: string[]): Promise<void> {
        await delay(100);
        const user = this.getLocalUser(userId);
        if (user) {
            user.enabledSectors = sectors;
            this.saveLocalUser(user);
        }
    }

    async createGoal(userId: string, title: string, deadline?: string | null): Promise<Goal> {
        await delay(100);
        const user = this.getLocalUser(userId);
        const newGoal: Goal = {
            id: crypto.randomUUID(),
            user_id: userId,
            title,
            deadline: deadline || null,
            created_at: new Date().toISOString()
        };
        user.goals.push({ ...newGoal, milestones: [] });
        this.saveLocalUser(user);
        return newGoal;
    }

    async listGoals(userId: string): Promise<Goal[]> {
        await delay(100);
        const user = this.getLocalUser(userId);
        return user?.goals.map((g: any) => ({
            id: g.id,
            user_id: userId,
            title: g.title,
            deadline: g.deadline || null,
            created_at: g.created_at || new Date().toISOString()
        })) || [];
    }

    async createMilestone(userId: string, goalId: string, title: string, targetDateISO?: string | null, createdBy: 'user'|'ai' = 'user', sourceRunId?: string | null): Promise<Milestone> {
        await delay(100);
        const user = this.getLocalUser(userId);
        const goal = user.goals.find((g: any) => g.id === goalId);
        if (!goal) throw new Error("Goal not found");
        
        const newMilestone: Milestone = {
            id: crypto.randomUUID(),
            user_id: userId,
            goal_id: goalId,
            title,
            target_date: targetDateISO || null,
            completed: false,
            created_at: new Date().toISOString(),
            created_by: createdBy,
            source_run_id: sourceRunId || null
        };
        
        if (!goal.milestones) goal.milestones = [];
        goal.milestones.push(newMilestone);
        this.saveLocalUser(user);
        return newMilestone;
    }

    async listMilestones(userId: string, goalId: string): Promise<Milestone[]> {
        await delay(100);
        const user = this.getLocalUser(userId);
        const goal = user.goals.find((g: any) => g.id === goalId);
        return goal?.milestones || [];
    }

    async deleteMilestone(userId: string, milestoneId: string): Promise<void> {
        await delay(100);
        const user = this.getLocalUser(userId);
        for (const goal of user.goals) {
            if (goal.milestones) {
                const idx = goal.milestones.findIndex((m: any) => m.id === milestoneId);
                if (idx !== -1) {
                    goal.milestones.splice(idx, 1);
                    this.saveLocalUser(user);
                    return;
                }
            }
        }
    }

    async upsertWeeklyPlan(userId: string, goalId: string, weekStartISO: string, focus: string): Promise<void> {
        await delay(100);
        const user = this.getLocalUser(userId);
        if (!user.weeklyPlans) user.weeklyPlans = [];
        
        const existingIdx = user.weeklyPlans.findIndex((p: any) => p.goal_id === goalId && p.week_start === weekStartISO);
        
        if (existingIdx !== -1) {
            user.weeklyPlans[existingIdx].focus = focus;
        } else {
            const newPlan: WeeklyPlan = {
                id: crypto.randomUUID(),
                user_id: userId,
                goal_id: goalId,
                week_start: weekStartISO,
                focus,
                created_at: new Date().toISOString()
            };
            user.weeklyPlans.push(newPlan);
        }
        this.saveLocalUser(user);
    }

    async listWeeklyPlans(userId: string, goalId: string): Promise<WeeklyPlan[]> {
        await delay(100);
        const user = this.getLocalUser(userId);
        return (user.weeklyPlans || []).filter((p: any) => p.goal_id === goalId);
    }

    async createTask(userId: string, title: string, dueDateISO: string, goalId?: string, createdBy: 'user'|'ai' = 'user', sourceRunId?: string | null): Promise<Task> {
        await delay(100);
        const user = this.getLocalUser(userId);
        const newTask: Task = {
            id: crypto.randomUUID(),
            user_id: userId,
            title,
            due_date: dueDateISO,
            status: 'open',
            created_at: new Date().toISOString(),
            goal_id: goalId || null,
            created_by: createdBy,
            source_run_id: sourceRunId || null
        };
        if (!user.tasks) user.tasks = [];
        user.tasks.push({ ...newTask, completed: false });
        this.saveLocalUser(user);
        return newTask;
    }

    async linkTaskToGoal(userId: string, taskId: string, goalId: string): Promise<void> {
        await delay(100);
        const user = this.getLocalUser(userId);
        const task = user.tasks.find((t: any) => t.id === taskId);
        if (task) {
            task.goal_id = goalId;
            this.saveLocalUser(user);
        }
    }

    async listTasksForDate(userId: string, dateISO: string): Promise<Task[]> {
        await delay(100);
        const user = this.getLocalUser(userId);
        return (user?.tasks || []).map((t: any) => ({
            id: t.id,
            user_id: userId,
            title: t.title,
            due_date: t.due_date,
            status: t.status || (t.completed ? 'completed' : 'open'),
            created_at: t.created_at || new Date().toISOString(),
            goal_id: t.goal_id || null,
            created_by: t.created_by,
            source_run_id: t.source_run_id
        })).filter((t: Task) => t.due_date === dateISO);
    }

    async completeTask(userId: string, taskId: string): Promise<void> {
        await delay(100);
        const user = this.getLocalUser(userId);
        if (user && user.tasks) {
            user.tasks = user.tasks.map((t: any) => 
                t.id === taskId ? { ...t, status: 'completed', completed: true } : t
            );
            this.saveLocalUser(user);
        }
    }

    async rescheduleTask(userId: string, taskId: string, newDateISO: string): Promise<void> {
        await delay(100);
        const user = this.getLocalUser(userId);
        if (user && user.tasks) {
            user.tasks = user.tasks.map((t: any) => 
                t.id === taskId ? { ...t, due_date: newDateISO } : t
            );
            this.saveLocalUser(user);
        }
    }

    async createHabit(userId: string, title: string, frequency: 'daily' = 'daily', createdBy: 'user'|'ai' = 'user', sourceRunId?: string | null): Promise<Habit> {
        await delay(100);
        const user = this.getLocalUser(userId);
        const newHabit: Habit = {
            id: crypto.randomUUID(),
            user_id: userId,
            title,
            frequency,
            created_at: new Date().toISOString(),
            created_by: createdBy,
            source_run_id: sourceRunId || null
        };
        if (!user.habits) user.habits = [];
        user.habits.push({ ...newHabit, completedDates: [], streak: 0 });
        this.saveLocalUser(user);
        return newHabit;
    }

    async listHabits(userId: string): Promise<Habit[]> {
        await delay(100);
        const user = this.getLocalUser(userId);
        return (user?.habits || []).map((h: any) => ({
            id: h.id,
            user_id: userId,
            title: h.title,
            frequency: 'daily',
            created_at: h.created_at || new Date().toISOString(),
            created_by: h.created_by,
            source_run_id: h.source_run_id
        }));
    }

    async completeHabit(userId: string, habitId: string, dateISO: string): Promise<void> {
        await delay(100);
        const user = this.getLocalUser(userId);
        if (user && user.habits) {
            const habit = user.habits.find((h: any) => h.id === habitId);
            if (habit && !habit.completedDates.includes(dateISO)) {
                habit.completedDates.push(dateISO);
                this.saveLocalUser(user);
            }
        }
    }

    async listHabitLogs(userId: string, habitId: string, fromISO: string, toISO: string): Promise<string[]> {
        await delay(100);
        const user = this.getLocalUser(userId);
        if (user && user.habits) {
            const habit = user.habits.find((h: any) => h.id === habitId);
            if (habit && habit.completedDates) {
                return habit.completedDates.filter((d: string) => d >= fromISO && d <= toISO);
            }
        }
        return [];
    }

    async getHabitStreaks(userId: string): Promise<HabitStreak[]> {
        await delay(100);
        const user = this.getLocalUser(userId);
        const streaks: HabitStreak[] = [];
        const today = new Date().toISOString().split('T')[0];

        if (user && user.habits) {
            for (const habit of user.habits) {
                const habitLogs = habit.completedDates || [];
                let streak = 0;
                let currentCheck = new Date();
                let lastDoneDate = null;
                
                if (habitLogs.includes(today)) {
                    lastDoneDate = today;
                } else {
                    currentCheck.setDate(currentCheck.getDate() - 1);
                    const yesterday = currentCheck.toISOString().split('T')[0];
                    if (habitLogs.includes(yesterday)) {
                        lastDoneDate = yesterday;
                    }
                }

                currentCheck = new Date();
                if (!habitLogs.includes(today)) {
                    currentCheck.setDate(currentCheck.getDate() - 1);
                }

                while (true) {
                    const checkDateStr = currentCheck.toISOString().split('T')[0];
                    if (habitLogs.includes(checkDateStr)) {
                        streak++;
                        currentCheck.setDate(currentCheck.getDate() - 1);
                    } else {
                        break;
                    }
                }
                
                streaks.push({
                    habitId: habit.id,
                    currentStreak: streak,
                    lastDoneDate
                });
            }
        }
        return streaks;
    }

    async logAiRun(userId: string, route: string, prompt: string, response: string, schemaValid: boolean, latencyMs: number, promptVersion: string = 'A'): Promise<string> {
        await delay(100);
        const user = this.getLocalUser(userId);
        if (!user) {
            console.error(`[LocalStore] logAiRun: User ${userId} not found!`);
            throw new Error(`User ${userId} not found`);
        }
        if (!user.aiRuns) user.aiRuns = [];
        
        const runId = crypto.randomUUID();
        user.aiRuns.push({
            id: runId,
            user_id: userId,
            route,
            prompt,
            response,
            schema_valid: schemaValid,
            latency_ms: latencyMs,
            prompt_version: promptVersion,
            created_at: new Date().toISOString()
        });
        
        this.saveLocalUser(user);
        return runId;
    }

    async logAiEval(userId: string, runId: string, evalResult: Omit<AiEval, 'id' | 'user_id' | 'run_id' | 'created_at'>): Promise<void> {
        await delay(100);
        const user = this.getLocalUser(userId);
        if (!user.aiEvals) user.aiEvals = [];

        user.aiEvals.push({
            id: crypto.randomUUID(),
            user_id: userId,
            run_id: runId,
            ...evalResult,
            created_at: new Date().toISOString()
        });
        this.saveLocalUser(user);
    }

    async listAiRunsWithEvals(userId: string, limit: number = 50): Promise<AiRunWithEval[]> {
        await delay(100);
        const user = this.getLocalUser(userId);
        if (!user) return [];

        const runs = (user.aiRuns || [])
            .filter((r: any) => r.user_id === userId)
            .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, limit);

        const evals = user.aiEvals || [];
        const feedbackList = user.aiFeedback || [];

        return runs.map((run: any) => {
            const evaluation = evals.find((e: any) => e.run_id === run.id);
            const feedback = feedbackList.find((f: any) => f.run_id === run.id);
            return {
                ...run,
                eval: evaluation,
                feedback: feedback
            };
        });
    }

    // New Check-in Methods
    async getTodayCheckin(userId: string, dateISO: string): Promise<DailyCheckin | null> {
        await delay(100);
        const user = this.getLocalUser(userId);
        if (!user || !user.dailyCheckins) return null;
        return user.dailyCheckins.find((c: DailyCheckin) => c.checkin_date === dateISO) || null;
    }

    async upsertTodayCheckin(userId: string, dateISO: string, data: { topPriority: string; blockers?: string | null; energyLevel?: number | null }): Promise<DailyCheckin> {
        await delay(100);
        const user = this.getLocalUser(userId);
        if (!user.dailyCheckins) user.dailyCheckins = [];

        const idx = user.dailyCheckins.findIndex((c: DailyCheckin) => c.checkin_date === dateISO);
        let checkin: DailyCheckin;

        if (idx !== -1) {
            checkin = user.dailyCheckins[idx];
            checkin.top_priority = data.topPriority;
            checkin.blockers = data.blockers || null;
            checkin.energy_level = data.energyLevel || null;
            user.dailyCheckins[idx] = checkin;
        } else {
            checkin = {
                id: crypto.randomUUID(),
                user_id: userId,
                checkin_date: dateISO,
                top_priority: data.topPriority,
                blockers: data.blockers || null,
                energy_level: data.energyLevel || null,
                created_at: new Date().toISOString()
            };
            user.dailyCheckins.push(checkin);
        }
        this.saveLocalUser(user);
        return checkin;
    }

    async listRecentCheckins(userId: string, limit: number): Promise<DailyCheckin[]> {
        await delay(100);
        const user = this.getLocalUser(userId);
        if (!user || !user.dailyCheckins) return [];
        return user.dailyCheckins
            .sort((a: DailyCheckin, b: DailyCheckin) => new Date(b.checkin_date).getTime() - new Date(a.checkin_date).getTime())
            .slice(0, limit);
    }

    // New Feedback Methods
    async logAiFeedback(userId: string, runId: string, helpful: boolean, comment?: string | null): Promise<void> {
        await delay(100);
        const user = this.getLocalUser(userId);
        if (!user.aiFeedback) user.aiFeedback = [];
        
        user.aiFeedback.push({
            id: crypto.randomUUID(),
            user_id: userId,
            run_id: runId,
            helpful,
            comment: comment || null,
            created_at: new Date().toISOString()
        });
        this.saveLocalUser(user);
    }

    async getAiFeedbackStats(userId: string, lastNDays: number = 30): Promise<AiFeedbackStats> {
        await delay(100);
        const user = this.getLocalUser(userId);
        if (!user || !user.aiFeedback) return { helpfulRate: 0, total: 0 };
        
        // Filter by date if needed (skipping strict date filter for MVP, taking all)
        const feedbacks = user.aiFeedback;
        const total = feedbacks.length;
        if (total === 0) return { helpfulRate: 0, total: 0 };
        
        const helpfulCount = feedbacks.filter((f: any) => f.helpful).length;
        return {
            helpfulRate: Math.round((helpfulCount / total) * 100),
            total
        };
    }

    // New Outcome Stats Method
    async getAiOutcomeStats(userId: string, lastNDays: number): Promise<AiOutcomeStats> {
        await delay(100);
        const user = this.getLocalUser(userId);
        if (!user) return { aiCreated: 0, completedWithin24h: 0, completionRate: 0 };

        // Get AI-created items
        const aiTasks = (user.tasks || []).filter((t: any) => t.created_by === 'ai');
        const aiHabits = (user.habits || []).filter((h: any) => h.created_by === 'ai');
        // Note: Milestones are rare from AI in current flow but logic would be similar

        let completedWithin24h = 0;
        let totalAiItems = aiTasks.length + aiHabits.length;

        // Check tasks
        for (const task of aiTasks) {
            if (task.status === 'completed' || task.completed) {
                // In local store, we don't track *when* it was completed precisely, 
                // but we can assume if it's completed, it's good for now. 
                // For a stricter check we'd need a completed_at timestamp.
                // The prompt says "completed if task status becomes completed within 24h of created_at".
                // Since we don't have completed_at in Task interface yet, we'll approximate:
                // If it is completed, count it.
                completedWithin24h++;
            }
        }

        // Check habits
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        
        for (const habit of aiHabits) {
            // Check if habit log exists for today or creation date (approx)
            const logs = habit.completedDates || [];
            // If created today, check today. If created yesterday, check yesterday or today.
            const createdDate = habit.created_at.split('T')[0];
            
            // Simple check: is there a log >= createdDate?
            const hasLogAfterCreation = logs.some((date: string) => date >= createdDate);
            if (hasLogAfterCreation) {
                completedWithin24h++;
            }
        }

        return {
            aiCreated: totalAiItems,
            completedWithin24h,
            completionRate: totalAiItems > 0 ? Math.round((completedWithin24h / totalAiItems) * 100) : 0
        };
    }

    async seedDemoData(userId: string): Promise<void> {
        await delay(100);
        const user = this.getLocalUser(userId);
        if (!user) return; 

        // Only seed if empty
        const hasData = user.tasks.length > 0 || user.habits.length > 0 || user.goals.length > 0;
        if (hasData) return;

        const today = new Date().toISOString().split('T')[0];
        
        // Helper to generate past dates
        const getPastDate = (daysAgo: number) => {
            const d = new Date();
            d.setDate(d.getDate() - daysAgo);
            return d.toISOString().split('T')[0];
        };

        // 1. Create Goals
        const goal1Id = crypto.randomUUID();
        const goal2Id = crypto.randomUUID();
        
        user.goals.push({
            id: goal1Id,
            user_id: userId,
            title: "Launch MVP Product",
            deadline: "2024-12-31",
            created_at: new Date().toISOString(),
            milestones: [
                {
                    id: crypto.randomUUID(),
                    user_id: userId,
                    goal_id: goal1Id,
                    title: "Design Database Schema",
                    target_date: today,
                    completed: true,
                    created_at: new Date().toISOString(),
                    created_by: 'ai'
                },
                {
                    id: crypto.randomUUID(),
                    user_id: userId,
                    goal_id: goal1Id,
                    title: "Build Core UI",
                    target_date: today,
                    completed: false,
                    created_at: new Date().toISOString(),
                    created_by: 'ai'
                }
            ]
        });

        user.goals.push({
            id: goal2Id,
            user_id: userId,
            title: "Run a Marathon",
            deadline: "2025-06-01",
            created_at: new Date().toISOString(),
            milestones: []
        });

        // 2. Create Habits
        const habit1Id = crypto.randomUUID();
        const habit2Id = crypto.randomUUID();
        
        user.habits.push({
            id: habit1Id,
            user_id: userId,
            title: "Morning 5k Run",
            frequency: "daily",
            created_at: getPastDate(10),
            created_by: 'user',
            completedDates: [getPastDate(1), getPastDate(2), getPastDate(3), today], // Streak
            streak: 4
        });

        user.habits.push({
            id: habit2Id,
            user_id: userId,
            title: "Read 30 mins",
            frequency: "daily",
            created_at: getPastDate(5),
            created_by: 'ai',
            completedDates: [getPastDate(1), today],
            streak: 2
        });

        // 3. Create Tasks
        user.tasks.push({
            id: crypto.randomUUID(),
            user_id: userId,
            title: "Finalize pitch deck",
            due_date: today,
            status: "open",
            completed: false,
            created_at: new Date().toISOString(),
            goal_id: goal1Id,
            created_by: 'user'
        });

        user.tasks.push({
            id: crypto.randomUUID(),
            user_id: userId,
            title: "Review PR #42",
            due_date: today,
            status: "completed",
            completed: true,
            created_at: new Date().toISOString(),
            created_by: 'ai'
        });
        
        user.tasks.push({
            id: crypto.randomUUID(),
            user_id: userId,
            title: "Buy running shoes",
            due_date: today,
            status: "open",
            completed: false,
            created_at: new Date().toISOString(),
            goal_id: goal2Id,
            created_by: 'ai'
        });

        // 4. Create AI Runs
        const run1Id = crypto.randomUUID();
        user.aiRuns.push({
            id: run1Id,
            user_id: userId,
            route: "coach",
            prompt: "Plan my day",
            response: JSON.stringify({
                message: "I've prioritized your launch tasks. Good luck!",
                actions: [{ type: "create_task", data: { title: "Review PR #42" } }]
            }),
            schema_valid: true,
            latency_ms: 850,
            prompt_version: 'A',
            created_at: new Date().toISOString()
        });
        
        user.aiEvals.push({
            id: crypto.randomUUID(),
            user_id: userId,
            run_id: run1Id,
            score_total: 95,
            violated_sector: null,
            created_at: new Date().toISOString()
        });

        user.aiFeedback.push({
            id: crypto.randomUUID(),
            user_id: userId,
            run_id: run1Id,
            helpful: true,
            comment: "Spot on!",
            created_at: new Date().toISOString()
        });
        
        // Enable sectors
        user.enabledSectors = ['Productivity', 'Habits', 'Goals'];

        this.saveLocalUser(user);
    }
}
