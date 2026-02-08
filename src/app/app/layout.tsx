'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/lib/store';
import { BottomNav } from '@/components/BottomNav';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !profile.onboardingCompleted) {
      router.push('/onboarding');
    }
  }, [profile.onboardingCompleted, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">Loading GoalSectors...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <main className="container mx-auto max-w-md">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
