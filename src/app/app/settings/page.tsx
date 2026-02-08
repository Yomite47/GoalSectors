'use client';

import { useUser } from '@/lib/store';
import { User, Trash2 } from 'lucide-react';

export default function SettingsPage() {
  const { profile, updateProfile } = useUser();

  const handleResetApp = () => {
    if (confirm('Are you sure you want to reset all data? This cannot be undone.')) {
        localStorage.clear();
        window.location.reload();
    }
  };

  return (
    <div className="space-y-8 pb-32 px-4 pt-4">
      <h1 className="text-2xl font-bold">Settings</h1>

      {/* Profile Section */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-gray-700">Profile</h2>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
            <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                    <User size={32} />
                </div>
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-500 mb-1">Display Name</label>
                    <input 
                        type="text" 
                        value={profile.name || ''} 
                        onChange={(e) => updateProfile({ name: e.target.value })}
                        placeholder="Enter your name"
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>
            </div>
        </div>
      </section>

      {/* Data Management */}
      <section className="space-y-4 pt-4 border-t">
        <h2 className="text-lg font-bold text-red-600">Danger Zone</h2>
        <div className="bg-red-50 border border-red-100 p-4 rounded-xl flex items-center justify-between">
            <div>
                <div className="font-bold text-red-900">Reset App Data</div>
                <div className="text-sm text-red-700">Clear all tasks, goals, and habits.</div>
            </div>
            <button 
                onClick={handleResetApp}
                className="bg-white border border-red-200 text-red-600 px-4 py-2 rounded-lg font-bold hover:bg-red-50 transition-colors flex items-center gap-2"
            >
                <Trash2 size={16} />
                Reset
            </button>
        </div>
      </section>

      <div className="h-10"></div>
    </div>
  );
}
