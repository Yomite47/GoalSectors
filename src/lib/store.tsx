'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserProfile, Task as UITask, Habit as UIHabit, Goal as UIGoal, Sector, Milestone, WeeklyPlan } from '@/types';
import { DailyCheckin } from '@/lib/data/types';
import { getStore } from './data';

const defaultProfile: UserProfile = {
  id: '',
  name: '',
  enabledSectors: [],
  isPremium: false,
  tasks: [],
  habits: [],
  goals: [],
  onboardingCompleted: false,
};

interface UserContextType {
  profile: UserProfile;
  updateProfile: (updates: Partial<UserProfile>) => void;
  resetProfile: () => void;
  addTask: (title: string, date?: string) => void;
  toggleTask: (id: string, isCompleted: boolean) => void;
  deleteTask: (id: string) => Promise<void>;
  rescheduleTask: (id: string, newDate: string) => void;
  getTasksForDate: (date: string) => Promise<UITask[]>;
  addHabit: (title: string) => void;
  deleteHabit: (id: string) => Promise<void>;
  checkHabit: (id: string) => void;
  addGoal: (title: string, deadline?: string) => void;
  deleteGoal: (id: string) => Promise<void>;
  addMilestone: (goalId: string, title: string, targetDate?: string) => Promise<void>;
  deleteMilestone: (goalId: string, milestoneId: string) => Promise<void>;
  upsertWeeklyPlan: (goalId: string, weekStart: string, focus: string) => Promise<void>;
  getWeeklyPlans: (goalId: string) => Promise<WeeklyPlan[]>;
  todayCheckin: DailyCheckin | null;
  saveTodayCheckin: (data: { topPriority: string; blockers?: string | null; energyLevel?: number | null }) => Promise<void>;
  isLoading: boolean;
  seedDemoData: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [todayCheckin, setTodayCheckin] = useState<DailyCheckin | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const store = getStore();

  const seedDemoData = async () => {
    if (!profile.id) return;
    await store.seedDemoData(profile.id);
    await refreshData(profile.id);
  };

  const refreshData = async (userId: string) => {
    try {
        const [sectors, goals, tasks, habits, habitStreaks, checkin] = await Promise.all([
            store.getEnabledSectors(userId),
            store.listGoals(userId),
            store.listTasksForDate(userId, new Date().toISOString().split('T')[0]),
            store.listHabits(userId),
            store.getHabitStreaks(userId),
            store.getTodayCheckin(userId, new Date().toISOString().split('T')[0])
        ]);

        setTodayCheckin(checkin);

        // Fetch logs for 7-day view for each habit
        // Calculate date range for last 7 days
        const todayObj = new Date();
        const dates = [];
        for(let i=0; i<7; i++) {
            const d = new Date();
            d.setDate(todayObj.getDate() - i);
            dates.push(d.toISOString().split('T')[0]);
        }
        const fromDate = dates[6];
        const toDate = dates[0];

        const uiHabits: UIHabit[] = await Promise.all(habits.map(async h => {
            const streakData = habitStreaks.find(s => s.habitId === h.id);
            const logs = await store.listHabitLogs(userId, h.id, fromDate, toDate);
            return {
                id: h.id,
                title: h.title,
                streak: streakData?.currentStreak || 0,
                completedDates: logs
            };
        }));

        // Fetch milestones for each goal to populate counts and details
        // Also fetch current week focus
        const d = new Date();
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        const currentMonday = new Date(d.setDate(diff)).toISOString().split('T')[0];

        const uiGoals: UIGoal[] = await Promise.all(goals.map(async g => {
            const [milestones, weeklyPlans] = await Promise.all([
                store.listMilestones(userId, g.id),
                store.listWeeklyPlans(userId, g.id)
            ]);
            
            const currentPlan = weeklyPlans.find(p => p.week_start === currentMonday);

            return {
                id: g.id,
                title: g.title,
                deadline: g.deadline || undefined,
                milestones: milestones.map(m => ({
                    id: m.id,
                    title: m.title,
                    completed: m.completed,
                    targetDate: m.target_date || undefined
                })),
                currentWeekFocus: currentPlan?.focus,
                createdAt: g.created_at
            };
        }));

        const uiTasks: UITask[] = tasks.map(t => ({
            id: t.id,
            title: t.title,
            completed: t.status === 'completed',
            createdAt: t.created_at
        }));

        // Load local prefs
        const savedName = localStorage.getItem('goalsectors_user_name') || '';
        const savedPrefsStr = localStorage.getItem('goalsectors_user_prefs');
        const savedPrefs = savedPrefsStr ? JSON.parse(savedPrefsStr) : {};

        setProfile(prev => ({
            ...prev,
            id: userId,
            name: savedName,
            notificationsEnabled: savedPrefs.notificationsEnabled,
            notificationTime: savedPrefs.notificationTime,
            enabledSectors: sectors as Sector[],
            goals: uiGoals,
            tasks: uiTasks,
            habits: uiHabits,
            onboardingCompleted: sectors.length > 0
        }));
    } catch (error) {
        console.error('Error refreshing data:', error);
    }
  };

