'use client';

import { useState } from 'react';
import { useUser } from '@/lib/store';
import { SectorGuard } from '@/components/SectorGuard';
import { Plus, Calendar, Target, ChevronRight, X, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function GoalsPage() {
  const { profile, addGoal, deleteGoal, isLoading } = useUser();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [deadline, setDeadline] = useState('');

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    try {
        await addGoal(title, deadline || undefined);
        setTitle('');
        setDeadline('');
        setIsModalOpen(false);
    } catch (error) {
        console.error("Error adding goal:", error);
        alert("Failed to add goal. Please try again.");
    }
  };

  return (
    <SectorGuard sector="Goals">
      <div className="space-y-6 pb-32">
        {isLoading && (
             <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
                 <div className="animate-pulse text-blue-600 font-medium">Loading goals...</div>
             </div>
        )}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Goals</h1>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2"
          >
            <Plus size={18} />
            Add Goal
          </button>
        </div>

        <div className="space-y-3">
          {profile.goals.length === 0 ? (
            <div className="text-center bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
              <div className="bg-blue-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <Target className="text-blue-600" size={24} />
              </div>
              <h3 className="font-medium text-gray-900 mb-1">No goals yet</h3>
              <p className="text-gray-500 text-sm mb-4">Add one to start planning your future.</p>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="text-blue-600 font-medium text-sm hover:underline"
              >
                Create your first goal
              </button>
            </div>
          ) : (
            profile.goals.map(goal => (
              <Link 
                href={`/app/goals/${goal.id}`} 
                key={goal.id}
                className="block bg-white p-5 rounded-xl shadow-sm border border-gray-100 active:scale-[0.98] transition-transform"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-900">{goal.title}</h3>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      {goal.deadline && (
                        <span className="flex items-center gap-1">
                          <Calendar size={14} />
                          {new Date(goal.deadline).toLocaleDateString()}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Target size={14} />
                        {goal.milestones.length} milestones
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        if (confirm('Are you sure you want to delete this goal?')) {
                          deleteGoal(goal.id);
                        }
                      }}
                      className="text-gray-400 hover:text-red-500 transition-colors p-1"
                    >
                      <Trash2 size={18} />
                    </button>
                    <ChevronRight className="text-gray-300" size={20} />
                  </div>
                </div>
                
                {/* Progress bar placeholder - can be real later based on milestone completion */}
                <div className="mt-4 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 rounded-full" 
                    style={{ width: `${goal.milestones.length > 0 ? (goal.milestones.filter(m => m.completed).length / goal.milestones.length) * 100 : 0}%` }}
                  />
                </div>
              </Link>
            ))
          )}
        </div>

        {/* Add Goal Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-2xl p-6 animate-in fade-in zoom-in duration-200">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">New Goal</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={24} />
                </button>
              </div>
              
              <form onSubmit={handleAdd} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Goal Title</label>
                  <input 
                    type="text" 
                    placeholder="e.g., Launch MVP, Run Marathon" 
                    className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    autoFocus
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Deadline (Optional)</label>
                  <input 
                    type="date" 
                    className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                  />
                </div>

                <div className="flex gap-3 mt-6">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-3 text-gray-600 font-medium hover:bg-gray-50 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={!title.trim()}
                    className="flex-1 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 disabled:opacity-50"
                  >
                    Create Goal
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </SectorGuard>
  );
}
