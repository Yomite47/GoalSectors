'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/lib/store';
import { SectorGuard } from '@/components/SectorGuard';
import { Task } from '@/types';
import { 
    Calendar, 
    ChevronLeft, 
    ChevronRight, 
    Plus, 
    Check, 
    Clock, 
    X,
    CalendarDays,
    Trash2
} from 'lucide-react';

export default function TasksPage() {
    return (
        <SectorGuard sector="Productivity">
            <TasksContent />
        </SectorGuard>
    );
}

function TasksContent() {
    const { addTask, toggleTask, rescheduleTask, getTasksForDate, deleteTask, isLoading: isUserLoading, profile } = useUser();
    
    // State
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // Add Modal State
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    
    // Reschedule Modal State
    const [rescheduleTaskId, setRescheduleTaskId] = useState<string | null>(null);
    const [rescheduleDate, setRescheduleDate] = useState('');

    // Fetch tasks when date changes
    useEffect(() => {
        if (isUserLoading) return;
        
        let mounted = true;
        const loadTasks = async () => {
            setIsLoading(true);
            try {
                // console.log("Fetching tasks for", selectedDate, "User:", profile.id);
                const data = await getTasksForDate(selectedDate);
                if (mounted) setTasks(data);
            } catch (error) {
                console.error('Failed to load tasks', error);
            } finally {
                if (mounted) setIsLoading(false);
            }
        };
        loadTasks();
        return () => { mounted = false; };
    }, [selectedDate, getTasksForDate, isUserLoading, profile.id]);

    // Handlers
    const handlePrevDay = () => {
        const date = new Date(selectedDate);
        date.setDate(date.getDate() - 1);
        setSelectedDate(date.toISOString().split('T')[0]);
    };

    const handleNextDay = () => {
        const date = new Date(selectedDate);
        date.setDate(date.getDate() + 1);
        setSelectedDate(date.toISOString().split('T')[0]);
    };

    const handleAddTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTaskTitle.trim()) return;
        
        try {
            console.log("Adding task:", newTaskTitle, "Date:", selectedDate);
            await addTask(newTaskTitle, selectedDate);
            setNewTaskTitle('');
            setIsAddModalOpen(false);
            
            // Refresh tasks
            const data = await getTasksForDate(selectedDate);
            setTasks(data);
        } catch (error) {
            console.error("Error adding task:", error);
            alert("Failed to add task. Please try again.");
        }
    };

    const handleToggle = async (taskId: string) => {
        const task = tasks.find(t => t.id === taskId);
        if (!task) return;
        const newStatus = !task.completed;

        // Optimistic update
        setTasks(prev => prev.map(t => 
            t.id === taskId ? { ...t, completed: newStatus } : t
        ));
        await toggleTask(taskId, newStatus);
    };

    const handleReschedule = async (e: React.FormEvent) => {
        e.preventDefault();
        if (rescheduleTaskId && rescheduleDate) {
            await rescheduleTask(rescheduleTaskId, rescheduleDate);
            setRescheduleTaskId(null);
            setRescheduleDate('');
            
            // Refresh list (task should disappear if moved to another date)
            const data = await getTasksForDate(selectedDate);
            setTasks(data);
        }
    };

    const handleDelete = async (taskId: string) => {
        if (confirm('Are you sure you want to delete this task?')) {
            await deleteTask(taskId);
            // Refresh list
            const data = await getTasksForDate(selectedDate);
            setTasks(data);
        }
    };

    // Format date for display
    const formattedDate = new Date(selectedDate).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
    });
    
    const isToday = selectedDate === new Date().toISOString().split('T')[0];

    return (
        <div className="min-h-screen bg-gray-50 pb-32">
            {/* Header / Date Picker */}
            <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3 shadow-sm">
                <div className="flex items-center justify-between max-w-lg mx-auto">
                    <button 
                        onClick={handlePrevDay}
                        className="p-2 hover:bg-gray-100 rounded-full text-gray-600"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    
                    <div className="flex flex-col items-center">
                        <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                            {isToday ? 'Today' : ''}
                        </span>
                        <div className="relative flex items-center gap-2">
                            <h1 className="text-lg font-bold text-gray-900">{formattedDate}</h1>
                            <input 
                                type="date" 
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                            />
                            <CalendarDays size={16} className="text-blue-600 pointer-events-none" />
                        </div>
                    </div>

                    <button 
                        onClick={handleNextDay}
                        className="p-2 hover:bg-gray-100 rounded-full text-gray-600"
                    >
                        <ChevronRight size={24} />
                    </button>
                </div>
            </div>

            {/* Task List */}
            <div className="max-w-lg mx-auto p-4 space-y-3">
                {isLoading || isUserLoading ? (
                    <div className="text-center py-10 text-gray-400">Loading...</div>
                ) : tasks.length === 0 ? (
                    <div className="text-center py-12 px-4">
                        <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Calendar className="text-blue-500 w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-1">No tasks for this day</h3>
                        <p className="text-gray-500 mb-6">Take a break or plan ahead.</p>
                        <button 
                            onClick={() => setIsAddModalOpen(true)}
                            className="text-blue-600 font-medium hover:underline"
                        >
                            + Add a task now
                        </button>
                    </div>
                ) : (
                    tasks.map(task => (
                        <div 
                            key={task.id} 
                            className={`bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-start gap-3 transition-all ${
                                task.completed ? 'opacity-60 bg-gray-50' : ''
                            }`}
                        >
                            <button
                                onClick={() => handleToggle(task.id)}
                                className={`mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                                    task.completed 
                                        ? 'bg-green-500 border-green-500 text-white' 
                                        : 'border-gray-300 hover:border-blue-500'
                                }`}
                            >
                                {task.completed && <Check size={14} strokeWidth={3} />}
                            </button>
                            
                            <div className="flex-1 min-w-0">
                                <p className={`text-base font-medium leading-tight mb-1 ${
                                    task.completed ? 'text-gray-500 line-through' : 'text-gray-900'
                                }`}>
                                    {task.title}
                                </p>
                            </div>

                            <button
                                onClick={() => {
                                    setRescheduleTaskId(task.id);
                                    setRescheduleDate(selectedDate); // Default to current date of task
                                }}
                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                                aria-label="Reschedule"
                            >
                                <Clock size={18} />
                            </button>
                            
                            <button
                                onClick={() => handleDelete(task.id)}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg -mr-2"
                                aria-label="Delete"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ))
                )}
            </div>

            {/* Floating Add Button */}
            <button
                onClick={() => setIsAddModalOpen(true)}
                className="fixed bottom-24 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-blue-700 active:scale-95 transition-all z-20"
            >
                <Plus size={28} />
            </button>

            {/* Add Task Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-xl animate-in fade-in zoom-in duration-200">
                        <form onSubmit={handleAddTask} className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold text-gray-900">New Task</h3>
                                <button 
                                    type="button" 
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="text-gray-400 hover:text-gray-600 p-1"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Date
                                </label>
                                <div className="p-3 bg-gray-50 rounded-lg text-gray-900 border border-gray-200">
                                    {formattedDate}
                                </div>
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Task Title
                                </label>
                                <input
                                    type="text"
                                    value={newTaskTitle}
                                    onChange={(e) => setNewTaskTitle(e.target.value)}
                                    placeholder="What needs to be done?"
                                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    autoFocus
                                />
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
                                    disabled={!newTaskTitle.trim()}
                                    className="flex-1 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Add Task
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Reschedule Modal */}
            {rescheduleTaskId && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-xl animate-in fade-in zoom-in duration-200">
                        <form onSubmit={handleReschedule} className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold text-gray-900">Reschedule Task</h3>
                                <button 
                                    type="button" 
                                    onClick={() => setRescheduleTaskId(null)}
                                    className="text-gray-400 hover:text-gray-600 p-1"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            
                            <p className="text-gray-500 text-sm mb-4">
                                Choose a new date for this task.
                            </p>
                            
                            <input
                                type="date"
                                value={rescheduleDate}
                                onChange={(e) => setRescheduleDate(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none mb-6"
                            />
                            
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setRescheduleTaskId(null)}
                                    className="flex-1 py-3 text-gray-600 font-medium hover:bg-gray-50 rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={!rescheduleDate}
                                    className="flex-1 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Reschedule
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}