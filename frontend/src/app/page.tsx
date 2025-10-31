'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ThumbsUp, MessageCircle, Heart } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      const token = localStorage.getItem('token');
      if (token) {
        router.push('/discover');
      }
    }
  }, [mounted, router]);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  const handleNavigation = (path: string) => {
    setIsTransitioning(true);
    setTimeout(() => {
      router.push(path);
    }, 300);
  };

  return (
    <div className={`min-h-screen flex items-center justify-center px-4 lg:px-16 relative bg-white transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
      {/* Left Side - Decorative Cards */}
      <div className="hidden lg:flex flex-1 items-center justify-center relative max-w-2xl">
        {/* Background Card 1 */}
        <div className="absolute left-20 top-1/2 -translate-y-1/2 w-80 h-[500px] bg-gradient-to-br from-[#800020] to-[#660019] rounded-3xl shadow-2xl transform -rotate-12 overflow-hidden border-8 border-white">
          {/* Movie Grid */}
          <div className="grid grid-cols-2 gap-3 p-4 h-full">
            <div className="rounded-xl overflow-hidden">
              <img src="/images/in the mood for love.jpg" alt="In the Mood for Love" className="w-full h-full object-cover" />
            </div>
            <div className="rounded-xl overflow-hidden">
              <img src="/images/chungking.jpg" alt="Chungking Express" className="w-full h-full object-cover" />
            </div>
            <div className="rounded-xl overflow-hidden">
              <img src="/images/happytogether.jpg" alt="Happy Together" className="w-full h-full object-cover" />
            </div>
            <div className="rounded-xl overflow-hidden">
              <img src="/images/fallenangels.jpg" alt="Fallen Angels" className="w-full h-full object-cover" />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-16 h-16 rounded-full bg-white border-4 border-white overflow-hidden shadow-lg" style={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)' }}>
                <img src="/images/khalil.jpg" alt="Khalil Ramos" className="w-full h-full object-cover" />
              </div>
              <div>
                <h3 className="text-white font-bold text-2xl" style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.7)' }}>Khalil Ramos</h3>
                <p className="text-white/80 text-base" style={{ textShadow: '1px 1px 3px rgba(0, 0, 0, 0.6)' }}>1.5 km away</p>
              </div>
            </div>
            <div className="flex gap-1 mb-3">
              <div className="w-2 h-2 rounded-full bg-white"></div>
              <div className="w-2 h-2 rounded-full bg-white/40"></div>
              <div className="w-2 h-2 rounded-full bg-white/40"></div>
              <div className="w-2 h-2 rounded-full bg-white/40"></div>
              <div className="w-2 h-2 rounded-full bg-white/40"></div>
            </div>
          </div>
        </div>
        {/* Floating Icon - Outside Card */}
        <div className="absolute left-8 top-1/2 -translate-y-1/2 -translate-y-20 w-16 h-16 rounded-full flex items-center justify-center bg-white z-30" style={{ boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)' }}>
          <ThumbsUp className="w-8 h-8 text-[#800020] fill-[#800020]" />
        </div>

        {/* Foreground Card 2 */}
        <div className="relative left-32 w-96 h-[540px] bg-gradient-to-br from-[#9a0028] to-[#800020] rounded-3xl shadow-2xl transform rotate-6 overflow-hidden border-8 border-white z-10">
          {/* Movie Grid */}
          <div className="grid grid-cols-2 gap-3 p-4 h-full">
            <div className="rounded-xl overflow-hidden">
              <img src="/images/chungking.jpg" alt="Chungking Express" className="w-full h-full object-cover" />
            </div>
            <div className="rounded-xl overflow-hidden">
              <img src="/images/fallenangels.jpg" alt="Fallen Angels" className="w-full h-full object-cover" />
            </div>
            <div className="rounded-xl overflow-hidden">
              <img src="/images/in the mood for love.jpg" alt="In the Mood for Love" className="w-full h-full object-cover" />
            </div>
            <div className="rounded-xl overflow-hidden">
              <img src="/images/happytogether.jpg" alt="Happy Together" className="w-full h-full object-cover" />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-16 h-16 rounded-full bg-white border-4 border-white overflow-hidden shadow-lg" style={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)' }}>
                <img src="/images/khalil.jpg" alt="Khalil Ramos" className="w-full h-full object-cover" />
              </div>
              <div>
                <h3 className="text-white font-bold text-2xl" style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.7)' }}>Khalil Ramos</h3>
                <p className="text-white/80 text-base" style={{ textShadow: '1px 1px 3px rgba(0, 0, 0, 0.6)' }}>1.5 km away</p>
              </div>
            </div>
            <div className="flex gap-1 mb-3">
              <div className="w-2 h-2 rounded-full bg-white"></div>
              <div className="w-2 h-2 rounded-full bg-white/40"></div>
              <div className="w-2 h-2 rounded-full bg-white/40"></div>
              <div className="w-2 h-2 rounded-full bg-white/40"></div>
              <div className="w-2 h-2 rounded-full bg-white/40"></div>
            </div>
          </div>
        </div>
        {/* Floating Icons - Outside Card */}
        <div className="absolute left-[40rem] top-1/2 -translate-y-[16rem] w-16 h-16 rounded-full flex items-center justify-center bg-white z-30" style={{ boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)' }}>
          <Heart className="w-8 h-8 text-[#800020] fill-[#800020]" />
        </div>
        <div className="absolute left-[38rem] top-1/2 translate-y-20 w-16 h-16 rounded-full flex items-center justify-center bg-white z-30" style={{ boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)' }}>
          <MessageCircle className="w-8 h-8 text-[#800020]" />
        </div>
      </div>

      {/* Right Side - Welcome Options */}
      <div className="w-full max-w-md lg:max-w-lg relative z-20">
        <div className="p-8 lg:p-12 mx-auto">
          <div className="flex flex-col items-center mb-10">
            <div className="flex items-center gap-4 mb-3">
              <img src="/images/mflogo.png" alt="Frame Logo" className="w-24 h-24 object-contain" style={{ backgroundColor: 'transparent', filter: 'drop-shadow(0 0 1px white) drop-shadow(0 0 1px white)' }} />
              <h1 
                className="text-5xl font-bold" 
                style={{ 
                  fontFamily: '"Kavoon", serif', 
                  fontWeight: 400, 
                  fontStyle: 'normal',
                  background: 'linear-gradient(135deg, #800020 0%, #ff6b6b 50%, #800020 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}
              >
                Matchflix
              </h1>
            </div>
            <p className="text-gray-600 text-center text-sm">
              Find your perfect match through shared love of films
            </p>
          </div>

          <div className="space-y-3 mt-16">
            {/* Create Account Button */}
            <button 
              onClick={() => handleNavigation('/register')}
              className="w-full py-3 px-5 bg-[#800020] hover:bg-[#660019] text-white font-medium rounded-lg shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 hover:-translate-y-1 active:scale-95"
            >
              Create an Account
            </button>

            {/* Sign In Button */}
            <button 
              onClick={() => handleNavigation('/login')}
              className="w-full py-3 px-5 bg-white border-2 border-[#800020] text-[#800020] hover:bg-[#800020] hover:text-white font-medium rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-105 hover:-translate-y-1 active:scale-95"
            >
              I Have an Account
            </button>
          </div>

          <div className="mt-12 text-center">
            <p className="text-sm text-gray-500">
              By continuing, you agree to our{' '}
              <Link href="/terms" className="text-[#800020] hover:text-[#660019] underline">
                Terms of Service
              </Link>
              {' '}and{' '}
              <Link href="/privacy" className="text-[#800020] hover:text-[#660019] underline">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
