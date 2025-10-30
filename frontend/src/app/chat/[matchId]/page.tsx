'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Send } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Button from '@/components/Button';
import Card from '@/components/Card';
import { api } from '@/lib/api';
import { socketClient } from '@/lib/socket';
import { getImageUrl, formatDate } from '@/lib/utils';
import { Message } from '@/types';

export default function ChatPage() {
  const router = useRouter();
  const params = useParams();
  const matchId = params.matchId as string;
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [otherUser, setOtherUser] = useState<any>(null);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    // Connect socket
    socketClient.connect(token);
    
    loadMessages();
    loadMatchDetails();

    // Join match room
    socketClient.joinMatch(matchId);

    // Listen for new messages
    socketClient.onNewMessage((message: Message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      socketClient.offNewMessage();
    };
  }, [matchId, router]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    try {
      const data = await api.getMessages(matchId);
      setMessages(data);
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMatchDetails = async () => {
    try {
      const matches = await api.getMatches();
      const match = matches.find((m) => m.matchId === matchId);
      if (match) {
        setOtherUser(match.user);
        // Get current user ID from first message or profile
        const profile = await api.getProfile();
        setCurrentUserId(profile.userId);
      }
    } catch (error) {
      console.error('Failed to load match details:', error);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    socketClient.sendMessage(matchId, newMessage);
    setNewMessage('');
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      
      {/* Chat Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center space-x-4">
          <button
            onClick={() => router.push('/matches')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          
          {otherUser?.profile && (
            <>
              {otherUser.profile.photos && otherUser.profile.photos.length > 0 ? (
                <img
                  src={getImageUrl(otherUser.profile.photos[0])}
                  alt={otherUser.profile.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-100 to-rose-100 flex items-center justify-center text-xl">
                  👤
                </div>
              )}
              <div>
                <h2 className="font-semibold text-gray-900">
                  {otherUser.profile.name}
                </h2>
                <p className="text-sm text-gray-500">
                  {otherUser.profile.age} • {otherUser.profile.location || 'Unknown location'}
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">💬</div>
              <p className="text-gray-600">Start the conversation!</p>
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
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                      isOwn
                        ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white'
                        : 'bg-white text-gray-900 shadow'
                    }`}
                  >
                    <p>{message.content}</p>
                    <p
                      className={`text-xs mt-1 ${
                        isOwn ? 'text-pink-100' : 'text-gray-400'
                      }`}
                    >
                      {formatDate(message.createdAt)}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input */}
      <div className="bg-white border-t border-gray-200 px-4 py-4">
        <form
          onSubmit={handleSendMessage}
          className="max-w-4xl mx-auto flex items-center space-x-4"
        >
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="w-12 h-12 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 flex items-center justify-center hover:scale-110 transition-transform disabled:opacity-50 disabled:hover:scale-100"
          >
            <Send className="w-5 h-5 text-white" />
          </button>
        </form>
      </div>
    </div>
  );
}
