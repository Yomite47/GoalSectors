'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/lib/store';
import { Sector } from '@/types';
import { Check, ArrowRight, X, Plus } from 'lucide-react';
import { clsx } from 'clsx';
import { requireOnboarding } from '@/lib/guards/onboarding';

const SECTORS: { id: Sector; label: string; description: string }[] = [
  { id: 'Productivity', label: 'Productivity', description: 'Tasks, focus blocks, scheduling' },
  { id: 'Habits', label: 'Habits', description: 'Daily streaks, consistency' },
  { id: 'Goals', label: 'Goals', description: 'Long-term milestones, planning' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { profile, updateProfile, addGoal } = useUser();
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedSectors, setSelectedSectors] = useState<Sector[]>([]);
  const [goals, setGoals] = useState<{ title: string; deadline: string }[]>([{ title: '', deadline: '' }]);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Guard: if already onboarded, redirect to app
  useEffect(() => {
    if (profile.enabledSectors.length > 0) {
       router.replace('/app');
    }
  }, [profile.enabledSectors, router]);

  const toggleSector = (sector: Sector) => {
    if (selectedSectors.includes(sector)) {
      setSelectedSectors(selectedSectors.filter((s) => s !== sector));
    } else {
      setSelectedSectors([...selectedSectors, sector]);
    }
  };

  const addGoalField = () => {
    if (goals.length < 3) {
      setGoals([...goals, { title: '', deadline: '' }]);
    }
  };

  const removeGoalField = (index: number) => {
    setGoals(goals.filter((_, i) => i !== index));
  };

  const updateGoal = (index: number, field: 'title' | 'deadline', value: string) => {
    const newGoals = [...goals];
    newGoals[index] = { ...newGoals[index], [field]: value };
    setGoals(newGoals);
  };

  const finishOnboarding = async (skipGoals = false) => {
    setIsRedirecting(true);
    
    // 1. Save Sectors
    await updateProfile({ enabledSectors: selectedSectors });

    // 2. Save Goals (if not skipped and Goals sector enabled)
    if (!skipGoals && selectedSectors.includes('Goals')) {
        for (const goal of goals) {
            if (goal.title.trim()) {
                await addGoal(goal.title, goal.deadline || undefined);
            }
        }
    }

    router.push('/app');
  };

  if (isRedirecting) {
      return (
          <div className="min-h-screen flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
      );
  }

  // Step 1: Choose Sectors
  if (step === 1) {
    return (
      <div className="min-h-screen bg-white p-6 flex flex-col max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-2">What matters to you?</h1>
        <p className="text-gray-500 mb-8">Choose the areas you want to focus on. You can change this later.</p>

        <div className="space-y-3 flex-1">
          {SECTORS.map((sector) => (
            <button
              key={sector.id}
              onClick={() => toggleSector(sector.id)}
              className={clsx(
                'w-full p-4 rounded-xl border-2 text-left transition-all flex items-center justify-between',
                selectedSectors.includes(sector.id)
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300'
              )}
            >
              <div>
                <div className="font-bold text-lg">{sector.label}</div>
                <div className="text-gray-500 text-sm">{sector.description}</div>
              </div>
              <div className={clsx(
                  "w-6 h-6 rounded-full flex items-center justify-center transition-colors",
                  selectedSectors.includes(sector.id) ? "bg-blue-600 text-white" : "bg-gray-200"
              )}>
                  {selectedSectors.includes(sector.id) && <Check size={14} />}
              </div>
            </button>
          ))}
        </div>

        <button
          disabled={selectedSectors.length === 0}
          onClick={() => {
              if (selectedSectors.includes('Goals')) {
                  setStep(2);
              } else {
                  finishOnboarding(true);
              }
          }}
          className="mt-6 w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg disabled:opacity-50 flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors"
        >
          {selectedSectors.includes('Goals') ? (
              <>Next <ArrowRight size={20} /></>
          ) : (
              'Finish'
          )}
        </button>
      </div>
    );
  }

  // Step 2: Add Goals
  return (
    <div className="min-h-screen bg-white p-6 flex flex-col max-w-md mx-auto">
      <div className="mb-6">
        <button onClick={() => setStep(1)} className="text-gray-400 text-sm hover:text-gray-600 mb-2">Back</button>
        <h1 className="text-2xl font-bold mb-2">Set up to 3 goals</h1>
        <p className="text-gray-500">What are your main targets right now?</p>
      </div>

      <div className="space-y-4 flex-1 overflow-y-auto pb-4">
        {goals.map((goal, index) => (
          <div key={index} className="bg-gray-50 p-4 rounded-xl border border-gray-100 relative group">
            <div className="flex justify-between mb-2">
                <label className="text-sm font-bold text-gray-700">Goal {index + 1}</label>
                {goals.length > 1 && (
                    <button onClick={() => removeGoalField(index)} className="text-gray-400 hover:text-red-500">
                        <X size={16} />
                    </button>
                )}
            </div>
            
            <input
              type="text"
              placeholder="e.g. Launch MVP"
              className="w-full p-3 border border-gray-200 rounded-lg mb-3 focus:ring-2 focus:ring-blue-500 outline-none"
              value={goal.title}
              onChange={(e) => updateGoal(index, 'title', e.target.value)}
              autoFocus={index === goals.length - 1}
            />
            
            <label className="block text-xs font-medium text-gray-500 mb-1">Deadline (Optional)</label>
            <input 
                type="date" 
                className="w-full p-2 border border-gray-200 rounded-lg text-sm text-gray-600"
                value={goal.deadline}
                onChange={(e) => updateGoal(index, 'deadline', e.target.value)}
            />
          </div>
        ))}
        
        {goals.length < 3 && (
          <button
            onClick={addGoalField}
            className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 font-medium hover:border-blue-400 hover:text-blue-600 flex items-center justify-center gap-2 transition-colors"
          >
            <Plus size={20} /> Add another goal
          </button>
        )}
      </div>

      <div className="mt-4 space-y-3">
        <button
            onClick={() => finishOnboarding(false)}
            disabled={!goals.some(g => g.title.trim())}
            className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
            Finish Setup
        </button>
        
        <button
            onClick={() => finishOnboarding(true)}
            className="w-full text-gray-500 py-2 font-medium hover:text-gray-800"
        >
            Skip goals for now
        </button>
      </div>
    </div>
  );
}
