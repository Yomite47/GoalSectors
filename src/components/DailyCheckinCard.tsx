'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/lib/store';
import { useToast } from '@/components/ToastContext';
import { Check, Edit2, Zap, Save } from 'lucide-react';
import { clsx } from 'clsx';

export default function DailyCheckinCard() {
  const { todayCheckin, saveTodayCheckin } = useUser();
  const { showToast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form state
  const [priority, setPriority] = useState('');
  const [blockers, setBlockers] = useState('');
  const [energy, setEnergy] = useState<number | null>(null);

  useEffect(() => {
    if (todayCheckin) {
      setPriority(todayCheckin.top_priority);
      setBlockers(todayCheckin.blockers || '');
      setEnergy(todayCheckin.energy_level || null);
      setIsEditing(false);
    } else {
      setIsEditing(true);
    }
  }, [todayCheckin]);

  const handleSave = async () => {
    if (!priority.trim()) return;
    setLoading(true);
    try {
      await saveTodayCheckin({
        topPriority: priority,
        blockers: blockers.trim() || null,
        energyLevel: energy
      });
      showToast('Daily check-in saved!', 'success');
      setIsEditing(false);
    } catch (e) {
      console.error(e);
      showToast('Failed to save check-in', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!isEditing && todayCheckin) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-3xl border border-blue-100 shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
                onClick={() => setIsEditing(true)}
                className="bg-white/80 backdrop-blur-sm p-2 rounded-full text-blue-500 hover:text-blue-700 shadow-sm hover:shadow-md transition-all"
            >
                <Edit2 size={16} />
            </button>
        </div>
        
        <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-600 text-white p-2 rounded-xl shadow-lg shadow-blue-600/20">
               <Check size={20} />
            </div>
            <div>
                <h3 className="font-bold text-blue-900 text-lg">Daily Check-in Complete</h3>
                <p className="text-blue-600/80 text-xs font-medium uppercase tracking-wide">Ready to execute</p>
            </div>
        </div>
        
        <div className="space-y-4 pl-1">
           <div className="bg-white/60 p-3 rounded-xl backdrop-blur-sm border border-blue-100/50">
             <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1 block">Top Priority</span>
             <p className="text-blue-900 font-bold text-lg leading-tight">{todayCheckin.top_priority}</p>
           </div>
           
           {todayCheckin.blockers && (
             <div>
               <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1 block">Blockers</span>
               <p className="text-blue-800 text-sm font-medium">{todayCheckin.blockers}</p>
             </div>
           )}

           {todayCheckin.energy_level && (
             <div className="flex items-center gap-2">
                <div className="flex gap-0.5">
                    {[1,2,3,4,5].map(l => (
                        <div key={l} className={clsx("w-2 h-6 rounded-full", l <= todayCheckin.energy_level! ? "bg-amber-400" : "bg-gray-200/50")} />
                    ))}
                </div>
                <span className="text-xs font-bold text-blue-800 uppercase tracking-wide">Energy Level</span>
             </div>
           )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-lg shadow-gray-100/50 relative overflow-hidden">
      <div className="flex justify-between items-center mb-6">
         <div>
            <h3 className="font-bold text-gray-900 text-xl">Daily Check-in</h3>
            <p className="text-gray-400 text-sm">Set your intention for today.</p>
         </div>
         {todayCheckin && (
           <button 
             onClick={() => setIsEditing(false)}
             className="text-gray-400 hover:text-gray-600 text-sm font-medium"
           >
             Cancel
           </button>
         )}
      </div>

      <div className="space-y-5">
        <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
                One big thing to achieve <span className="text-red-500">*</span>
            </label>
            <input 
                type="text" 
                className="w-full p-4 bg-gray-50 border-gray-100 rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium text-gray-900 placeholder:text-gray-400"
                placeholder="e.g. Ship the MVP"
                value={priority}
                onChange={e => setPriority(e.target.value)}
            />
        </div>

        <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
                Any blockers?
            </label>
            <input 
                type="text" 
                className="w-full p-4 bg-gray-50 border-gray-100 rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium text-gray-900 placeholder:text-gray-400"
                placeholder="e.g. Waiting on design"
                value={blockers}
                onChange={e => setBlockers(e.target.value)}
            />
        </div>

        <div>
            <label className="block text-sm font-bold text-gray-700 mb-3">
                Energy Level
            </label>
            <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((level) => (
                    <button
                        key={level}
                        onClick={() => setEnergy(level)}
                        className={clsx(
                            "flex-1 h-12 rounded-xl font-bold transition-all border-2",
                            energy === level 
                                ? "bg-amber-100 border-amber-400 text-amber-700 scale-105 shadow-sm" 
                                : "bg-white border-gray-100 text-gray-400 hover:border-gray-200"
                        )}
                    >
                        {level === 5 ? '⚡' : level}
                    </button>
                ))}
            </div>
        </div>

        <button 
            onClick={handleSave}
            disabled={!priority.trim() || loading}
            className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold text-lg hover:bg-black transition-all shadow-lg shadow-gray-900/20 disabled:opacity-50 disabled:shadow-none mt-2 flex items-center justify-center gap-2"
        >
            {loading ? 'Saving...' : <><Save size={20} /> Save Check-in</>}
        </button>
      </div>
    </div>
  );
}
