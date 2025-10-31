'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Home, Heart, MessageCircle, Users, Search, LogOut, MoreVertical, UserX } from 'lucide-react';
import { socketClient } from '@/lib/socket';
import { useTheme } from '@/contexts/ThemeContext';
import ThemeToggle from '@/components/ThemeToggle';

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
  const { isDarkMode } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showUnmatchModal, setShowUnmatchModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{ id: string; name: string } | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [likedYouCount, setLikedYouCount] = useState(0);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    fetchMessages();
    fetchLikedYouCount();

    // Connect to Socket.IO for real-time updates
    const token = localStorage.getItem('token');
    if (token) {
      socketClient.connect(token);

      // Listen for new message notifications
      socketClient.onNotification((notification: any) => {
        if (notification.type === 'new_message') {
          // Update the conversation list with new message
          updateConversationWithNewMessage(notification.matchId, notification.message);
        }
      });
    }

    return () => {
      socketClient.offNotification();
    };
  }, []);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          fetchMessages(nextCursor);
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, loadingMore, loading, nextCursor]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openMenuId) {
        const target = event.target as HTMLElement;
        if (!target.closest('.menu-container')) {
          setOpenMenuId(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openMenuId]);

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem('token');
    router.push('/');
  };

  const fetchMessages = async (cursor?: string | null) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      if (cursor) {
        setLoadingMore(true);
      }

      const url = new URL('http://localhost:5001/api/messages/conversations');
      url.searchParams.append('limit', '10');
      if (cursor) {
        url.searchParams.append('cursor', cursor);
      }

      const response = await fetch(url.toString(), {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const transformedMessages = data.conversations.map((conv: any) => {
          let avatarUrl = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop';
          
          if (conv.user.profile?.photos?.[0]) {
            const photoPath = conv.user.profile.photos[0];
            avatarUrl = photoPath.startsWith('http') 
              ? photoPath 
              : `http://localhost:5001${photoPath}`;
          }
          
          return {
            id: conv.matchId,
            userId: conv.user.id,
            name: conv.user.profile?.name || 'Unknown',
            avatar: avatarUrl,
            lastMessage: conv.lastMessage?.content || 'No messages yet',
            timestamp: conv.lastMessage?.createdAt || conv.createdAt,
            unreadCount: 0,
            isOnline: false,
          };
        });
        
        if (cursor) {
          setMessages(prev => [...prev, ...transformedMessages]);
        } else {
          setMessages(transformedMessages);
        }
        
        setNextCursor(data.nextCursor);
        setHasMore(data.hasMore);
      } else {
        console.error('Failed to fetch messages');
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const updateConversationWithNewMessage = (matchId: string, message: any) => {
    setMessages(prevMessages => {
      const existingIndex = prevMessages.findIndex(msg => msg.id === matchId);
      
      if (existingIndex >= 0) {
        // Update existing conversation
        const updated = [...prevMessages];
        updated[existingIndex] = {
          ...updated[existingIndex],
          lastMessage: message.content,
          timestamp: message.createdAt,
        };
        
        // Move to top
        const [updatedConv] = updated.splice(existingIndex, 1);
        return [updatedConv, ...updated];
      }
      
      // If conversation doesn't exist, refetch all
      fetchMessages();
      return prevMessages;
    });
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

  const handleUnmatch = async () => {
    if (!selectedUser) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5001/api/matches/${selectedUser.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        // Remove the conversation from the list
        setMessages(messages.filter(msg => msg.userId !== selectedUser.id));
        setShowUnmatchModal(false);
        setSelectedUser(null);
      } else {
        console.error('Failed to unmatch');
      }
    } catch (error) {
      console.error('Error unmatching:', error);
    }
  };

  const filteredMessages = messages.filter(msg =>
    msg.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!mounted) return null;

  if (loading) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#800020] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <header className={`px-4 sm:px-6 py-4 flex items-center justify-center relative ${isDarkMode ? 'bg-gray-800 border-b border-gray-700' : 'bg-white border-b border-gray-200'}`}>
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
              <MessageCircle className={`w-20 h-20 mx-auto mb-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-300'}`} />
              <h3 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>No messages</h3>
              <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
                {searchQuery ? 'No messages found matching your search' : 'Start swiping to match and chat!'}
              </p>
            </div>
          ) : (
            <div className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-100'}`}>
              {filteredMessages.map((message) => (
                <div key={message.id} className="relative group/item">
                  <div
                    onClick={() => router.push(`/messages/${message.userId}`)}
                    className={`w-full px-6 py-4 transition-colors flex items-center gap-4 cursor-pointer ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'} ${message.unreadCount > 0 ? (isDarkMode ? 'bg-gray-800/50' : 'bg-blue-50/50') : ''}`}
                  >
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <img
                        src={message.avatar}
                        alt={message.name}
                        className={`w-16 h-16 rounded-full object-cover ring-2 transition-all ${message.unreadCount > 0 ? 'ring-[#800020]' : (isDarkMode ? 'ring-gray-700 group-hover/item:ring-pink-400' : 'ring-white group-hover/item:ring-[#800020]')}`}
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop';
                        }}
                      />
                      {message.isOnline && (
                        <div className={`absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 ${isDarkMode ? 'border-gray-900' : 'border-white'}`}></div>
                      )}
                    </div>

                    {/* Message Content */}
                    <div className="flex-1 min-w-0 text-left pr-12">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <h3 className={`text-lg transition-colors ${isDarkMode ? (message.unreadCount > 0 ? 'font-bold text-gray-100 group-hover/item:text-pink-400' : 'font-semibold text-gray-200 group-hover/item:text-pink-400') : (message.unreadCount > 0 ? 'font-bold text-gray-900 group-hover/item:text-[#800020]' : 'font-semibold text-gray-900 group-hover/item:text-[#800020]')}`}>
                            {message.name}
                          </h3>
                          {message.unreadCount > 0 && (
                            <div className="w-2.5 h-2.5 bg-blue-500 rounded-full flex-shrink-0"></div>
                          )}
                        </div>
                        <span className={`text-sm ${message.unreadCount > 0 ? (isDarkMode ? 'text-pink-400 font-semibold' : 'text-[#800020] font-semibold') : (isDarkMode ? 'text-gray-400' : 'text-gray-500')}`}>{formatTimestamp(message.timestamp)}</span>
                      </div>
                      <p className={`text-sm truncate ${message.unreadCount > 0 ? (isDarkMode ? 'text-gray-100 font-semibold' : 'text-gray-900 font-semibold') : (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}>{message.lastMessage}</p>
                    </div>

                    {/* Unread Badge */}
                    {message.unreadCount > 0 && (
                      <div className="flex-shrink-0 absolute right-16">
                        <div className="w-8 h-8 bg-[#800020] rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">{message.unreadCount}</span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Menu Button */}
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 menu-container z-10">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId(openMenuId === message.id ? null : message.id);
                      }}
                      className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
                    >
                      <MoreVertical className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                    </button>
                    
                    {/* Dropdown Menu */}
                    {openMenuId === message.id && (
                      <div className={`absolute right-0 mt-1 w-48 rounded-lg shadow-lg border z-50 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedUser({ id: message.userId, name: message.name });
                            setOpenMenuId(null);
                            setShowUnmatchModal(true);
                          }}
                          className={`w-full px-4 py-3 text-left flex items-center gap-3 text-red-600 transition-colors rounded-lg ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}
                        >
                          <UserX className="w-5 h-5" />
                          <span className="font-medium">Unmatch</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          {/* Loading indicator for infinite scroll */}
          {loadingMore && (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-4 border-[#800020] border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
          )}
          {/* Observer target for infinite scroll */}
          {hasMore && !loadingMore && filteredMessages.length > 0 && (
            <div ref={observerTarget} className="h-4" />
          )}
          {/* End of list message */}
          {!hasMore && filteredMessages.length > 0 && (
            <div className="text-center py-8 text-gray-500 text-sm">
              No more conversations
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
          
          <button 
            onClick={() => router.push('/liked-you')}
            className={`flex flex-col items-center gap-0.5 min-w-[60px] py-2 px-3 rounded-2xl transition-all duration-300 ${isDarkMode ? 'hover:bg-gray-800 text-gray-400 hover:text-pink-400' : 'hover:bg-gray-100 text-gray-500 hover:text-[#800020]'}`}
          >
            <div className="relative">
              <Heart className="w-6 h-6 transition-transform duration-300" />
              {likedYouCount > 0 && (
                <div className="absolute -top-2 -right-2 bg-gradient-to-r from-pink-500 to-red-500 text-white text-[9px] font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg animate-pulse">
                  {likedYouCount > 9 ? '9+' : likedYouCount}
                </div>
              )}
            </div>
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
          
          <button className={`flex flex-col items-center gap-0.5 min-w-[60px] py-2 px-3 rounded-2xl transition-all duration-300 ${isDarkMode ? 'bg-pink-400/10 text-pink-400' : 'bg-[#800020]/10 text-[#800020]'}`}>
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

      {/* Unmatch Confirmation Modal */}
      {showUnmatchModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserX className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Unmatch with {selectedUser.name}?</h2>
              <p className="text-gray-600">This action cannot be undone. Your conversation history will be deleted.</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowUnmatchModal(false);
                  setSelectedUser(null);
                }}
                className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUnmatch}
                className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
              >
                Unmatch
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
