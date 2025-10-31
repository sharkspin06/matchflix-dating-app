'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Send, Heart, Users, MessageCircle, Check, CheckCheck, MoreVertical, UserX, Home } from 'lucide-react';
import { socketClient } from '@/lib/socket';
import { useTheme } from '@/contexts/ThemeContext';
import ThemeToggle from '@/components/ThemeToggle';
import { API_URL, getImageUrl } from '@/lib/constants';

interface Message {
  id: string;
  content: string;
  senderId: string;
  createdAt: string;
  read?: boolean;
}

interface UserProfile {
  name: string;
  image: string;
  distance?: number;
}

export default function ChatPage() {
  const router = useRouter();
  const params = useParams();
  const { isDarkMode } = useTheme();
  const userId = params.userId as string;
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [likedYouCount, setLikedYouCount] = useState(0);
  const [showMenu, setShowMenu] = useState(false);
  const [showUnmatchModal, setShowUnmatchModal] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [matchId, setMatchId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const isInitialLoad = useRef(true);

  useEffect(() => {
    setMounted(true);
    fetchUserProfile();
    fetchMessages();
    fetchUnreadCount();
    fetchLikedYouCount();
    
    // Get current user ID from token
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setCurrentUserId(payload.userId);
        
        // Connect to socket
        socketClient.connect(token);
      } catch (error) {
        console.error('Error parsing token:', error);
      }
    }

    // Cleanup on unmount
    return () => {
      socketClient.offNewMessage();
    };
  }, [userId]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showMenu) {
        const target = event.target as HTMLElement;
        if (!target.closest('.menu-container')) {
          setShowMenu(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  // Socket.IO - Listen for new messages
  useEffect(() => {
    if (!matchId) return;

    const handleNewMessage = (message: Message) => {
      console.log('Received new message:', message);
      setMessages(prev => [...prev, message]);
      
      // Scroll to bottom when new message arrives
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    };

    socketClient.onNewMessage(handleNewMessage);

    return () => {
      socketClient.offNewMessage();
    };
  }, [matchId]);

  // Load more messages handler
  const handleLoadMore = async () => {
    if (hasMore && !loadingMore) {
      const container = messagesContainerRef.current;
      const scrollHeightBefore = container?.scrollHeight || 0;
      const scrollTopBefore = container?.scrollTop || 0;
      
      const nextPage = page + 1;
      setPage(nextPage);
      await fetchMessages(nextPage, true);
      
      // Maintain scroll position after loading
      setTimeout(() => {
        if (container) {
          const scrollHeightAfter = container.scrollHeight;
          const heightDifference = scrollHeightAfter - scrollHeightBefore;
          container.scrollTop = scrollTopBefore + heightDifference;
        }
      }, 100);
    }
  };

  useEffect(() => {
    if (isInitialLoad.current && messages.length > 0) {
      scrollToBottom();
      isInitialLoad.current = false;
    }
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('User profile data:', data); // Debug log
        let imageUrl = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop';
        
        if (data.photos && data.photos.length > 0) {
          imageUrl = getImageUrl(data.photos[0]);
        }
        
        setUserProfile({
          name: data.name || 'Unknown',
          image: imageUrl,
          distance: data.distance,
        });
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const fetchMessages = async (pageNum = 1, append = false): Promise<void> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      if (append) setLoadingMore(true);

      const limit = 10;
      const response = await fetch(`${API_URL}/api/messages/${userId}?page=${pageNum}&limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const messagesData = data.messages || data; // Handle both old and new format
        
        if (append) {
          // Prepend older messages
          setMessages(prev => [...messagesData, ...prev]);
        } else {
          setMessages(messagesData);
          
          // Store matchId and join socket room
          if (data.matchId) {
            setMatchId(data.matchId);
            socketClient.joinMatch(data.matchId);
            console.log('Joined match room:', data.matchId);
          }
        }
        
        // Set hasMore based on whether we got a full page
        if (messagesData.length === limit) {
          setHasMore(true); // Full page means there might be more
        } else {
          setHasMore(false); // Less than limit means no more messages
        }
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${API_URL}/api/messages/unread/count`, {
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

  const fetchLikedYouCount = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${API_URL}/api/likes/received`, {
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

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !matchId) return;

    const messageContent = newMessage.trim();
    setNewMessage(''); // Clear input immediately for better UX

    try {
      // Send via Socket.IO for real-time delivery
      socketClient.sendMessage(matchId, messageContent);
      
      // Note: The message will be added to the UI when we receive it back
      // from the socket 'new_message' event, ensuring consistency
    } catch (error) {
      console.error('Error sending message:', error);
      // Restore message on error
      setNewMessage(messageContent);
    }
  };

  const handleUnmatch = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/matches/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        // Redirect to messages page after successful unmatch
        router.push('/messages');
      } else {
        console.error('Failed to unmatch');
      }
    } catch (error) {
      console.error('Error unmatching:', error);
    }
  };

  if (!mounted) return null;

  if (loading) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#800020] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Loading chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} flex flex-col`}>
      {/* Header */}
      <header className={`sticky top-0 z-50 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b px-4 py-3`}>
        {userProfile && (
          <div className="flex items-center justify-between">
            {/* Back Button */}
            <button
              onClick={() => router.push('/messages')}
              className={`p-2 ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-full transition-colors`}
            >
              <ArrowLeft className={`w-6 h-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`} />
            </button>

            {/* Centered Profile */}
            <div className="flex flex-col items-center flex-1">
              <img
                src={userProfile.image}
                alt={userProfile.name}
                className="w-14 h-14 rounded-full object-cover mb-1.5"
                onError={(e) => {
                  console.error('Failed to load profile image:', userProfile.image);
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop';
                }}
              />
              <h1 className={`font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} text-base`}>{userProfile.name}</h1>
              {userProfile.distance !== undefined && (
                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-0.5`}>{userProfile.distance} km away</p>
              )}
            </div>
            
            {/* Menu Button */}
            <div className="relative menu-container">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className={`p-2 ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-full transition-colors`}
              >
                <MoreVertical className={`w-6 h-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`} />
              </button>
              
              {/* Dropdown Menu */}
              {showMenu && (
                <div className={`absolute right-0 mt-2 w-48 ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'} rounded-lg shadow-lg border z-50`}>
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      setShowUnmatchModal(true);
                    }}
                    className={`w-full px-4 py-3 text-left ${isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-50'} flex items-center gap-3 text-red-600 transition-colors rounded-lg`}
                  >
                    <UserX className="w-5 h-5" />
                    <span className="font-medium">Unmatch</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Messages */}
      <main ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 pb-32">
        <div className="max-w-2xl mx-auto space-y-4">
          {/* Load More Button */}
          {hasMore && messages.length > 0 && (
            <div className="text-center py-4">
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="px-6 py-2 bg-[#800020] text-white rounded-full hover:bg-[#6B0018] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
              >
                {loadingMore ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Loading...</span>
                  </>
                ) : (
                  <span>Load More Messages</span>
                )}
              </button>
            </div>
          )}
          
          {messages.length === 0 ? (
            <div className="text-center py-20">
              <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((message) => {
              const isOwn = message.senderId === currentUserId;
              return (
                <div
                  key={message.id}
                  className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}
                >
                  {/* Name and timestamp header */}
                  <div className="flex items-center gap-2 mb-1 px-1">
                    <span className={`text-sm font-semibold ${
                      isOwn ? 'text-[#6B5B95]' : 'text-[#E91E63]'
                    }`}>
                      {isOwn ? 'You' : userProfile?.name || 'User'}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(message.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  
                  {/* Message bubble */}
                  <div
                    className={`max-w-xs md:max-w-md px-4 py-3 rounded-2xl ${
                      isOwn
                        ? `${isDarkMode ? 'bg-gray-700 text-gray-100' : 'bg-[#F3F4F9] text-[#6B5B95]'} rounded-tr-sm`
                        : `${isDarkMode ? 'bg-gray-600 text-gray-100' : 'bg-[#FFF5F8] text-[#6B5B95]'} rounded-tl-sm`
                    }`}
                  >
                    <p className="break-words text-sm">{message.content}</p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Message Input */}
      <div className={`fixed bottom-16 left-0 right-0 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-t p-3`}>
        <form onSubmit={handleSendMessage} className="max-w-2xl mx-auto flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className={`flex-1 px-4 py-2 text-sm ${isDarkMode ? 'bg-gray-700 text-gray-100 focus:bg-gray-600' : 'bg-gray-100 text-gray-900 focus:bg-white'} rounded-full focus:outline-none focus:ring-2 focus:ring-[#800020] transition-all`}
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="w-10 h-10 bg-[#800020] hover:bg-[#660019] disabled:bg-gray-300 text-white rounded-full flex items-center justify-center transition-colors flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Bottom Navigation */}
      <nav className={`fixed bottom-0 left-0 right-0 ${isDarkMode ? 'bg-gray-900/95' : 'bg-white/95'} backdrop-blur-lg border-t ${isDarkMode ? 'border-gray-800' : 'border-gray-200'} px-4 sm:px-6 py-2 shadow-lg`}>
        <div className="max-w-md mx-auto flex items-center justify-around">
          <button 
            onClick={() => router.push('/home')}
            className={`flex flex-col items-center gap-0.5 min-w-[60px] py-2 px-3 rounded-2xl transition-all duration-300 ${isDarkMode ? 'hover:bg-gray-800 text-gray-400 hover:text-pink-400' : 'hover:bg-gray-100 text-gray-500 hover:text-[#800020]'}`}
          >
            <Heart className="w-6 h-6 transition-transform duration-300" />
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

      {/* Unmatch Confirmation Modal */}
      {showUnmatchModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserX className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Unmatch with {userProfile?.name}?</h2>
              <p className="text-gray-600">This action cannot be undone. Your conversation history will be deleted.</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowUnmatchModal(false)}
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
