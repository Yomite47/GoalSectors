'use client';

import { useUser } from '@/lib/store';
import { Sector } from '@/types';
import Link from 'next/link';
import { Settings } from 'lucide-react';

interface SectorGuardProps {
    sector: Sector;
    children: React.ReactNode;
}

export function SectorGuard({ sector, children }: SectorGuardProps) {
    const { profile, isLoading } = useUser();

    if (isLoading) {
        return <div className="p-8 text-center text-gray-500">Loading...</div>;
    }

    if (!profile.enabledSectors.includes(sector)) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
                <div className="bg-gray-100 p-4 rounded-full mb-4">
                    <Settings className="w-8 h-8 text-gray-400" />
                </div>
                <h2 className="text-xl font-bold mb-2">{sector} is disabled</h2>
                <p className="text-gray-500 mb-6">
                    You haven't enabled the {sector} sector yet. Enable it in settings to start using this feature.
                </p>
                <Link 
                    href="/app/settings" 
                    className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors"
                >
                    Go to Settings
                </Link>
            </div>
        );
    }

    return <>{children}</>;
}
