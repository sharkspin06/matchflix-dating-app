  import { io, Socket } from 'socket.io-client';
import { notificationService } from './notifications';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5001';

class SocketClient {
  private socket: Socket | null = null;

  connect(token: string) {
    if (this.socket?.connected) {
      console.log('✅ Socket already connected');
      return this.socket;
    }

    console.log(`🔌 Connecting to Socket.IO at ${SOCKET_URL}...`);
    
    this.socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'], // Try websocket first, fallback to polling
    });

    this.socket.on('connect', () => {
      console.log('✅ Socket connected successfully!', this.socket?.id);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error.message);
    });

    this.socket.on('error', (error) => {
      console.error('❌ Socket error:', error);
    });

    // Listen for match notifications
    this.socket.on('new_match', (data: any) => {
      console.log('🎉 New match notification:', data);
      const userImage = data.user?.profile?.photos?.[0]
        ? (data.user.profile.photos[0].startsWith('http') 
          ? data.user.profile.photos[0] 
          : `http://localhost:5001${data.user.profile.photos[0]}`)
        : '/images/mflogo.png';
      
      notificationService.showMatchNotification(
        data.user?.profile?.name || 'Someone',
        userImage,
        data.user?.id || ''
      );
    });

    // Listen for new message notifications
    this.socket.on('new_message', (data: any) => {
      console.log('💬 New message notification:', data);
      // Only show notification if user is not on the current chat page
      if (!window.location.pathname.includes(`/messages/${data.senderId}`)) {
        const userImage = data.senderImage || '/images/mflogo.png';
        notificationService.showMessageNotification(
          data.senderName || 'Someone',
          data.content || 'New message',
          userImage,
          data.senderId || ''
        );
      }
    });

    // Listen for like notifications
    this.socket.on('new_like', (data: any) => {
      console.log('❤️ New like notification:', data);
      const userImage = data.user?.profile?.photos?.[0]
        ? (data.user.profile.photos[0].startsWith('http') 
          ? data.user.profile.photos[0] 
          : `http://localhost:5001${data.user.profile.photos[0]}`)
        : '/images/mflogo.png';
      
      notificationService.showLikeNotification(
        data.user?.profile?.name || 'Someone',
        userImage,
        data.user?.id || ''
      );
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket() {
    return this.socket;
  }

  joinMatch(matchId: string) {
    this.socket?.emit('join_match', matchId);
  }

  sendMessage(matchId: string, content: string) {
    this.socket?.emit('send_message', { matchId, content });
  }

  onNewMessage(callback: (message: any) => void) {
    this.socket?.on('new_message', callback);
  }

  offNewMessage() {
    this.socket?.off('new_message');
  }

  onNotification(callback: (notification: any) => void) {
    this.socket?.on('notification', callback);
  }

  offNotification() {
    this.socket?.off('notification');
  }

  typing(matchId: string, isTyping: boolean) {
    this.socket?.emit('typing', { matchId, isTyping });
  }

  onUserTyping(callback: (data: { userId: string; isTyping: boolean }) => void) {
    this.socket?.on('user_typing', callback);
  }

  offUserTyping() {
    this.socket?.off('user_typing');
  }
}

export const socketClient = new SocketClient();