  useEffect(() => {
    const init = async () => {
        // Check for existing ID in localStorage to maintain identity
        let userId = localStorage.getItem('goal_sectors_user_id');
        
        if (!userId) {
            userId = crypto.randomUUID();
            localStorage.setItem('goal_sectors_user_id', userId);
        }

        await store.getOrCreateUser(userId);
        await refreshData(userId);
        setIsLoading(false);
    };

    init();
  }, []);

  const updateProfile = async (updates: Partial<UserProfile>) => {
    // Optimistic update
    setProfile(prev => ({ ...prev, ...updates }));

    // Persist changes
    if (updates.enabledSectors) {
        await store.setEnabledSectors(profile.id, updates.enabledSectors);
    }

    // Persist local prefs
    if (updates.name !== undefined) {
        localStorage.setItem('goalsectors_user_name', updates.name);
    }
    if (updates.notificationsEnabled !== undefined || updates.notificationTime !== undefined) {
        const currentPrefsStr = localStorage.getItem('goalsectors_user_prefs');
        const currentPrefs = currentPrefsStr ? JSON.parse(currentPrefsStr) : {};
        const newPrefs = {
            ...currentPrefs,
            ...(updates.notificationsEnabled !== undefined && { notificationsEnabled: updates.notificationsEnabled }),
            ...(updates.notificationTime !== undefined && { notificationTime: updates.notificationTime }),
        };
        localStorage.setItem('goalsectors_user_prefs', JSON.stringify(newPrefs));
    }
  };

  const addTask = async (title: string, date?: string) => {
    const targetDate = date || new Date().toISOString().split('T')[0];
    
    // Optimistic update
    const tempId = `temp-${crypto.randomUUID()}`;
    const newTask: UITask = {
        id: tempId,
        title,
        completed: false,
        createdAt: new Date().toISOString(),
        dueDate: targetDate
    };

    setProfile(prev => ({
        ...prev,
        tasks: targetDate === new Date().toISOString().split('T')[0] 
            ? [...prev.tasks, newTask] 
            : prev.tasks
    }));

    await store.createTask(profile.id, title, targetDate);
    refreshData(profile.id);
  };

  const toggleTask = async (id: string, isCompleted: boolean) => {
    // Optimistic UI update
    setProfile(prev => ({
        ...prev,
        tasks: prev.tasks.map(t => t.id === id ? { ...t, completed: isCompleted } : t)
    }));
    
    await store.toggleTask(profile.id, id, isCompleted);
    refreshData(profile.id);
  };

  const deleteTask = async (id: string) => {
    // Optimistic
    setProfile(prev => ({
        ...prev,
        tasks: prev.tasks.filter(t => t.id !== id)
    }));
    await store.deleteTask(profile.id, id);
  };

