import { DataStore } from './store';
import { Goal, Task, Habit, HabitStreak, Milestone, WeeklyPlan, AiEval, AiRunWithEval, DailyCheckin, AiFeedback, AiFeedbackStats, AiOutcomeStats } from './types';
import { supabase } from '../supabaseClient';

export class SupabaseStore implements DataStore {
    async getOrCreateUser(userId: string): Promise<void> {
        if (!supabase) throw new Error('Supabase client not initialized');
        
        const { data, error } = await supabase
            .from('users')
            .select('id')
            .eq('id', userId)
            .maybeSingle();

        if (!data) {
            await supabase.from('users').insert({ id: userId });
        }
    }

    async getEnabledSectors(userId: string): Promise<string[]> {
        if (!supabase) throw new Error('Supabase client not initialized');
        
        const { data } = await supabase
            .from('sectors_enabled')
            .select('sector')
            .eq('user_id', userId)
            .eq('enabled', true);
            
        return data ? data.map((row: any) => row.sector) : [];
    }

    async setEnabledSectors(userId: string, sectors: string[]): Promise<void> {
        if (!supabase) throw new Error('Supabase client not initialized');
        
        // Disable all first (simplified approach, better would be upsert/diff)
        await supabase
            .from('sectors_enabled')
            .update({ enabled: false })
            .eq('user_id', userId);

        // Upsert new ones
        const rows = sectors.map(sector => ({
            user_id: userId,
            sector,
            enabled: true,
            updated_at: new Date().toISOString()
        }));

        await supabase.from('sectors_enabled').upsert(rows, { onConflict: 'user_id, sector' });
    }

    async createGoal(userId: string, title: string, deadline?: string | null): Promise<Goal> {
        if (!supabase) throw new Error('Supabase client not initialized');
        
        const { data, error } = await supabase
            .from('goals')
            .insert({ user_id: userId, title, deadline })
            .select()
            .single();
            
        if (error) throw error;
        return data as Goal;
    }

