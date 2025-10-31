// Browser notification utility for push notifications

export class NotificationService {
  private static instance: NotificationService;
  private permission: NotificationPermission = 'default';

  private constructor() {
    this.checkPermission();
  }

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  private checkPermission() {
    if ('Notification' in window) {
      this.permission = Notification.permission;
    }
  }

  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return false;
    }

    if (this.permission === 'granted') {
      return true;
    }

    if (this.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      this.permission = permission;
      return permission === 'granted';
    }

    return false;
  }

  showNotification(title: string, options?: NotificationOptions) {
    if (this.permission !== 'granted') {
      console.log('Notification permission not granted');
      return;
    }

    const defaultOptions: NotificationOptions = {
      icon: '/images/mflogo.png',
      badge: '/images/mflogo.png',
      tag: 'matchflix-notification',
      requireInteraction: false,
      ...options,
    };

    try {
      const notification = new Notification(title, defaultOptions);

      // Auto close after 5 seconds
      setTimeout(() => {
        notification.close();
      }, 5000);

      // Handle click
      notification.onclick = (event) => {
        event.preventDefault();
        window.focus();
        notification.close();
        
        // Navigate to the URL if provided in data
        if (options?.data?.url) {
          window.location.href = options.data.url;
        }
      };

      return notification;
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  }

  showMatchNotification(userName: string, userImage: string, userId: string) {
    this.showNotification(`🎉 New Match!`, {
      body: `You matched with ${userName}! Start chatting now.`,
      icon: userImage,
      tag: `match-${userId}`,
      data: {
        url: `/messages/${userId}`,
        type: 'match',
        userId,
      },
    });
  }

  showMessageNotification(userName: string, message: string, userImage: string, userId: string) {
    this.showNotification(`💬 ${userName}`, {
      body: message,
      icon: userImage,
      tag: `message-${userId}`,
      data: {
        url: `/messages/${userId}`,
        type: 'message',
        userId,
      },
    });
  }

  showLikeNotification(userName: string, userImage: string, userId: string) {
    this.showNotification(`❤️ Someone likes you!`, {
      body: `${userName} liked your profile. Check them out!`,
      icon: userImage,
      tag: `like-${userId}`,
      data: {
        url: `/liked-you`,
        type: 'like',
        userId,
      },
    });
  }
}

export const notificationService = NotificationService.getInstance();
