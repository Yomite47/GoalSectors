'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, MessageSquare, CheckSquare, Zap, Target } from 'lucide-react';
import { clsx } from 'clsx';
import { useUser } from '@/lib/store';

export function BottomNav() {
  const pathname = usePathname();
  const { profile } = useUser();

  const navItems = [
    { href: '/app', icon: Home, label: 'Home', enabled: true },
    { href: '/app/tasks', icon: CheckSquare, label: 'Tasks', enabled: profile.enabledSectors.includes('Productivity') },
    { href: '/app/habits', icon: Zap, label: 'Habits', enabled: profile.enabledSectors.includes('Habits') },
    { href: '/app/goals', icon: Target, label: 'Goals', enabled: profile.enabledSectors.includes('Goals') },
    { href: '/app/chat', icon: MessageSquare, label: 'Coach', enabled: true },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe z-50">
      <div className="flex justify-around items-center h-16">
        {navItems.filter(item => item.enabled).map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'flex flex-col items-center justify-center w-full h-full space-y-1',
                isActive ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
              )}
            >
              <Icon size={24} />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
