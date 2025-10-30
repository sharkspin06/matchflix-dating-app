'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Home, Heart, MessageCircle, Users, Search, LogOut, Sun, Moon } from 'lucide-react';

interface Message {
  id: string;
  userId: string;
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  isOnline: boolean;
}

const formatTimestamp = (timestamp: string) => {
  const now = new Date();
  const messageDate = new Date(timestamp);
  const diffInMs = now.getTime() - messageDate.getTime();
  const diffInMinutes = Math.floor(diffInMs / 60000);
  const diffInHours = Math.floor(diffInMs / 3600000);
  const diffInDays = Math.floor(diffInMs / 86400000);

  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInHours < 24) return `${diffInHours}h ago`;
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays < 7) return `${diffInDays}d ago`;
  
  // Format as date for older messages
  return messageDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export default function MessagesPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [likedYouCount, setLikedYouCount] = useState(0);

  useEffect(() => {
    setMounted(true);
    fetchMessages();
    fetchLikedYouCount();
  }, []);

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem('token');
    router.push('/');
  };

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('http://localhost:5001/api/messages/conversations', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const transformedMessages = data.map((conv: any) => ({
          id: conv.matchId,
          userId: conv.user.id,
          name: conv.user.profile?.name || 'Unknown',
          avatar: conv.user.profile?.photos?.[0] 
            ? `http://localhost:5001${conv.user.profile.photos[0]}` 
            : 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop',
          lastMessage: conv.lastMessage?.content || 'No messages yet',
          timestamp: conv.lastMessage?.createdAt || conv.createdAt,
          unreadCount: 0,
          isOnline: false,
        }));
        setMessages(transformedMessages);
      } else {
        console.error('Failed to fetch messages');
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
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

  const filteredMessages = messages.filter(msg =>
    msg.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!mounted) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#800020] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <header className={`px-4 sm:px-6 py-4 flex items-center justify-center relative ${isDarkMode ? 'bg-gray-800 border-b border-gray-700' : 'bg-white border-b border-gray-200'}`}>
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className={`absolute left-2 sm:left-6 flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 transition-colors ${isDarkMode ? 'text-gray-300 hover:text-[#800020]' : 'text-gray-600 hover:text-[#800020]'}`}
        >
          {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          <span className="text-xs sm:text-sm font-medium hidden sm:inline">{isDarkMode ? 'Light' : 'Dark'}</span>
        </button>

        <div className="flex items-center gap-3">
          <img 
            src="/images/mflogo.png" 
            alt="MatchFlix Logo" 
            className="w-10 h-10 object-contain"
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
              backgroundClip: 'text'
            }}
          >
            Matchflix
          </h1>
        </div>

        <button
          onClick={handleLogout}
          className={`absolute right-2 sm:right-6 flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 transition-colors ${isDarkMode ? 'text-gray-300 hover:text-[#800020]' : 'text-gray-600 hover:text-[#800020]'}`}
        >
          <LogOut className="w-5 h-5" />
          <span className="text-xs sm:text-sm font-medium hidden sm:inline">Logout</span>
        </button>
      </header>

      {/* Search Bar */}
      <div className={`px-4 sm:px-6 py-4 ${isDarkMode ? 'bg-gray-800 border-b border-gray-700' : 'bg-white border-b border-gray-100'}`}>
        <div className="max-w-2xl mx-auto relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-12 pr-4 py-3 rounded-full focus:outline-none focus:ring-2 focus:ring-[#800020] focus:border-transparent transition-all ${isDarkMode ? 'bg-gray-700 border border-gray-600 text-white placeholder-gray-400' : 'bg-gray-50 border border-gray-200'}`}
          />
        </div>
      </div>

      {/* Messages List */}
      <main className="flex-1 pb-24 overflow-y-auto">
        <div className="max-w-2xl mx-auto">
          {filteredMessages.length === 0 ? (
            <div className="text-center py-20">
              <MessageCircle className="w-20 h-20 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No messages</h3>
              <p className="text-gray-500">
                {searchQuery ? 'No messages found matching your search' : 'Start swiping to match and chat!'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredMessages.map((message) => (
                <button
                  key={message.id}
                  onClick={() => router.push(`/messages/${message.userId}`)}
                  className={`w-full px-6 py-4 hover:bg-gray-50 transition-colors flex items-center gap-4 group ${message.unreadCount > 0 ? 'bg-blue-50/50' : ''}`}
                >
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <img
                      src={message.avatar}
                      alt={message.name}
                      className={`w-16 h-16 rounded-full object-cover ring-2 transition-all ${message.unreadCount > 0 ? 'ring-[#800020]' : 'ring-white group-hover:ring-[#800020]'}`}
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop';
                      }}
                    />
                    {message.isOnline && (
                      <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>

                  {/* Message Content */}
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <h3 className={`text-lg group-hover:text-[#800020] transition-colors ${message.unreadCount > 0 ? 'font-bold text-gray-900' : 'font-semibold text-gray-900'}`}>
                          {message.name}
                        </h3>
                        {message.unreadCount > 0 && (
                          <div className="w-2.5 h-2.5 bg-blue-500 rounded-full flex-shrink-0"></div>
                        )}
                      </div>
                      <span className={`text-sm ${message.unreadCount > 0 ? 'text-[#800020] font-semibold' : 'text-gray-500'}`}>{formatTimestamp(message.timestamp)}</span>
                    </div>
                    <p className={`text-sm truncate ${message.unreadCount > 0 ? 'text-gray-900 font-semibold' : 'text-gray-600'}`}>{message.lastMessage}</p>
                  </div>

                  {/* Unread Badge */}
                  {message.unreadCount > 0 && (
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-[#800020] rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">{message.unreadCount}</span>
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-3">
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
          
          <button 
            onClick={() => router.push('/discover')}
            className="flex flex-col items-center gap-1 text-gray-400 hover:text-[#800020] transition-all duration-300 hover:scale-110 active:scale-95"
          >
            <svg className="w-6 h-6 transition-transform duration-300" viewBox="0 0 24 24" fill="currentColor">
              <rect x="2" y="6" width="20" height="3" rx="1.5"/>
              <rect x="2" y="11" width="20" height="3" rx="1.5"/>
              <rect x="2" y="16" width="20" height="3" rx="1.5"/>
            </svg>
            <span className="text-xs font-medium">Discover</span>
          </button>
          
          <button className="flex flex-col items-center gap-1 text-[#800020] transition-all duration-300 hover:scale-110 active:scale-95 relative">
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-12 h-1 bg-[#800020] rounded-full transition-all duration-300"></div>
            <MessageCircle className="w-6 h-6 transition-transform duration-300" />
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

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
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
