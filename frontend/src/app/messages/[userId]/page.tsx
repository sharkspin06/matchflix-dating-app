'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Send, Heart, Users, MessageCircle, Check, CheckCheck } from 'lucide-react';

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
}

export default function ChatPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.userId as string;
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    fetchUserProfile();
    fetchMessages();
    fetchUnreadCount();
    
    // Get current user ID from token
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setCurrentUserId(payload.userId);
      } catch (error) {
        console.error('Error parsing token:', error);
      }
    }
  }, [userId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5001/api/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUserProfile({
          name: data.name || 'Unknown',
          image: data.photos?.[0] 
            ? `http://localhost:5001${data.photos[0]}` 
            : 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop',
        });
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch(`http://localhost:5001/api/messages/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
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

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5001/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          receiverId: userId,
          content: newMessage.trim(),
        }),
      });

      if (response.ok) {
        const sentMessage = await response.json();
        setMessages([...messages, sentMessage]);
        setNewMessage('');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  if (!mounted) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#800020] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => router.push('/messages')}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-700" />
        </button>

        {userProfile && (
          <>
            <img
              src={userProfile.image}
              alt={userProfile.name}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="flex-1">
              <h1 className="font-semibold text-gray-900">{userProfile.name}</h1>
            </div>
          </>
        )}
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto p-4 pb-32">
        <div className="max-w-2xl mx-auto space-y-4">
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
                  className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs md:max-w-md px-4 py-2 rounded-2xl ${
                      isOwn
                        ? 'bg-[#800020] text-white rounded-br-sm'
                        : 'bg-white text-gray-900 rounded-bl-sm shadow-sm'
                    }`}
                  >
                    <p className="break-words">{message.content}</p>
                    <div
                      className={`flex items-center gap-1 mt-1 ${
                        isOwn ? 'text-white/70' : 'text-gray-500'
                      }`}
                    >
                      <p className="text-xs">
                        {new Date(message.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                      {isOwn && (
                        <div className={`ml-1 ${message.read ? 'text-green-400' : 'text-white/50'}`}>
                          <CheckCheck className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Message Input */}
      <div className="fixed bottom-16 left-0 right-0 bg-white border-t border-gray-200 p-3">
        <form onSubmit={handleSendMessage} className="max-w-2xl mx-auto flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 text-sm bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-[#800020] focus:bg-white transition-all"
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
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-3 z-40">
        <div className="max-w-md mx-auto flex justify-around items-center">
          <button 
            onClick={() => router.push('/home')}
            className="flex flex-col items-center gap-1 text-gray-400 hover:text-[#800020] transition-all duration-300"
          >
            <Heart className="w-6 h-6" />
            <span className="text-xs font-medium">Home</span>
          </button>
          
          <button 
            onClick={() => router.push('/liked-you')}
            className="flex flex-col items-center gap-1 text-gray-400 hover:text-[#800020] transition-all duration-300"
          >
            <Heart className="w-6 h-6" />
            <span className="text-xs font-medium">Liked You</span>
          </button>
          
          <button 
            onClick={() => router.push('/discover')}
            className="flex flex-col items-center gap-1 text-gray-400 hover:text-[#800020] transition-all duration-300"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <rect x="2" y="6" width="20" height="3" rx="1.5"/>
              <rect x="2" y="11" width="20" height="3" rx="1.5"/>
              <rect x="2" y="16" width="20" height="3" rx="1.5"/>
            </svg>
            <span className="text-xs font-medium">Discover</span>
          </button>
          
          <button 
            onClick={() => router.push('/messages')}
            className="flex flex-col items-center gap-1 text-[#800020] transition-all duration-300 relative"
          >
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-12 h-1 bg-[#800020] rounded-full"></div>
            <div className="relative">
              <MessageCircle className="w-6 h-6" />
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
            className="flex flex-col items-center gap-1 text-gray-400 hover:text-[#800020] transition-all duration-300"
          >
            <Users className="w-6 h-6" />
            <span className="text-xs font-medium">Matches</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
