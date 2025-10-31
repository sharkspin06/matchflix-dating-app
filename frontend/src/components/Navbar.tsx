'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Heart, MessageCircle, User, LogOut, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  const navItems = [
    { href: '/discover', icon: Flame, label: 'Discover' },
    { href: '/matches', icon: Heart, label: 'Matches' },
    { href: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/discover" className="flex items-center space-x-2">
            <div className="bg-gradient-to-r from-orange-600 to-orange-800 p-2 rounded-lg">
              <Heart className="w-6 h-6 text-white fill-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent">
              MatchFlix
            </span>
          </Link>

          <div className="flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors',
                    isActive
                      ? 'bg-orange-50 text-orange-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="hidden sm:inline font-medium">{item.label}</span>
                </Link>
              );
            })}
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="hidden sm:inline font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
