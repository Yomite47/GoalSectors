'use client';

import { useUser } from '@/lib/store';
import { getStore } from '@/lib/data';
import { useState, useEffect } from 'react';

export default function DataTestPage() {
    const { profile } = useUser();
    const [storeType, setStoreType] = useState<string>('Loading...');

    useEffect(() => {
        const store = getStore();
        setStoreType(store.constructor.name);
    }, []);

    return (
        <div className="p-8 max-w-2xl mx-auto space-y-8">
            <h1 className="text-3xl font-bold">Data Layer Test</h1>
            
            <div className="bg-gray-100 p-4 rounded-lg">
                <p><strong>Active Store:</strong> {storeType}</p>
                <p><strong>User ID:</strong> {profile.id}</p>
                <p><strong>Enabled Sectors:</strong> {profile.enabledSectors.join(', ') || 'None'}</p>
            </div>

            <div className="space-y-4">
                <h2 className="text-xl font-bold">Current State</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="border p-4 rounded-lg">
                        <h3 className="font-bold">Goals</h3>
                        <p className="text-2xl">{profile.goals.length}</p>
                    </div>
                    <div className="border p-4 rounded-lg">
                        <h3 className="font-bold">Tasks</h3>
                        <p className="text-2xl">{profile.tasks.length}</p>
                    </div>
                    <div className="border p-4 rounded-lg">
                        <h3 className="font-bold">Habits</h3>
                        <p className="text-2xl">{profile.habits.length}</p>
                    </div>
                </div>
            </div>

            <div className="text-sm text-gray-500">
                <p>Check console logs for detailed data operations.</p>
                <p>If Supabase env vars are missing, this should show "LocalStore".</p>
                <p>If Supabase is configured, this should show "SupabaseStore".</p>
            </div>
        </div>
    );
}
