'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/lib/store';
import { useToast } from '@/components/ToastContext';
import { CheckSquare, Zap, Target, Settings, Plus, Check, Circle, ArrowRight, Bell } from 'lucide-react';
import Link from 'next/link';
import { clsx } from 'clsx';
import DailyCheckinCard from '@/components/DailyCheckinCard';
import { requestNotificationPermission, scheduleNotification } from '@/lib/notifications';

export default function DashboardPage() {
  const { profile, isLoading, toggleTask, addTask, checkHabit } = useUser();
  const { showToast } = useToast();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  // Daily Reminder Scheduler
  useEffect(() => {
    if (!profile.notificationsEnabled || !profile.notificationTime) return;
    
    const now = new Date();
    const [hours, minutes] = profile.notificationTime.split(':').map(Number);
    const target = new Date();
    target.setHours(hours, minutes, 0, 0);
    
    // If target time is in the past for today, schedule for tomorrow? 
    // For simplicity, we only schedule if it's in the future for today.
    // A more robust system would check last notification date.
    
    if (target > now) {
        const diff = target.getTime() - now.getTime();
        console.log(`Scheduling daily reminder in ${Math.round(diff/1000/60)} minutes`);
        
        const timer = setTimeout(() => {
            scheduleNotification('GoalSectors Reminder', 0, {
                body: 'Time to check your goals and tasks!',
                requireInteraction: true
            });
        }, diff);
        
        return () => clearTimeout(timer);
    }
  }, [profile.notificationsEnabled, profile.notificationTime]);

  if (isLoading) return <div className="p-4 flex justify-center items-center h-full text-gray-400">Loading...</div>;

  const handleReminder = async (e: React.MouseEvent, taskTitle: string) => {
    e.stopPropagation();
    const granted = await requestNotificationPermission();
    if (granted) {
      scheduleNotification(`Reminder: ${taskTitle}`, 5000, {
        body: 'Time to focus on your task!',
        requireInteraction: true
      });
      showToast('Reminder set for 5 seconds (Demo)', 'success');
    } else {
      showToast('Notification permission denied', 'error');
    }
  };

  const todayStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  
  const openTasks = profile.tasks.filter(t => !t.completed);
  const completedTasks = profile.tasks.filter(t => t.completed);

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskTitle.trim()) {
      addTask(newTaskTitle); // Defaults to today
      showToast('Task added for today', 'success');
      setNewTaskTitle('');
      setIsAddModalOpen(false);
    }
  };

  const handleToggleTask = (taskId: string, isCompleting: boolean) => {
    toggleTask(taskId);
    if (isCompleting) {
        showToast('Task completed! Great job.', 'success');
    }
  };

  const handleCheckHabit = (habitId: string) => {
    checkHabit(habitId);
    showToast('Habit tracked! Streak updated.', 'success');
  };

  return (
    <div className="space-y-8 relative pb-20">
      <header className="flex justify-between items-center pt-2">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
             {profile.name ? `Hi, ${profile.name.split(' ')[0]}` : 'Dashboard'}
          </h1>
          <p className="text-gray-500 font-medium text-sm mt-1 uppercase tracking-wide">{todayStr}</p>
        </div>
        <Link href="/app/settings" className="p-3 text-gray-400 hover:bg-gray-100 hover:text-gray-900 rounded-full transition-colors">
          <Settings size={24} />
        </Link>
      </header>

      <DailyCheckinCard />

      {/* Productivity Sector: Today's Tasks */}
      {profile.enabledSectors.includes('Productivity') && (
        <section className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold flex items-center gap-2 text-gray-800">
                    <div className="bg-blue-100 text-blue-600 p-1.5 rounded-lg">
                        <CheckSquare size={18} />
                    </div>
                    Tasks
                </h2>
                <button 
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center gap-1 text-blue-600 text-sm font-bold hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
                >
                    <Plus size={16} /> New Task
                </button>
            </div>

            <div className="space-y-3">
                {profile.tasks.length === 0 ? (
                    <div className="bg-gray-50 p-8 rounded-2xl border border-dashed border-gray-200 text-center hover:bg-gray-100 transition-colors group cursor-pointer" onClick={() => setIsAddModalOpen(true)}>
                        <div className="w-12 h-12 bg-white text-gray-300 rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm group-hover:scale-110 transition-transform">
                            <CheckSquare size={24} />
                        </div>
                        <p className="text-gray-900 font-bold mb-1">No tasks for today</p>
                        <p className="text-gray-500 text-sm mb-4">Enjoy your free time or plan ahead.</p>
                        <Link href="/app/chat" className="inline-flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-lg text-blue-600 font-bold text-sm hover:border-blue-200 hover:shadow-sm transition-all" onClick={(e) => e.stopPropagation()}>
                            <Zap size={14} className="fill-blue-600" /> Ask Coach to plan my day
                        </Link>
                    </div>
                ) : (
                    <>
                        {openTasks.map(task => (
                            <div key={task.id} className="group bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:border-blue-200 transition-all duration-200 hover:shadow-md cursor-pointer" onClick={() => handleToggleTask(task.id, true)}>
                                <button 
                                    className="w-6 h-6 rounded-full border-2 border-gray-300 flex items-center justify-center text-transparent group-hover:border-blue-500 transition-colors shrink-0"
                                >
                                    <Check size={14} strokeWidth={3} className="group-hover:text-blue-500" />
                                </button>
                                <span className="font-medium text-gray-700 group-hover:text-gray-900 flex-1">{task.title}</span>
                                <button 
                                    onClick={(e) => handleReminder(e, task.title)}
                                    className="text-gray-300 hover:text-blue-500 p-2 rounded-full hover:bg-blue-50 transition-colors opacity-0 group-hover:opacity-100"
                                    title="Remind me"
                                >
                                    <Bell size={18} />
                                </button>
                            </div>
                        ))}
                        
                        {completedTasks.length > 0 && (
                            <div className="pt-4">
                                <div className="flex items-center gap-2 mb-3 px-2">
                                    <div className="h-px bg-gray-100 flex-1"></div>
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Completed</span>
                                    <div className="h-px bg-gray-100 flex-1"></div>
                                </div>
                                <div className="space-y-2 opacity-60 hover:opacity-100 transition-opacity">
                                    {completedTasks.map(task => (
                                        <div key={task.id} className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex items-center gap-3">
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); handleToggleTask(task.id, false); }}
                                                className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center text-white shrink-0 shadow-sm"
                                            >
                                                <Check size={12} strokeWidth={3} />
                                            </button>
                                            <span className="font-medium text-gray-500 line-through decoration-gray-400">{task.title}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </section>
      )}

      {/* Habits Sector: Today's Habits */}
      {profile.enabledSectors.includes('Habits') && (
        <section className="space-y-4">
             <h2 className="text-xl font-bold flex items-center gap-2 text-gray-800">
                <div className="bg-yellow-100 text-yellow-600 p-1.5 rounded-lg">
                    <Zap size={18} className="fill-yellow-600" />
                </div>
                Habits
            </h2>
            <div className="grid gap-3">
                {profile.habits.length === 0 ? (
                     <div className="bg-gray-50 p-6 rounded-2xl border border-dashed border-gray-200 text-center">
                        <p className="text-gray-500 font-medium mb-3">No habits tracked yet.</p>
                        <Link href="/app/settings" className="inline-flex items-center gap-1 text-yellow-600 font-bold text-sm hover:underline">
                            Add habits in Settings <ArrowRight size={16} />
                        </Link>
                    </div>
                ) : (
                    profile.habits.map(habit => {
                        const isDone = habit.completedDates.includes(new Date().toISOString().split('T')[0]);
                        return (
                            <div key={habit.id} className={clsx(
                                "p-4 rounded-2xl border transition-all duration-300 flex items-center justify-between group",
                                isDone ? "bg-green-50/50 border-green-100" : "bg-white border-gray-100 shadow-sm hover:border-yellow-200 hover:shadow-md"
                            )}>
                                <div>
                                    <div className={clsx("font-bold text-lg", isDone ? "text-green-900" : "text-gray-900")}>{habit.title}</div>
                                    <div className="text-xs font-bold mt-1 flex items-center gap-1.5">
                                        <span className={clsx("px-2 py-0.5 rounded-full flex items-center gap-1", isDone ? "bg-green-100 text-green-700" : "bg-yellow-50 text-yellow-700")}>
                                            <Zap size={10} className="fill-current" />
                                            {habit.streak} day streak
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => !isDone && handleCheckHabit(habit.id)}
                                    disabled={isDone}
                                    className={clsx(
                                        "w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-90 shadow-sm",
                                        isDone 
                                            ? "bg-green-500 text-white cursor-default"
                                            : "bg-gray-100 text-gray-300 group-hover:bg-yellow-100 group-hover:text-yellow-600"
                                    )}
                                >
                                    <Check size={20} strokeWidth={3} />
                                </button>
                            </div>
                        );
                    })
                )}
            </div>
        </section>
      )}

      {/* Goals Preview */}
      {profile.enabledSectors.includes('Goals') && (
        <section className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2 text-gray-800">
                <div className="bg-purple-100 text-purple-600 p-1.5 rounded-lg">
                    <Target size={18} />
                </div>
                Active Goals
            </h2>
            <div className="space-y-3">
                {profile.goals.length === 0 ? (
                    <div className="text-gray-500 text-sm bg-gray-50 p-6 rounded-2xl border border-dashed border-gray-200 text-center">
                        <p className="mb-2">No active goals.</p>
                        <Link href="/app/goals" className="text-purple-600 font-bold text-xs uppercase tracking-wide hover:underline">
                            Start Planning
                        </Link>
                    </div>
                ) : (
                    profile.goals.slice(0, 3).map(goal => (
                        <Link href={`/app/goals/${goal.id}`} key={goal.id} className="block bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:border-purple-200 hover:shadow-md transition-all group">
                            <div className="flex justify-between items-start mb-3">
                                <div className="font-bold text-gray-900 text-lg group-hover:text-purple-700 transition-colors">{goal.title}</div>
                                <div className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-lg font-medium border border-gray-100">
                                    {goal.milestones.length} milestones
                                </div>
                            </div>
                            
                            {goal.currentWeekFocus ? (
                                <div className="bg-purple-50 p-3 rounded-xl border border-purple-100">
                                    <div className="text-[10px] uppercase font-bold text-purple-500 mb-1 tracking-wider">Current Focus</div>
                                    <div className="text-sm text-purple-900 font-medium">{goal.currentWeekFocus}</div>
                                </div>
                            ) : (
                                <div className="text-xs text-gray-400 mt-1 italic pl-1">
                                    No focus set for this week.
                                </div>
                            )}
                        </Link>
                    ))
                )}
            </div>
        </section>
      )}

      {/* Add Task Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
                <h3 className="text-lg font-bold mb-4">Add Task for Today</h3>
                <form onSubmit={handleAddTask}>
                    <input 
                        autoFocus
                        type="text"
                        placeholder="What needs to be done?"
                        className="w-full p-3 border rounded-xl mb-4 bg-gray-50 focus:bg-white transition-colors"
                        value={newTaskTitle}
                        onChange={e => setNewTaskTitle(e.target.value)}
                    />
                    <div className="flex gap-2 justify-end">
                        <button 
                            type="button"
                            onClick={() => setIsAddModalOpen(false)}
                            className="px-4 py-2 text-gray-600 font-medium"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit"
                            disabled={!newTaskTitle.trim()}
                            className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold disabled:opacity-50"
                        >
                            Add
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
}