  const rescheduleTask = async (id: string, newDate: string) => {
    // Optimistic: If moved from today to future, remove from today's list
    // If moved to today, we can't easily add it without data, so just refresh
    const today = new Date().toISOString().split('T')[0];
    
    if (newDate !== today) {
        setProfile(prev => ({
            ...prev,
            tasks: prev.tasks.filter(t => t.id !== id)
        }));
    }

    await store.rescheduleTask(profile.id, id, newDate);
    refreshData(profile.id);
  };

  const getTasksForDate = async (date: string): Promise<UITask[]> => {
    const tasks = await store.listTasksForDate(profile.id, date);
    return tasks.map(t => ({
        id: t.id,
        title: t.title,
        completed: t.status === 'completed',
        dueDate: t.due_date || undefined,
        createdAt: t.created_at
    }));
  };

  const addHabit = async (title: string) => {
    await store.createHabit(profile.id, title);
    refreshData(profile.id);
  };

  const deleteHabit = async (id: string) => {
    // Optimistic
    setProfile(prev => ({
        ...prev,
        habits: prev.habits.filter(h => h.id !== id)
    }));
    await store.deleteHabit(profile.id, id);
  };

  const checkHabit = async (id: string) => {
    const today = new Date().toISOString().split('T')[0];
    
    // Optimistic UI
    setProfile(prev => ({
        ...prev,
        habits: prev.habits.map(h => 
            h.id === id ? { 
                ...h, 
                completedDates: [...h.completedDates, today],
                streak: h.streak + 1
            } : h
        )
    }));

    await store.completeHabit(profile.id, id, today);
    refreshData(profile.id);
  };

  const addGoal = async (title: string, deadline?: string) => {
    await store.createGoal(profile.id, title, deadline);
    refreshData(profile.id);
  };

  const deleteGoal = async (id: string) => {
    // Optimistic
    setProfile(prev => ({
        ...prev,
        goals: prev.goals.filter(g => g.id !== id)
    }));
    await store.deleteGoal(profile.id, id);
  };

  const addMilestone = async (goalId: string, title: string, targetDate?: string) => {
    await store.createMilestone(profile.id, goalId, title, targetDate);
    refreshData(profile.id);
  };

  const deleteMilestone = async (goalId: string, milestoneId: string) => {
    await store.deleteMilestone(profile.id, milestoneId);
    refreshData(profile.id);
  };

  const upsertWeeklyPlan = async (goalId: string, weekStart: string, focus: string) => {
    await store.upsertWeeklyPlan(profile.id, goalId, weekStart, focus);
    // Weekly plans are not in global profile state yet, but this ensures persistence
  };

  const getWeeklyPlans = async (goalId: string): Promise<WeeklyPlan[]> => {
    const plans = await store.listWeeklyPlans(profile.id, goalId);
    return plans.map(p => ({
        id: p.id,
        weekStart: p.week_start,
        focus: p.focus
    }));
  };

  const saveTodayCheckin = async (data: { topPriority: string; blockers?: string | null; energyLevel?: number | null }) => {
    if (!profile.id) return;
    const dateISO = new Date().toISOString().split('T')[0];
    const checkin = await store.upsertTodayCheckin(profile.id, dateISO, data);
    setTodayCheckin(checkin);
  };

  const resetProfile = () => {
      // Not implemented for DB version yet
  };

  return (
    <UserContext.Provider value={{ 
      profile, 
      updateProfile, 
      resetProfile,
      addTask,
      toggleTask,
      deleteTask,
      rescheduleTask,
      getTasksForDate,
      addHabit,
      deleteHabit,
      checkHabit,
      addGoal,
      deleteGoal,
      addMilestone,
      deleteMilestone,
      upsertWeeklyPlan,
      getWeeklyPlans,
      todayCheckin,
      saveTodayCheckin,
      isLoading,
      seedDemoData
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
