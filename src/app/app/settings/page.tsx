'use client';

import { useState } from 'react';
import { useUser } from '@/lib/store';
import { CheckSquare, Zap, Target, Plus, User, Bell, Trash2, LogOut } from 'lucide-react';
import { clsx } from 'clsx';
import { Sector } from '@/types';
import PremiumModal from '@/components/PremiumModal';
import { requestNotificationPermission } from '@/lib/notifications';

export default function SettingsPage() {
  const { profile, updateProfile, addGoal, seedDemoData } = useUser();
  const [newGoal, setNewGoal] = useState('');
  const [demoLoading, setDemoLoading] = useState(false);
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);

  const toggleSector = (sector: Sector) => {
    const current = profile.enabledSectors;
    let updated;
    if (current.includes(sector)) {
      updated = current.filter(s => s !== sector);
    } else {
      updated = [...current, sector];
    }
    updateProfile({ enabledSectors: updated });
  };

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoal.trim()) return;
    addGoal(newGoal);
    setNewGoal('');
  };

  const handleUpgrade = () => {
    // In a real app, redirect to Stripe
    updateProfile({ isPremium: true });
    setIsPremiumModalOpen(false);
    alert("🎉 Welcome to Premium! (Mock Purchase)");
  };

  const handleNotificationToggle = async () => {
    if (!profile.notificationsEnabled) {
      const granted = await requestNotificationPermission();
      if (granted) {
        updateProfile({ notificationsEnabled: true });
        if (!profile.notificationTime) {
            updateProfile({ notificationTime: '09:00' });
        }
      } else {
        alert('Notification permission denied. Please enable them in your browser settings.');
      }
    } else {
      updateProfile({ notificationsEnabled: false });
    }
  };

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

      {/* Subscription Section */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-gray-700">Subscription</h2>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center">
                <div>
                    <div className="font-bold text-gray-900 text-lg">
                        {profile.isPremium ? 'Premium Plan' : 'Free Plan'}
                    </div>
                    <p className="text-gray-500 text-sm">
                        {profile.isPremium 
                            ? 'You have access to all features.' 
                            : 'Upgrade to unlock unlimited AI Coach.'}
                    </p>
                </div>
                {!profile.isPremium && (
                    <button 
                        onClick={() => setIsPremiumModalOpen(true)}
                        className="bg-black text-white px-5 py-2 rounded-lg font-bold hover:bg-gray-800 transition-all flex items-center gap-2"
                    >
                        <Zap size={16} className="fill-yellow-400 text-yellow-400" />
                        Upgrade
                    </button>
                )}
                {profile.isPremium && (
                    <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase">
                        Active
                    </div>
                )}
            </div>
        </div>
      </section>

      <PremiumModal 
        isOpen={isPremiumModalOpen} 
        onClose={() => setIsPremiumModalOpen(false)} 
        onUpgrade={handleUpgrade} 
      />

      {/* Sectors Section */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-gray-700">Enabled Sectors</h2>
        <div className="grid gap-3">
          {[
            { id: 'Productivity' as Sector, icon: CheckSquare, label: 'Productivity', desc: 'Tasks & To-dos' },
            { id: 'Habits' as Sector, icon: Zap, label: 'Habits', desc: 'Daily Routines' },
            { id: 'Goals' as Sector, icon: Target, label: 'Goals', desc: 'Long-term Plans' },
          ].map((item) => {
            const isEnabled = profile.enabledSectors.includes(item.id);
            return (
              <button
                key={item.id}
                onClick={() => toggleSector(item.id)}
                className={clsx(
                  "flex items-center gap-4 p-4 rounded-xl border-2 transition-all w-full text-left",
                  isEnabled 
                    ? "border-blue-600 bg-blue-50" 
                    : "border-gray-200 bg-white hover:border-gray-300"
                )}
              >
                <div className={clsx(
                  "p-3 rounded-full",
                  isEnabled ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-500"
                )}>
                  <item.icon size={24} />
                </div>
                <div>
                  <div className="font-bold text-lg">{item.label}</div>
                  <div className="text-sm text-gray-500">{item.desc}</div>
                </div>
                <div className="ml-auto">
                  <div className={clsx(
                    "w-6 h-6 rounded-full border-2 flex items-center justify-center",
                    isEnabled ? "border-blue-600 bg-blue-600" : "border-gray-300"
                  )}>
                    {isEnabled && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Notifications Section */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-gray-700">Notifications</h2>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="bg-purple-100 text-purple-600 p-2 rounded-lg">
                        <Bell size={24} />
                    </div>
                    <div>
                        <div className="font-bold text-gray-900">Daily Reminders</div>
                        <div className="text-sm text-gray-500">Get notified to check your goals</div>
                    </div>
                </div>
                <button 
                    onClick={handleNotificationToggle}
                    className={clsx(
                        "w-12 h-6 rounded-full transition-colors relative",
                        profile.notificationsEnabled ? "bg-blue-600" : "bg-gray-200"
                    )}
                >
                    <div className={clsx(
                        "w-4 h-4 bg-white rounded-full absolute top-1 transition-all shadow-sm",
                        profile.notificationsEnabled ? "left-7" : "left-1"
                    )} />
                </button>
            </div>

            {profile.notificationsEnabled && (
                <div className="pt-4 border-t border-gray-100">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Reminder Time</label>
                    <input 
                        type="time" 
                        value={profile.notificationTime || '09:00'}
                        onChange={(e) => updateProfile({ notificationTime: e.target.value })}
                        className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                        Note: Notifications work best when the app is open in a tab on your computer or phone.
                    </p>
                </div>
            )}
        </div>
      </section>

      {/* Goals Management Section */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-gray-700">Manage Goals</h2>
        
        {/* Add Goal */}
        <form onSubmit={handleAddGoal} className="flex gap-2">
            <input 
              type="text" 
              placeholder="Add a new goal..." 
              className="flex-1 p-3 border rounded-xl"
              value={newGoal}
              onChange={(e) => setNewGoal(e.target.value)}
            />
            <button 
              type="submit" 
              className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700"
              disabled={!newGoal.trim()}
            >
                <Plus size={24} />
            </button>
        </form>

        {/* Goals List */}
        <div className="space-y-3">
          {profile.goals.length === 0 ? (
            <p className="text-gray-500 text-sm">No goals set yet.</p>
          ) : (
            profile.goals.map(goal => (
              <div key={goal.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
                <span className="font-medium">{goal.title}</span>
                {/* Future: Add delete/edit buttons here */}
              </div>
            ))
          )}
        </div>
      </section>

      {/* Developer / Demo Section (Hidden for Production) */}
      {/* 
      <section className="space-y-4 pt-8 border-t">
        <h2 className="text-lg font-bold text-gray-700">System Status</h2>
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
            <div>
                <div className="font-bold text-gray-900">Data Storage</div>
                <div className="text-sm text-gray-500">
                    {process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Cloud Sync (Supabase)' : 'Local Browser Storage'}
                </div>
            </div>
            <div className={clsx("px-3 py-1 rounded-full text-xs font-bold", 
                process.env.NEXT_PUBLIC_SUPABASE_URL ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"
            )}>
                {process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Online' : 'Offline Mode'}
            </div>
        </div>

        <h2 className="text-lg font-bold text-gray-700 mt-6">Demo Mode</h2>
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl">
            <div className="flex justify-between items-center mb-2">
                <div>
                    <h3 className="font-bold text-yellow-800">Populate Demo Data</h3>
                    <p className="text-sm text-yellow-600">Instantly fill app with sample data for judging.</p>
                </div>
                <button 
                    onClick={async () => {
                        if (confirm('This will populate sample data if your account is empty. Continue?')) {
                            setDemoLoading(true);
                            try {
                                await seedDemoData();
                                alert('Demo data seeded!');
                            } catch (error) {
                                console.error(error);
                                alert('Failed to seed data. Check console for details.');
                            } finally {
                                setDemoLoading(false);
                            }
                        }
                    }}
                    disabled={demoLoading}
                    className="bg-yellow-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-yellow-600 disabled:opacity-50"
                >
                    {demoLoading ? 'Seeding...' : 'Enable Demo Mode'}
                </button>
            </div>
            <p className="text-xs text-yellow-600 italic">
                Adds 3 tasks, 2 habits (w/ streaks), 2 goals, and 5 AI runs.
            </p>
        </div>
      </section>
      */}

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
