'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Home, Heart, MessageCircle, Users, LogOut } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import ThemeToggle from '@/components/ThemeToggle';

interface Profile {
  userId: string;
  name: string;
  age: number;
  location: string;
  image: string;
  bio: string;
}

export default function LikedYouPage() {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [likedYouCount, setLikedYouCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    setMounted(true);
    fetchLikedYouProfiles();
    fetchLikedYouCount();
    fetchUnreadCount();
  }, []);

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem('token');
    router.push('/');
  };

  const fetchLikedYouProfiles = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('http://localhost:5001/api/likes/received', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Liked You API response:', data);
        console.log('Number of people who liked you:', data.length);
        
        const transformedProfiles = data.map((profile: any) => {
          let imageUrl = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&h=1200&fit=crop';
          
          if (profile.photos?.[0]) {
            const photoPath = profile.photos[0];
            imageUrl = photoPath.startsWith('http') 
              ? photoPath 
              : `http://localhost:5001${photoPath}`;
          }
          
          return {
            userId: profile.userId,
            name: profile.name,
            age: profile.age,
            location: profile.location || 'Unknown',
            image: imageUrl,
            bio: profile.bio || '',
          };
        });
        setProfiles(transformedProfiles);
        console.log('Transformed profiles:', transformedProfiles.length);
      } else {
        console.error('Failed to fetch liked you profiles. Status:', response.status);
        const errorText = await response.text();
        console.error('Error response:', errorText);
      }
    } catch (error) {
      console.error('Error fetching liked you profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLikedYouCount = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://localhost:5001/api/likes/received', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setLikedYouCount(data.length || 0);
      }
    } catch (error) {
      console.error('Error fetching liked you count:', error);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://localhost:5001/api/messages/unread/count', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  if (!mounted) return null;

  if (loading) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#800020] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Loading profiles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <header className={`px-4 sm:px-6 py-4 flex items-center justify-center relative ${isDarkMode ? 'bg-gray-800 border-b border-gray-700' : 'bg-white border-b border-gray-200'}`}>
        {/* Dark Mode Toggle */}
        <div className="absolute left-2 sm:left-6">
          <ThemeToggle />
        </div>

        <div className="flex items-center gap-3">
          <img 
            src="/images/mflogo.png" 
            alt="MatchFlix Logo" 
            className="w-10 h-10 object-contain"
            style={{ filter: 'drop-shadow(0 0 1px white) drop-shadow(0 0 1px white)' }}
          />
          <h1 
            className="text-2xl sm:text-3xl font-bold" 
            style={{ 
              fontFamily: '"Kavoon", serif', 
              fontWeight: 400, 
              fontStyle: 'normal',
              background: 'linear-gradient(135deg, #800020 0%, #ff6b6b 50%, #800020 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              WebkitTextStroke: '0.5px rgba(255, 255, 255, 0.3)',
              textShadow: '0 0 1px rgba(255, 255, 255, 0.2)'
            }}
          >
            Matchflix
          </h1>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className={`absolute right-2 sm:right-6 flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 transition-colors ${isDarkMode ? 'text-gray-300 hover:text-[#800020]' : 'text-gray-600 hover:text-[#800020]'}`}
        >
          <LogOut className="w-5 h-5" />
          <span className="text-xs sm:text-sm font-medium hidden sm:inline">Logout</span>
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-6 pb-24">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6 text-center">
            <h2 className={`text-xl sm:text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>People Who Liked You</h2>
            <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
              {profiles.length} {profiles.length === 1 ? 'person has' : 'people have'} liked your profile
            </p>
          </div>

          {profiles.length === 0 ? (
            <div className="text-center py-20">
              <Heart className="w-20 h-20 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No likes yet</h3>
              <p className="text-gray-500">Keep swiping to find your match!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {profiles.map((profile) => (
                <div 
                  key={profile.userId}
                  className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-lg cursor-pointer hover:scale-105 transition-transform duration-300"
                >
                  {/* Blurred Profile Image */}
                  <img 
                    src={profile.image}
                    alt={profile.name}
                    className="w-full h-full object-cover blur-2xl"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&h=1200&fit=crop';
                    }}
                  />
                  
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60"></div>
                  
                  {/* Like Badge */}
                  <div className="absolute top-3 right-3">
                    <div className="w-10 h-10 bg-[#800020] rounded-full flex items-center justify-center shadow-lg">
                      <Heart className="w-5 h-5 text-white fill-white" />
                    </div>
                  </div>

                  {/* Profile Info */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                    <div className="backdrop-blur-sm bg-white/10 rounded-lg p-3 border border-white/20">
                      <p className="font-semibold text-lg blur-sm">Someone</p>
                      <p className="text-sm opacity-90 blur-sm">Liked your profile</p>
                    </div>
                  </div>

                  {/* Premium Lock Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-3 mx-auto border-2 border-white/40">
                        <Heart className="w-8 h-8 text-white" />
                      </div>
                      <p className="text-white font-semibold text-sm px-4">
                        Like them back to see who it is!
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className={`fixed bottom-0 left-0 right-0 ${isDarkMode ? 'bg-gray-900/95' : 'bg-white/95'} backdrop-blur-lg border-t ${isDarkMode ? 'border-gray-800' : 'border-gray-200'} px-4 sm:px-6 py-2 shadow-lg`}>
        <div className="max-w-md mx-auto flex items-center justify-around">
          <button 
            onClick={() => router.push('/home')}
            className={`flex flex-col items-center gap-0.5 min-w-[60px] py-2 px-3 rounded-2xl transition-all duration-300 ${isDarkMode ? 'hover:bg-gray-800 text-gray-400 hover:text-pink-400' : 'hover:bg-gray-100 text-gray-500 hover:text-[#800020]'}`}
          >
            <Home className="w-6 h-6 transition-transform duration-300" />
            <span className="text-[10px] font-semibold mt-0.5">Home</span>
          </button>
          
          <button className={`flex flex-col items-center gap-0.5 min-w-[60px] py-2 px-3 rounded-2xl transition-all duration-300 ${isDarkMode ? 'bg-pink-400/10 text-pink-400' : 'bg-[#800020]/10 text-[#800020]'}`}>
            <Heart className="w-6 h-6 transition-transform duration-300" />
            <span className="text-[10px] font-semibold mt-0.5">Liked</span>
          </button>
          
          <button 
            onClick={() => router.push('/discover')}
            className={`flex flex-col items-center gap-0.5 min-w-[60px] py-2 px-3 rounded-2xl transition-all duration-300 ${isDarkMode ? 'hover:bg-gray-800 text-gray-400 hover:text-pink-400' : 'hover:bg-gray-100 text-gray-500 hover:text-[#800020]'}`}
          >
            <svg className="w-6 h-6 transition-transform duration-300" viewBox="0 0 24 24" fill="currentColor">
              <rect x="2" y="6" width="20" height="3" rx="1.5"/>
              <rect x="2" y="11" width="20" height="3" rx="1.5"/>
              <rect x="2" y="16" width="20" height="3" rx="1.5"/>
            </svg>
            <span className="text-[10px] font-semibold mt-0.5">Discover</span>
          </button>
          
          <button 
            onClick={() => router.push('/messages')}
            className={`flex flex-col items-center gap-0.5 min-w-[60px] py-2 px-3 rounded-2xl transition-all duration-300 ${isDarkMode ? 'hover:bg-gray-800 text-gray-400 hover:text-pink-400' : 'hover:bg-gray-100 text-gray-500 hover:text-[#800020]'}`}
          >
            <MessageCircle className="w-6 h-6 transition-transform duration-300" />
            <span className="text-[10px] font-semibold mt-0.5">Messages</span>
          </button>
          
          <button 
            onClick={() => router.push('/matches')}
            className={`flex flex-col items-center gap-0.5 min-w-[60px] py-2 px-3 rounded-2xl transition-all duration-300 ${isDarkMode ? 'hover:bg-gray-800 text-gray-400 hover:text-pink-400' : 'hover:bg-gray-100 text-gray-500 hover:text-[#800020]'}`}
          >
            <Users className="w-6 h-6 transition-transform duration-300" />
            <span className="text-[10px] font-semibold mt-0.5">Matches</span>
          </button>
        </div>
      </nav>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-2xl max-w-sm w-full p-6`}>
            <div className="text-center mb-6">
              <div className={`w-16 h-16 ${isDarkMode ? 'bg-red-900/30' : 'bg-red-100'} rounded-full flex items-center justify-center mx-auto mb-4`}>
                <LogOut className="w-8 h-8 text-[#800020]" />
              </div>
              <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'} mb-2`}>Logout</h2>
              <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Are you sure you want to logout?</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="flex-1 px-4 py-3 bg-[#800020] hover:bg-[#660019] text-white font-medium rounded-lg transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