    async listGoals(userId: string): Promise<Goal[]> {
        if (!supabase) throw new Error('Supabase client not initialized');
        
        const { data } = await supabase
            .from('goals')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });
            
        return (data || []) as Goal[];
    }

    async createMilestone(userId: string, goalId: string, title: string, targetDateISO?: string | null, createdBy: 'user'|'ai' = 'user', sourceRunId?: string | null): Promise<Milestone> {
        if (!supabase) throw new Error('Supabase client not initialized');
        
        const payload: any = { 
            user_id: userId, 
            goal_id: goalId, 
            title, 
            target_date: targetDateISO
        };

        if (createdBy && createdBy !== 'user') payload.created_by = createdBy;
        if (sourceRunId) payload.source_run_id = sourceRunId;
        
        const { data, error } = await supabase
            .from('milestones')
            .insert(payload)
            .select()
            .single();
            
        if (error) throw error;
        return data as Milestone;
    }

    async listMilestones(userId: string, goalId: string): Promise<Milestone[]> {
        if (!supabase) throw new Error('Supabase client not initialized');
        
        const { data } = await supabase
            .from('milestones')
            .select('*')
            .eq('user_id', userId)
            .eq('goal_id', goalId)
            .order('target_date', { ascending: true });
            
        return (data || []) as Milestone[];
    }

    async deleteMilestone(userId: string, milestoneId: string): Promise<void> {
        if (!supabase) throw new Error('Supabase client not initialized');
        await supabase.from('milestones').delete().eq('id', milestoneId).eq('user_id', userId);
    }

    async deleteGoal(userId: string, goalId: string): Promise<void> {
        if (!supabase) throw new Error('Supabase client not initialized');
        await supabase.from('goals').delete().eq('id', goalId).eq('user_id', userId);
    }

    async upsertWeeklyPlan(userId: string, goalId: string, weekStartISO: string, focus: string): Promise<void> {
        if (!supabase) throw new Error('Supabase client not initialized');
        
        await supabase.from('weekly_plans').upsert({
            user_id: userId,
            goal_id: goalId,
            week_start: weekStartISO,
            focus,
            updated_at: new Date().toISOString()
        }, { onConflict: 'user_id, goal_id, week_start' });
    }

    async listWeeklyPlans(userId: string, goalId: string): Promise<WeeklyPlan[]> {
        if (!supabase) throw new Error('Supabase client not initialized');
        
        const { data } = await supabase
            .from('weekly_plans')
            .select('*')
            .eq('user_id', userId)
            .eq('goal_id', goalId)
            .order('week_start', { ascending: false });
            
        return (data || []) as WeeklyPlan[];
    }

    async createTask(userId: string, title: string, dueDateISO: string, goalId?: string, createdBy: 'user'|'ai' = 'user', sourceRunId?: string | null): Promise<Task> {
        if (!supabase) throw new Error('Supabase client not initialized');
        
        // Construct payload dynamically to avoid sending fields that might not exist in older schema versions
        const payload: any = { 
            user_id: userId, 
            title, 
            due_date: dueDateISO, 
            goal_id: goalId || null
        };

        // Only add these if they are relevant/non-default to be safe with schema
        if (createdBy && createdBy !== 'user') payload.created_by = createdBy;
        if (sourceRunId) payload.source_run_id = sourceRunId;

        const { data, error } = await supabase
            .from('tasks')
            .insert(payload)
            .select()
            .single();
            
        if (error) throw error;
        return data as Task;
    }

    async linkTaskToGoal(userId: string, taskId: string, goalId: string): Promise<void> {
        if (!supabase) throw new Error('Supabase client not initialized');
        await supabase.from('tasks').update({ goal_id: goalId }).eq('id', taskId).eq('user_id', userId);
    }

    async listTasksForDate(userId: string, dateISO: string): Promise<Task[]> {
        if (!supabase) throw new Error('Supabase client not initialized');
        
        const { data } = await supabase
            .from('tasks')
            .select('*')
            .eq('user_id', userId)
            .eq('due_date', dateISO)
            .order('created_at', { ascending: true });
            
        return (data || []) as Task[];
    }

    async toggleTask(userId: string, taskId: string, isCompleted: boolean): Promise<void> {
        if (!supabase) throw new Error('Supabase client not initialized');
        await supabase.from('tasks').update({ status: isCompleted ? 'completed' : 'open' }).eq('id', taskId).eq('user_id', userId);
    }

    async rescheduleTask(userId: string, taskId: string, newDateISO: string): Promise<void> {
        if (!supabase) throw new Error('Supabase client not initialized');
        await supabase.from('tasks').update({ due_date: newDateISO }).eq('id', taskId).eq('user_id', userId);
    }

    async deleteTask(userId: string, taskId: string): Promise<void> {
        if (!supabase) throw new Error('Supabase client not initialized');
        await supabase.from('tasks').delete().eq('id', taskId).eq('user_id', userId);
    }

    async createHabit(userId: string, title: string, frequency: 'daily' = 'daily', createdBy: 'user'|'ai' = 'user', sourceRunId?: string | null): Promise<Habit> {
        if (!supabase) throw new Error('Supabase client not initialized');
        
        const payload: any = { 
            user_id: userId, 
            title, 
            frequency
        };

        if (createdBy && createdBy !== 'user') payload.created_by = createdBy;
        if (sourceRunId) payload.source_run_id = sourceRunId;
        
        const { data, error } = await supabase
            .from('habits')
            .insert(payload)
            .select()
            .single();
            
        if (error) throw error;
        return data as Habit;
    }

    async listHabits(userId: string): Promise<Habit[]> {
        if (!supabase) throw new Error('Supabase client not initialized');
        
        const { data } = await supabase
            .from('habits')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: true });
            
        return (data || []) as Habit[];
    }

    async deleteHabit(userId: string, habitId: string): Promise<void> {
        if (!supabase) throw new Error('Supabase client not initialized');
        await supabase.from('habits').delete().eq('id', habitId).eq('user_id', userId);
    }

    async completeHabit(userId: string, habitId: string, dateISO: string): Promise<void> {
        if (!supabase) throw new Error('Supabase client not initialized');
        
        // Check if already exists
        const { data } = await supabase
            .from('habit_logs')
            .select('id')
            .eq('habit_id', habitId)
            .eq('done_date', dateISO)
            .maybeSingle();
            
        if (!data) {
            await supabase
                .from('habit_logs')
                .insert({ habit_id: habitId, done_date: dateISO, user_id: userId });
        }
    }

    async listHabitLogs(userId: string, habitId: string, fromISO: string, toISO: string): Promise<string[]> {
        if (!supabase) throw new Error('Supabase client not initialized');
        
        const { data } = await supabase
            .from('habit_logs')
            .select('done_date')
            .eq('habit_id', habitId)
            .gte('done_date', fromISO)
            .lte('done_date', toISO);
            
        return (data || []).map((row: any) => row.done_date);
    }

    async getHabitStreaks(userId: string): Promise<HabitStreak[]> {
        if (!supabase) throw new Error('Supabase client not initialized');
        // Simplified: Supabase implementation would need complex query or client-side calculation
        // For now returning empty or client-side calc
        const habits = await this.listHabits(userId);
        const streaks: HabitStreak[] = [];
        
        for (const habit of habits) {
             const { data: logs } = await supabase
                .from('habit_logs')
                .select('done_date')
                .eq('habit_id', habit.id)
                .order('done_date', { ascending: false });
             
             // ... Logic same as LocalStore ...
             streaks.push({ habitId: habit.id, currentStreak: 0, lastDoneDate: null });
        }
        return streaks;
    }

    async logAiRun(userId: string, route: string, prompt: string, response: string, schemaValid: boolean, latencyMs: number, promptVersion: string = 'A'): Promise<string> {
        if (!supabase) throw new Error('Supabase client not initialized');
        
        const { data, error } = await supabase
            .from('ai_runs')
            .insert({
                user_id: userId,
                route,
                prompt,
                response,
                schema_valid: schemaValid,
                latency_ms: latencyMs,
                prompt_version: promptVersion
            })
            .select('id')
            .single();
            
        if (error) throw error;
        return data.id;
    }

    async logAiEval(userId: string, runId: string, evalResult: Omit<AiEval, 'id' | 'user_id' | 'run_id' | 'created_at'>): Promise<void> {
        if (!supabase) throw new Error('Supabase client not initialized');
        
        await supabase
            .from('ai_evals')
            .insert({
                user_id: userId,
                run_id: runId,
                ...evalResult
            });
    }

    async listAiRunsWithEvals(userId: string, limit: number = 50): Promise<AiRunWithEval[]> {
        if (!supabase) throw new Error('Supabase client not initialized');

        const { data: runs } = await supabase
            .from('ai_runs')
            .select('*, ai_evals(*), ai_feedback(*)')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (!runs) return [];

        return runs.map((r: any) => ({
            ...r,
            eval: r.ai_evals?.[0] || undefined,
            feedback: r.ai_feedback?.[0] || undefined
        }));
    }

    async getTodayCheckin(userId: string, dateISO: string): Promise<DailyCheckin | null> {
        if (!supabase) throw new Error('Supabase client not initialized');
        
        const { data } = await supabase
            .from('daily_checkins')
            .select('*')
            .eq('user_id', userId)
            .eq('checkin_date', dateISO)
            .maybeSingle();
            
        return data as DailyCheckin | null;
    }

    async upsertTodayCheckin(userId: string, dateISO: string, data: { topPriority: string; blockers?: string | null; energyLevel?: number | null }): Promise<DailyCheckin> {
        if (!supabase) throw new Error('Supabase client not initialized');
        
        const { data: result, error } = await supabase
            .from('daily_checkins')
            .upsert({
                user_id: userId,
                checkin_date: dateISO,
                top_priority: data.topPriority,
                blockers: data.blockers,
                energy_level: data.energyLevel
            }, { onConflict: 'user_id, checkin_date' })
            .select()
            .single();
            
        if (error) throw error;
        return result as DailyCheckin;
    }

    async listRecentCheckins(userId: string, limit: number): Promise<DailyCheckin[]> {
        if (!supabase) throw new Error('Supabase client not initialized');
        
        const { data } = await supabase
            .from('daily_checkins')
            .select('*')
            .eq('user_id', userId)
            .order('checkin_date', { ascending: false })
            .limit(limit);
            
        return (data || []) as DailyCheckin[];
    }

    async logAiFeedback(userId: string, runId: string, helpful: boolean, comment?: string | null): Promise<void> {
        if (!supabase) throw new Error('Supabase client not initialized');
        
        await supabase
            .from('ai_feedback')
            .insert({
                user_id: userId,
                run_id: runId,
                helpful,
                comment
            });
    }

    async getAiFeedbackStats(userId: string, lastNDays: number = 30): Promise<AiFeedbackStats> {
        if (!supabase) throw new Error('Supabase client not initialized');
        
        // This is a bit complex for a simple query, might need RPC or client-side calculation
        const { data } = await supabase
            .from('ai_feedback')
            .select('helpful')
            .eq('user_id', userId)
            // .gte('created_at', ...) // Skip date for now
            
        if (!data || data.length === 0) return { helpfulRate: 0, total: 0 };
        
        const helpfulCount = data.filter((row: any) => row.helpful).length;
        return {
            helpfulRate: Math.round((helpfulCount / data.length) * 100),
            total: data.length
        };
    }

    async getAiOutcomeStats(userId: string, lastNDays: number): Promise<AiOutcomeStats> {
        if (!supabase) throw new Error('Supabase client not initialized');
        
        // Simplified implementation: Fetch AI tasks/habits and check status
        const { data: tasks } = await supabase
            .from('tasks')
            .select('status, created_at')
            .eq('user_id', userId)
            .eq('created_by', 'ai');
            
        const { data: habits } = await supabase
            .from('habits')
            .select('id, created_at')
            .eq('user_id', userId)
            .eq('created_by', 'ai');

        let completedWithin24h = 0;
        let total = (tasks?.length || 0) + (habits?.length || 0);

        if (tasks) {
            tasks.forEach((t: any) => {
                if (t.status === 'completed') completedWithin24h++;
            });
        }
        
        // For habits, we'd need to query logs... skipping for Supabase implementation brevity 
        // as we primarily rely on LocalStore for this hackathon context.
        
        return {
            aiCreated: total,
            completedWithin24h,
            completionRate: total > 0 ? Math.round((completedWithin24h / total) * 100) : 0
        };
    }

    async seedDemoData(userId: string): Promise<void> {
        if (!supabase) throw new Error('Supabase client not initialized');

        // Check if data exists
        const { count: taskCount } = await supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('user_id', userId);
        const { count: habitCount } = await supabase.from('habits').select('*', { count: 'exact', head: true }).eq('user_id', userId);
        
        if ((taskCount || 0) > 0 || (habitCount || 0) > 0) {
            // console.log("Data already exists, skipping seed.");
            return;
        }

        const today = new Date().toISOString().split('T')[0];
        const getPastDate = (daysAgo: number) => {
            const d = new Date();
            d.setDate(d.getDate() - daysAgo);
            return d.toISOString().split('T')[0];
        };

        // 1. Enable Sectors
        await supabase.from('sectors_enabled').upsert([
            { user_id: userId, sector: 'Productivity', enabled: true },
            { user_id: userId, sector: 'Habits', enabled: true },
            { user_id: userId, sector: 'Goals', enabled: true }
        ]);

        // 2. Create Goals
        const goal1Id = crypto.randomUUID();
        const goal2Id = crypto.randomUUID();

        await supabase.from('goals').insert([
            { id: goal1Id, user_id: userId, title: "Launch MVP Product", deadline: "2024-12-31" },
            { id: goal2Id, user_id: userId, title: "Run a Marathon", deadline: "2025-06-01" }
        ]);

        // 3. Create Milestones
        await supabase.from('milestones').insert([
            { user_id: userId, goal_id: goal1Id, title: "Design Database Schema", target_date: today, completed: true, created_by: 'ai' },
            { user_id: userId, goal_id: goal1Id, title: "Build Core UI", target_date: today, completed: false, created_by: 'ai' }
        ]);

        // 4. Create Habits
        const habit1Id = crypto.randomUUID();
        const habit2Id = crypto.randomUUID();

        await supabase.from('habits').insert([
            { id: habit1Id, user_id: userId, title: "Morning 5k Run", frequency: "daily", created_by: 'user' },
            { id: habit2Id, user_id: userId, title: "Read 30 mins", frequency: "daily", created_by: 'ai' }
        ]);

        // 5. Create Habit Logs (Streaks)
        const logs = [
            { habit_id: habit1Id, done_date: getPastDate(1), user_id: userId },
            { habit_id: habit1Id, done_date: getPastDate(2), user_id: userId },
            { habit_id: habit1Id, done_date: getPastDate(3), user_id: userId },
            { habit_id: habit1Id, done_date: today, user_id: userId },
            { habit_id: habit2Id, done_date: getPastDate(1), user_id: userId },
            { habit_id: habit2Id, done_date: today, user_id: userId }
        ];
        await supabase.from('habit_logs').insert(logs);

        // 6. Create Tasks
        await supabase.from('tasks').insert([
            { user_id: userId, title: "Finalize pitch deck", due_date: today, status: "open", goal_id: goal1Id, created_by: 'user' },
            { user_id: userId, title: "Review PR #42", due_date: today, status: "completed", created_by: 'ai' },
            { user_id: userId, title: "Buy running shoes", due_date: today, status: "open", goal_id: goal2Id, created_by: 'ai' }
        ]);

        // 7. Create AI Runs (for dashboard stats)
        const run1Id = crypto.randomUUID();
        await supabase.from('ai_runs').insert({
            id: run1Id,
            user_id: userId,
            route: "coach",
            prompt: "Plan my day",
            response: JSON.stringify({
                assistant_message: "I've prioritized your launch tasks. Good luck!",
                actions: [{ type: "CREATE_TASK", payload: { title: "Review PR #42" } }]
            }),
            schema_valid: true,
            latency_ms: 850,
            prompt_version: 'A'
        });

        await supabase.from('ai_evals').insert({
            user_id: userId,
            run_id: run1Id,
            score_total: 95,
            schema_score: 25,
            sector_score: 25,
            usefulness_score: 25,
            efficiency_score: 20
        });

        await supabase.from('ai_feedback').insert({
            user_id: userId,
            run_id: run1Id,
            helpful: true,
            comment: "Spot on!"
        });
    }
}
