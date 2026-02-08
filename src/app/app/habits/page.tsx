'use client';

import { useState } from 'react';
import { useUser } from '@/lib/store';
import { SectorGuard } from '@/components/SectorGuard';
import { Plus, X, Zap, Check, Calendar, Trash2 } from 'lucide-react';
import { clsx } from 'clsx';

export default function HabitsPage() {
    return (
        <SectorGuard sector="Habits">
            <HabitsContent />
        </SectorGuard>
    );
}

function HabitsContent() {
    const { profile, addHabit, checkHabit, deleteHabit } = useUser();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newHabitTitle, setNewHabitTitle] = useState('');

    const handleAddHabit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newHabitTitle.trim()) {
            addHabit(newHabitTitle);
            setNewHabitTitle('');
            setIsAddModalOpen(false);
        }
    };

    const todayStr = new Date().toISOString().split('T')[0];

    // Calculate last 7 days for the header
    const last7Days: Date[] = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        last7Days.push(d);
    }

    return (
        <div className="pb-24">
            <header className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-10 flex justify-between items-center">
                <h1 className="text-xl font-bold flex items-center gap-2">
                    <Zap className="text-yellow-500 fill-yellow-500" />
                    Habits
                </h1>
                <button 
                    onClick={() => setIsAddModalOpen(true)}
                    className="bg-yellow-100 text-yellow-700 px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-yellow-200"
                >
                    + New
                </button>
            </header>

            <div className="p-4 space-y-4">
                {profile.habits.length === 0 ? (
                    <div className="text-center py-12 px-4">
                        <div className="bg-yellow-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Zap className="text-yellow-500 w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-1">No habits yet</h3>
                        <p className="text-gray-500 mb-6">Add one to start a streak.</p>
                        <button 
                            onClick={() => setIsAddModalOpen(true)}
                            className="text-yellow-600 font-medium hover:underline"
                        >
                            + Add your first habit
                        </button>
                    </div>
                ) : (
                    profile.habits.map(habit => {
                        const isDoneToday = habit.completedDates.includes(todayStr);
                        
                        return (
                            <div key={habit.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="p-4 flex items-center justify-between">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-bold text-gray-900 text-lg">{habit.title}</h3>
                                            <button 
                                                onClick={() => {
                                                    if (confirm('Are you sure you want to delete this habit?')) {
                                                        deleteHabit(habit.id);
                                                    }
                                                }}
                                                className="text-gray-300 hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-xs font-bold px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                                                Streak: {habit.streak} 🔥
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => !isDoneToday && checkHabit(habit.id)}
                                        disabled={isDoneToday}
                                        className={clsx(
                                            "w-12 h-12 rounded-full flex items-center justify-center transition-all",
                                            isDoneToday
                                                ? "bg-green-500 text-white shadow-green-200 shadow-lg"
                                                : "bg-gray-100 text-gray-300 hover:bg-yellow-100 hover:text-yellow-500"
                                        )}
                                    >
                                        <Check size={24} strokeWidth={3} />
                                    </button>
                                </div>

                                {/* 7-day tick row */}
                                <div className="bg-gray-50 px-4 py-3 flex justify-between items-center border-t border-gray-100">
                                    {last7Days.map((date, i) => {
                                        const dateStr = date.toISOString().split('T')[0];
                                        const isCompleted = habit.completedDates.includes(dateStr);
                                        const isToday = dateStr === todayStr;
                                        
                                        return (
                                            <div key={i} className="flex flex-col items-center gap-1">
                                                <div className="text-[10px] text-gray-400 font-medium uppercase">
                                                    {date.toLocaleDateString('en-US', { weekday: 'narrow' })}
                                                </div>
                                                <div 
                                                    className={clsx(
                                                        "w-6 h-6 rounded-full flex items-center justify-center text-[10px]",
                                                        isCompleted 
                                                            ? "bg-green-500 text-white" 
                                                            : isToday 
                                                                ? "bg-white border-2 border-gray-200" 
                                                                : "bg-gray-200"
                                                    )}
                                                >
                                                    {isCompleted && <Check size={12} strokeWidth={4} />}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Add Habit Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-xl animate-in fade-in zoom-in duration-200">
                        <form onSubmit={handleAddHabit} className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold text-gray-900">New Habit</h3>
                                <button 
                                    type="button" 
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="text-gray-400 hover:text-gray-600 p-1"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Habit Title
                                </label>
                                <input
                                    type="text"
                                    value={newHabitTitle}
                                    onChange={(e) => setNewHabitTitle(e.target.value)}
                                    placeholder="e.g. Read 10 pages"
                                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-all"
                                    autoFocus
                                />
                                <p className="text-xs text-gray-500 mt-2">
                                    Frequency is set to <strong>Daily</strong> for now.
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="flex-1 py-3 text-gray-600 font-medium hover:bg-gray-50 rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={!newHabitTitle.trim()}
                                    className="flex-1 py-3 bg-yellow-500 text-white font-medium rounded-xl hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Start Habit
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
