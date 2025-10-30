import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

class SocketClient {
  private socket: Socket | null = null;

  connect(token: string) {
    if (this.socket?.connected) return this.socket;

    this.socket = io(SOCKET_URL, {
      auth: { token },
    });

    this.socket.on('connect', () => {
      console.log('Socket connected');
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
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
