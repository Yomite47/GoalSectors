export type Sector = 'Productivity' | 'Habits' | 'Goals';

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: string;
  createdAt: string;
}

export interface Habit {
  id: string;
  title: string;
  streak: number;
  completedDates: string[]; // ISO Date strings (YYYY-MM-DD)
}

export interface Milestone {
  id: string;
  title: string;
  completed: boolean;
  targetDate?: string;
}

export interface WeeklyPlan {
  id: string;
  weekStart: string;
  focus: string;
}

export interface Goal {
  id: string;
  title: string;
  deadline?: string;
  milestones: Milestone[];
  currentWeekFocus?: string;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  enabledSectors: Sector[];
  isPremium: boolean;
  tasks: Task[];
  habits: Habit[];
  goals: Goal[];
  onboardingCompleted: boolean;
  notificationsEnabled?: boolean;
  notificationTime?: string;
}
