'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Heart, MessageCircle, User } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { href: '/discover', icon: Home, label: 'Home' },
    { href: '/matches', icon: Heart, label: 'Matches' },
    { href: '/chats', icon: MessageCircle, label: 'Chats' },
    { href: '/my-profile', icon: User, label: 'Profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-area-pb">
      <div className="max-w-md mx-auto px-4">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center justify-center flex-1 h-full transition-colors relative',
                  isActive ? 'text-purple-600' : 'text-gray-400'
                )}
              >
                <Icon className={cn('w-6 h-6', isActive && 'fill-purple-600')} />
                <span className="text-xs mt-1 font-medium">{item.label}</span>
                {isActive && (
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-purple-600 rounded-t-full"></div>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
