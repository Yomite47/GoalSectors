'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@/lib/store';
import { WeeklyPlan } from '@/types';
import { ArrowLeft, Calendar, CheckCircle2, Circle, Plus, Trash2, Wand2, Save } from 'lucide-react';
import Link from 'next/link';

export default function GoalDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { profile, addMilestone, deleteMilestone, upsertWeeklyPlan, getWeeklyPlans } = useUser();
  const goalId = params.goalId as string;
  
  const goal = profile.goals.find(g => g.id === goalId);
  
  // Weekly Plans State
  const [plans, setPlans] = useState<Record<string, string>>({}); // weekStart -> focus
  const [loadingPlans, setLoadingPlans] = useState(true);
  
  // Milestone Modal State
  const [isMilestoneModalOpen, setIsMilestoneModalOpen] = useState(false);
  const [milestoneTitle, setMilestoneTitle] = useState('');
  const [milestoneDate, setMilestoneDate] = useState('');

  // Calculate upcoming 4 weeks
  const weeks: string[] = [];
  const today = new Date();
  const currentMonday = new Date(today);
  const day = currentMonday.getDay();
  const diff = currentMonday.getDate() - day + (day === 0 ? -6 : 1);
  currentMonday.setDate(diff);

  for (let i = 0; i < 4; i++) {
    const d = new Date(currentMonday);
    d.setDate(d.getDate() + (i * 7));
    weeks.push(d.toISOString().split('T')[0]);
  }

  useEffect(() => {
    if (goalId) {
      getWeeklyPlans(goalId).then(fetchedPlans => {
        const planMap: Record<string, string> = {};
        fetchedPlans.forEach(p => {
          planMap[p.weekStart] = p.focus;
        });
        setPlans(planMap);
        setLoadingPlans(false);
      });
    }
  }, [goalId]); // removed getWeeklyPlans from deps to avoid loop if unstable ref

  if (!goal) {
    return (
        <div className="p-4">Goal not found</div>
    );
  }

  const handleAddMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!milestoneTitle.trim()) return;
    await addMilestone(goalId, milestoneTitle, milestoneDate || undefined);
    setMilestoneTitle('');
    setMilestoneDate('');
    setIsMilestoneModalOpen(false);
  };

  const handleApplyTemplate = async () => {
    const template = [
        "Research + Setup",
        "Practice + Consistency",
        "Build + Feedback",
        "Polish + Review"
    ];
    
    const newPlans = { ...plans };
    const promises: Promise<void>[] = [];
    
    weeks.forEach((weekStart, index) => {
        if (!newPlans[weekStart]) { // Don't overwrite existing
            const focus = template[index];
            newPlans[weekStart] = focus;
            // Auto-save generated plans
            promises.push(upsertWeeklyPlan(goalId, weekStart, focus));
        }
    });
    
    setPlans(newPlans);
    await Promise.all(promises);
  };

  const handleSavePlan = async (weekStart: string) => {
    const focus = plans[weekStart] || '';
    if (!focus.trim()) return;
    await upsertWeeklyPlan(goalId, weekStart, focus);
    // Optional: show toast
  };

  return (
      <div className="space-y-8 pb-20">
        {/* Header */}
        <div>
          <Link href="/app/goals" className="inline-flex items-center text-gray-500 mb-4 hover:text-gray-900">
            <ArrowLeft size={20} className="mr-1" />
            Back to Goals
          </Link>
          <h1 className="text-2xl font-bold">{goal.title}</h1>
          {goal.deadline && (
            <div className="flex items-center gap-2 text-gray-500 mt-2">
              <Calendar size={16} />
              <span>Deadline: {new Date(goal.deadline).toLocaleDateString()}</span>
            </div>
          )}
        </div>

        {/* Milestones */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">Milestones</h2>
            <button 
              onClick={() => setIsMilestoneModalOpen(true)}
              className="text-blue-600 text-sm font-medium flex items-center gap-1"
            >
              <Plus size={16} /> Add
            </button>
          </div>
          
          <div className="space-y-2">
            {goal.milestones.length === 0 ? (
              <p className="text-gray-400 text-sm italic">No milestones yet.</p>
            ) : (
              goal.milestones.map(m => (
                <div key={m.id} className="flex items-center justify-between bg-white p-3 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-3">
                    {m.completed ? (
                        <CheckCircle2 className="text-green-500" size={20} />
                    ) : (
                        <Circle className="text-gray-300" size={20} />
                    )}
                    <span className={m.completed ? "line-through text-gray-400" : ""}>{m.title}</span>
                  </div>
                  <button 
                    onClick={() => deleteMilestone(goalId, m.id)}
                    className="text-gray-300 hover:text-red-500"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Weekly Plan */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">4-Week Plan</h2>
            <button 
              onClick={handleApplyTemplate}
              className="text-purple-600 text-sm font-medium flex items-center gap-1 bg-purple-50 px-2 py-1 rounded-lg"
            >
              <Wand2 size={14} /> Template
            </button>
          </div>

          <div className="space-y-4">
            {weeks.map((weekStart, index) => (
              <div key={weekStart} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">
                  Week {index + 1} • {new Date(weekStart).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </div>
                <div className="flex gap-2">
                  <textarea
                    value={plans[weekStart] || ''}
                    onChange={(e) => setPlans(prev => ({ ...prev, [weekStart]: e.target.value }))}
                    placeholder="Focus for this week..."
                    className="w-full p-2 text-sm border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 outline-none"
                    rows={2}
                  />
                  <button 
                    onClick={() => handleSavePlan(weekStart)}
                    className="self-end p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                    title="Save"
                  >
                    <Save size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Add Milestone Modal */}
        {isMilestoneModalOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-sm rounded-2xl p-6">
              <h3 className="font-bold text-lg mb-4">Add Milestone</h3>
              <form onSubmit={handleAddMilestone} className="space-y-4">
                <input 
                  type="text" 
                  placeholder="Milestone title" 
                  className="w-full p-3 border rounded-xl"
                  value={milestoneTitle}
                  onChange={(e) => setMilestoneTitle(e.target.value)}
                  autoFocus
                />
                <input 
                  type="date" 
                  className="w-full p-3 border rounded-xl"
                  value={milestoneDate}
                  onChange={(e) => setMilestoneDate(e.target.value)}
                />
                <div className="flex gap-2 pt-2">
                  <button 
                    type="button" 
                    onClick={() => setIsMilestoneModalOpen(false)}
                    className="flex-1 py-2 text-gray-600"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={!milestoneTitle.trim()}
                    className="flex-1 py-2 bg-blue-600 text-white rounded-xl disabled:opacity-50"
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
