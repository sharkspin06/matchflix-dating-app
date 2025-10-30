'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, X, Heart, Star, MessageCircle, User, Zap, Home, Users, ThumbsUp, ThumbsDown, Sun, Moon, LogOut } from 'lucide-react';

export default function DiscoverPage() {
  const router = useRouter();
  const [currentProfile, setCurrentProfile] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showProfileDetails, setShowProfileDetails] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [hasDragged, setHasDragged] = useState(false);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [seenProfileIds, setSeenProfileIds] = useState<number[]>([]);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [matchedUser, setMatchedUser] = useState<any>(null);
  const [likedYouCount, setLikedYouCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    setMounted(true);
    // Load seen profile IDs from localStorage
    const savedSeenIds = localStorage.getItem('seenProfileIds');
    if (savedSeenIds) {
      setSeenProfileIds(JSON.parse(savedSeenIds));
    }
    fetchProfiles();
    fetchLikedYouCount();
    fetchUnreadCount();
  }, []);

  const fetchProfiles = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('http://localhost:5001/api/users/discover', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Fetched profiles from API:', data.length);
        
        // Get seen profile IDs from localStorage
        const savedSeenIds = localStorage.getItem('seenProfileIds');
        const seenIds = savedSeenIds ? JSON.parse(savedSeenIds) : [];
        console.log('Seen profile IDs:', seenIds.length);
        
        // Filter out profiles that have already been seen
        const unseenProfiles = data.filter((profile: any) => !seenIds.includes(profile.userId));
        console.log('Unseen profiles after filter:', unseenProfiles.length);
        
        // Transform API data to match component format
        const transformedProfiles = unseenProfiles.map((profile: any) => ({
          name: profile.name,
          age: profile.age,
          location: profile.location || 'Unknown',
          occupation: profile.bio || '',
          image: profile.photos?.[0] ? `http://localhost:5001${profile.photos[0]}` : 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&h=1200&fit=crop',
          bio: profile.bio || '',
          about: profile.bio || '',
          interests: profile.interests || [],
          location_detail: profile.location || 'Unknown',
          lives_in: profile.location?.split(',')[0] || 'Unknown',
          distance: '1.5 km away', // You can calculate this based on coordinates
          topFilms: (profile.topFilms || []).map((poster: string) => ({ 
            poster: poster.startsWith('http') ? poster : `http://localhost:5001${poster}` 
          })),
          favoriteGenres: profile.interests || [],
          zodiac: profile.zodiac || '',
          education: profile.education || '',
          pets: profile.pets || '',
          drinkingHabits: profile.drinkingHabits || '',
          smokingHabits: profile.smokingHabits || '',
          gender: profile.gender || '',
          preferredGender: profile.preferredGender || [],
          relationshipGoals: profile.relationshipGoals || [],
          userId: profile.userId,
        }));
        setProfiles(transformedProfiles);
        console.log('Set profiles state with:', transformedProfiles.length, 'profiles');
      } else {
        console.error('Failed to fetch profiles. Status:', response.status);
        const errorText = await response.text();
        console.error('Error response:', errorText);
      }
    } catch (error) {
      console.error('Error fetching profiles:', error);
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

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem('token');
    router.push('/');
  };

  const profile = profiles[currentProfile];

  const handleSwipe = async (direction: 'left' | 'right') => {
    // Handle swipe logic
    console.log(direction === 'right' ? 'Liked!' : 'Skipped!');
    
    // Mark current profile as seen
    const currentProfileData = profiles[currentProfile];
    if (currentProfileData && currentProfileData.userId) {
      const updatedSeenIds = [...seenProfileIds, currentProfileData.userId];
      setSeenProfileIds(updatedSeenIds);
      // Save to localStorage
      localStorage.setItem('seenProfileIds', JSON.stringify(updatedSeenIds));
      
      // If swiped right, send like to backend
      if (direction === 'right') {
        console.log('Sending like to user:', currentProfileData.userId, currentProfileData.name);
        try {
          const token = localStorage.getItem('token');
          if (token) {
            const response = await fetch('http://localhost:5001/api/likes', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
              },
              body: JSON.stringify({
                likedUserId: currentProfileData.userId,
              }),
            });
            
            if (response.ok) {
              const data = await response.json();
              console.log('✅ Like sent successfully!', data);
              
              // Check if it's a match
              if (data.isMatch) {
                console.log('💕 It\'s a match!');
                // Show match modal with matched user info
                setMatchedUser({
                  name: currentProfileData.name,
                  image: currentProfileData.image,
                  userId: currentProfileData.userId
                });
                setShowMatchModal(true);
              }
            } else {
              console.error('❌ Failed to send like. Status:', response.status);
              const errorText = await response.text();
              console.error('Error response:', errorText);
            }
          } else {
            console.error('No auth token found');
          }
        } catch (error) {
          console.error('Error sending like:', error);
        }
      }
    }
    
    // Start transition
    setIsTransitioning(true);
    
    // Wait for card to animate out
    setTimeout(() => {
      if (currentProfile < profiles.length - 1) {
        setCurrentProfile(currentProfile + 1);
      } else {
        // Reached end of profiles, fetch new ones
        setCurrentProfile(0);
        fetchProfiles();
      }
      
      // Reset drag state
      setDragOffset({ x: 0, y: 0 });
      
      // End transition
      setIsTransitioning(false);
    }, 300);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Only open modal if user didn't drag
    if (!hasDragged) {
      setShowProfileDetails(true);
    }
  };

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    setHasDragged(false); // Reset drag flag
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setDragStart({ x: clientX, y: clientY });
    setDragOffset({ x: 0, y: 0 }); // Reset offset when starting new drag
  };

  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    const offsetX = clientX - dragStart.x;
    const offsetY = clientY - dragStart.y;
    
    // Mark as dragged if movement is significant
    if (Math.abs(offsetX) > 5 || Math.abs(offsetY) > 5) {
      setHasDragged(true);
    }
    
    setDragOffset({ x: offsetX, y: offsetY });
  };

  const handleDragEnd = () => {
    if (!isDragging) return;
    
    setIsDragging(false);
    
    const swipeThreshold = 100;
    
    if (Math.abs(dragOffset.x) > swipeThreshold) {
      if (dragOffset.x > 0) {
        handleSwipe('right'); // Like
      } else {
        handleSwipe('left'); // Skip
      }
    } else {
      // Reset position if not swiped enough
      setDragOffset({ x: 0, y: 0 });
    }
  };

  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading profiles...</div>
      </div>
    );
  }

  if (profiles.length === 0) {
    return (
      <div className={`min-h-screen flex flex-col ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        {/* Header */}
        <header className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b px-6 py-4 flex items-center justify-center relative`}>
          {/* Theme Toggle */}
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`absolute left-6 p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
          >
            {isDarkMode ? <Sun className="w-6 h-6 text-yellow-400" /> : <Moon className="w-6 h-6 text-gray-700" />}
          </button>
          <h1 
            className="text-3xl font-bold" 
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
          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className={`absolute right-6 flex items-center gap-2 px-4 py-2 transition-colors ${isDarkMode ? 'text-gray-300 hover:text-[#800020]' : 'text-gray-600 hover:text-[#800020]'}`}
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center p-4 pb-24">
          <div className="text-center">
            <p className={`text-xl mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>No more profiles to show</p>
            <button 
              onClick={() => router.push('/')}
              className="px-6 py-2 bg-[#800020] text-white rounded-lg hover:bg-[#660019] transition-colors"
            >
              Go Home
            </button>
          </div>
        </main>

        {/* Bottom Navigation */}
        <nav className={`fixed bottom-0 left-0 right-0 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-t px-6 py-3`}>
          <div className="max-w-md mx-auto flex items-center justify-around">
            <button 
              onClick={() => router.push('/home')}
              className="flex flex-col items-center gap-1 text-gray-400 hover:text-[#800020] transition-all duration-300 hover:scale-110 active:scale-95"
            >
              <Home className="w-6 h-6 transition-transform duration-300" />
              <span className="text-xs font-medium">Home</span>
            </button>
            
            <button 
              onClick={() => router.push('/liked-you')}
              className="flex flex-col items-center gap-1 text-gray-400 hover:text-[#800020] transition-all duration-300 hover:scale-110 active:scale-95"
            >
              <div className="relative">
                <Heart className="w-6 h-6 transition-transform duration-300" />
                {likedYouCount > 0 && (
                  <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {likedYouCount > 9 ? '9+' : likedYouCount}
                  </div>
                )}
              </div>
              <span className="text-xs font-medium">Liked You</span>
            </button>
            
            <button className="flex flex-col items-center gap-1 text-[#800020] transition-all duration-300 hover:scale-110 active:scale-95 relative">
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-12 h-1 bg-[#800020] rounded-full transition-all duration-300"></div>
              <svg className="w-6 h-6 transition-transform duration-300" viewBox="0 0 24 24" fill="currentColor">
                <rect x="2" y="6" width="20" height="3" rx="1.5"/>
                <rect x="2" y="11" width="20" height="3" rx="1.5"/>
                <rect x="2" y="16" width="20" height="3" rx="1.5"/>
              </svg>
              <span className="text-xs font-medium">Discover</span>
            </button>
            
            <button 
              onClick={() => router.push('/messages')}
              className="flex flex-col items-center gap-1 text-gray-400 hover:text-[#800020] transition-all duration-300 hover:scale-110 active:scale-95"
            >
              <div className="relative">
                <MessageCircle className="w-6 h-6 transition-transform duration-300" />
                {unreadCount > 0 && (
                  <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </div>
                )}
              </div>
              <span className="text-xs font-medium">Messages</span>
            </button>
            
            <button 
              onClick={() => router.push('/matches')}
              className="flex flex-col items-center gap-1 text-gray-400 hover:text-[#800020] transition-all duration-300 hover:scale-110 active:scale-95"
            >
              <Users className="w-6 h-6 transition-transform duration-300" />
              <span className="text-xs font-medium">Matches</span>
            </button>
          </div>
        </nav>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <header className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b px-6 py-4 flex items-center justify-center relative`}>
        {/* Theme Toggle */}
        <button 
          onClick={() => setIsDarkMode(!isDarkMode)}
          className={`absolute left-6 p-2 rounded-full transition-all duration-300 ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}
        >
          {isDarkMode ? (
            <Sun className="w-6 h-6 text-yellow-400" />
          ) : (
            <Moon className="w-6 h-6 text-gray-700" />
          )}
        </button>

        <div className="flex items-center gap-3">
          <img 
            src="/images/mflogo.png" 
            alt="MatchFlix Logo" 
            className="w-10 h-10 object-contain"
          />
          <h1 
            className="text-3xl font-bold" 
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
        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className={`absolute right-6 flex items-center gap-2 px-4 py-2 transition-colors ${isDarkMode ? 'text-gray-300 hover:text-[#800020]' : 'text-gray-600 hover:text-[#800020]'}`}
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4 pb-24">
        <div className="w-full max-w-xs flex-1 flex flex-col justify-center max-h-[calc(100vh-160px)]">
          {/* Profile Card */}
          <div 
            className={`relative bg-white rounded-3xl overflow-hidden border-6 border-white shadow-[0_20px_60px_rgba(0,0,0,0.5)] cursor-grab active:cursor-grabbing select-none transition-opacity duration-300 h-[550px] ${isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}
            style={{
              transform: `translate(${dragOffset.x}px, ${dragOffset.y}px) rotate(${dragOffset.x * 0.1}deg)`,
              transition: isDragging ? 'none' : isTransitioning ? 'all 0.3s ease-out' : 'transform 0.3s ease-out',
            }}
            onMouseDown={handleDragStart}
            onMouseMove={handleDragMove}
            onMouseUp={handleDragEnd}
            onMouseLeave={handleDragEnd}
            onTouchStart={handleDragStart}
            onTouchMove={handleDragMove}
            onTouchEnd={handleDragEnd}
            onClick={handleCardClick}
          >
            {/* Background Color */}
            <div className="relative h-[550px] bg-[#800020]">
              
              {/* Swipe Indicators */}
              {isDragging && dragOffset.x > 50 && (
                <div className="absolute top-8 right-8 z-50">
                  <div className="bg-green-500 text-white p-4 rounded-full shadow-2xl border-4 border-white">
                    <ThumbsUp className="w-12 h-12" strokeWidth={3} />
                  </div>
                </div>
              )}
              {isDragging && dragOffset.x < -50 && (
                <div className="absolute top-8 left-8 z-50">
                  <div className="bg-red-500 text-white p-4 rounded-full shadow-2xl border-4 border-white">
                    <ThumbsDown className="w-12 h-12" strokeWidth={3} />
                  </div>
                </div>
              )}
              
              {/* Top 4 Films Grid - Full Coverage */}
              <div className="absolute inset-0 grid grid-cols-2 gap-2 p-4">
                {profile.topFilms?.map((film: any, index: number) => (
                  <div key={index} className="rounded-xl overflow-hidden">
                    <img 
                      src={film.poster} 
                      alt={`Film ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = 'https://via.placeholder.com/400x600/800020/ffffff?text=Film';
                      }}
                    />
                  </div>
                ))}
              </div>

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80"></div>

              {/* Profile Info */}
              <div className="absolute bottom-8 left-0 right-0 p-5 text-white">
                <div className="flex items-center gap-3 mb-2">
                  {/* Profile Picture Circle */}
                  <div className="w-16 h-16 rounded-full border-4 border-white overflow-hidden flex-shrink-0 shadow-lg">
                    <img 
                      src={profile.image} 
                      alt={profile.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop';
                      }}
                    />
                  </div>
                  
                  {/* Name and Details */}
                  <div>
                    <h2 className="text-3xl font-bold mb-1">{profile.name}, {profile.age}</h2>
                    <div className="flex items-center gap-2 text-sm mb-2">
                      <span>{profile.location}</span>
                    </div>
                    {/* Film Genres */}
                    {profile.favoriteGenres && profile.favoriteGenres.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {profile.favoriteGenres.map((genre: string, index: number) => (
                          <span 
                            key={index}
                            className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium border border-white/30"
                          >
                            {genre}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-4 mt-6">
            {/* Pass Button */}
            <button 
              onClick={() => handleSwipe('left')}
              className="w-16 h-16 rounded-full bg-white border-2 border-gray-300 flex items-center justify-center shadow-lg hover:shadow-2xl hover:scale-110 hover:border-red-400 hover:-translate-y-1 transition-all duration-300 group active:scale-95"
            >
              <X className="w-8 h-8 text-gray-600 group-hover:text-red-500 transition-colors duration-300" strokeWidth={3} />
            </button>

            {/* Like Button */}
            <button 
              onClick={() => handleSwipe('right')}
              className="w-20 h-20 rounded-full bg-[#800020] hover:bg-[#660019] flex items-center justify-center shadow-xl hover:shadow-2xl hover:scale-110 hover:-translate-y-1 transition-all duration-300 active:scale-95"
            >
              <Heart className="w-10 h-10 text-white transition-transform duration-300 group-hover:scale-110" fill="white" />
            </button>

            {/* Star Button */}
            <button className="w-16 h-16 rounded-full bg-white border-2 border-gray-300 flex items-center justify-center shadow-lg hover:shadow-2xl hover:scale-110 hover:border-blue-400 hover:-translate-y-1 transition-all duration-300 group active:scale-95">
              <Star className="w-7 h-7 text-gray-600 group-hover:text-blue-500 group-hover:fill-blue-500 transition-all duration-300" />
            </button>
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className={`fixed bottom-0 left-0 right-0 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-t px-6 py-3`}>
        <div className="max-w-md mx-auto flex items-center justify-around">
          <button 
            onClick={() => router.push('/home')}
            className="flex flex-col items-center gap-1 text-gray-400 hover:text-[#800020] transition-all duration-300 hover:scale-110 active:scale-95"
          >
            <Home className="w-6 h-6 transition-transform duration-300" />
            <span className="text-xs font-medium">Home</span>
          </button>
          
          <button 
            onClick={() => router.push('/liked-you')}
            className="flex flex-col items-center gap-1 text-gray-400 hover:text-[#800020] transition-all duration-300 hover:scale-110 active:scale-95"
          >
            <div className="relative">
              <Heart className="w-6 h-6 transition-transform duration-300" />
              {likedYouCount > 0 && (
                <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {likedYouCount > 9 ? '9+' : likedYouCount}
                </div>
              )}
            </div>
            <span className="text-xs font-medium">Liked You</span>
          </button>
          
          <button className="flex flex-col items-center gap-1 text-[#800020] transition-all duration-300 hover:scale-110 active:scale-95 relative">
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-12 h-1 bg-[#800020] rounded-full transition-all duration-300"></div>
            <svg className="w-6 h-6 transition-transform duration-300" viewBox="0 0 24 24" fill="currentColor">
              <rect x="2" y="6" width="20" height="3" rx="1.5"/>
              <rect x="2" y="11" width="20" height="3" rx="1.5"/>
              <rect x="2" y="16" width="20" height="3" rx="1.5"/>
            </svg>
            <span className="text-xs font-medium">Discover</span>
          </button>
          
          <button 
            onClick={() => router.push('/messages')}
            className="flex flex-col items-center gap-1 text-gray-400 hover:text-[#800020] transition-all duration-300 hover:scale-110 active:scale-95"
          >
            <div className="relative">
              <MessageCircle className="w-6 h-6 transition-transform duration-300" />
              {unreadCount > 0 && (
                <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </div>
              )}
            </div>
            <span className="text-xs font-medium">Messages</span>
          </button>
          
          <button className="flex flex-col items-center gap-1 text-gray-400 hover:text-[#800020] transition-all duration-300 hover:scale-110 active:scale-95">
            <Users className="w-6 h-6 transition-transform duration-300" />
            <span className="text-xs font-medium">Matches</span>
          </button>
        </div>
      </nav>

      {/* Profile Details Modal */}
      {showProfileDetails && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowProfileDetails(false)}>
          <div 
            className={`w-full max-w-sm h-[550px] ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-3xl overflow-hidden border-8 border-white shadow-[0_20px_60px_rgba(0,0,0,0.5)]`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button 
              onClick={() => setShowProfileDetails(false)}
              className="absolute top-4 right-4 w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors z-10"
            >
              <X className="w-6 h-6 text-white" />
            </button>

            {/* Scrollable Content */}
            <div className="overflow-y-auto h-full">
              {/* Profile Image */}
              <div className="relative h-72">
                <img 
                  src={profile.image} 
                  alt={profile.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&h=600&fit=crop';
                  }}
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6">
                  <h2 className="text-3xl font-bold text-white">{profile.name}, {profile.age}</h2>
                  <p className="text-white/90 text-sm">{profile.location}</p>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* About Section */}
                <div>
                  <h3 className={`text-sm font-semibold mb-2 flex items-center gap-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    <User className="w-4 h-4" />
                    About {profile.name}
                  </h3>
                  <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{profile.bio}</p>
                </div>

                {/* Location */}
                {profile.location_detail && (
                  <div>
                    <h3 className={`text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {profile.name}'s location
                    </h3>
                    <p className={`text-lg font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{profile.location_detail}</p>
                    {profile.lives_in && (
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>🇵🇭 Lives in {profile.lives_in}</p>
                    )}
                    {profile.distance && (
                      <p className={`text-sm font-medium mt-1 ${isDarkMode ? 'text-gray-300' : 'text-[#800020]'}`}>
                        📍 {profile.distance}
                      </p>
                    )}
                  </div>
                )}

                {/* Favorite Film Genres */}
                {profile.favoriteGenres && (
                  <div>
                    <h3 className={`text-sm font-semibold mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {profile.name}'s favorite film genres
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.favoriteGenres.map((genre: string, index: number) => (
                        <div 
                          key={index}
                          className="px-4 py-2 bg-[#800020] text-white rounded-full text-sm font-semibold shadow-md"
                        >
                          {genre}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Basics */}
                {(profile.zodiac || profile.education || profile.pets || profile.drinkingHabits || profile.smokingHabits) && (
                  <div>
                    <h3 className={`text-sm font-semibold mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Basics</h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.zodiac && (
                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                          <svg className={`w-5 h-5 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                          </svg>
                          <span className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{profile.zodiac}</span>
                        </div>
                      )}
                      {profile.education && (
                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                          <svg className={`w-5 h-5 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                          </svg>
                          <span className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{profile.education}</span>
                        </div>
                      )}
                      {profile.pets && (
                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                          <span className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>🐾 {profile.pets}</span>
                        </div>
                      )}
                      {profile.drinkingHabits && (
                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                          <span className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>🍷 {profile.drinkingHabits}</span>
                        </div>
                      )}
                      {profile.smokingHabits && (
                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                          <span className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>🚬 {profile.smokingHabits}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* How They Identify */}
                {profile.gender && (
                  <div>
                    <h3 className={`text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>How they identify</h3>
                    <p className={`text-base font-medium capitalize ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{profile.gender}</p>
                  </div>
                )}

                {/* What They're Looking For */}
                {profile.preferredGender && profile.preferredGender.length > 0 && (
                  <div>
                    <h3 className={`text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Looking for</h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.preferredGender.map((gender: string, index: number) => (
                        <span 
                          key={index}
                          className={`px-4 py-2 rounded-full text-sm font-medium capitalize ${isDarkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-800'}`}
                        >
                          {gender}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Relationship Goals */}
                {profile.relationshipGoals && profile.relationshipGoals.length > 0 && (
                  <div>
                    <h3 className={`text-sm font-semibold mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Relationship Goals</h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.relationshipGoals.map((goal: string, index: number) => (
                        <span 
                          key={index}
                          className="px-4 py-2 bg-[#800020]/10 text-[#800020] rounded-full text-sm font-medium border border-[#800020]/20"
                        >
                          {goal}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <LogOut className="w-8 h-8 text-[#800020]" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Logout</h2>
              <p className="text-gray-600">Are you sure you want to logout?</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 py-3 px-6 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="flex-1 py-3 px-6 bg-[#800020] text-white rounded-lg hover:bg-[#660019] transition-colors font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Match Notification Modal */}
      {showMatchModal && matchedUser && (
        <div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-fadeIn backdrop-blur-sm"
          onClick={(e) => e.stopPropagation()}
        >
          <div 
            className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 text-center animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Celebration Icon */}
            <div className="mb-6">
              <div className="w-24 h-24 mx-auto bg-gradient-to-br from-pink-100 to-red-100 rounded-full flex items-center justify-center mb-4 animate-bounce">
                <Heart className="w-12 h-12 text-[#800020] fill-[#800020]" />
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">It's a Match!</h2>
              <p className="text-gray-600">You and {matchedUser.name} liked each other</p>
            </div>

            {/* Matched User Image */}
            <div className="mb-6">
              <img
                src={matchedUser.image}
                alt={matchedUser.name}
                className="w-32 h-32 rounded-full object-cover mx-auto ring-4 ring-[#800020] shadow-lg"
              />
              <p className="mt-3 text-xl font-semibold text-gray-800">{matchedUser.name}</p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowMatchModal(false)}
                className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
              >
                Keep Swiping
              </button>
              <button
                onClick={() => {
                  setShowMatchModal(false);
                  router.push(`/messages/${matchedUser.userId}`);
                }}
                className="flex-1 px-6 py-3 bg-[#800020] hover:bg-[#660019] text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                Send Message
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
