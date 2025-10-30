const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

class ApiClient {
  private getHeaders(): HeadersInit {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  }

  // Auth
  async register(data: {
    email: string;
    password: string;
    name: string;
    age: number;
    gender: string;
  }) {
    return this.request<{ token: string; user: any }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(email: string, password: string) {
    return this.request<{ token: string; user: any }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  // Profile
  async getProfile() {
    return this.request<any>('/api/profile');
  }

  async updateProfile(data: any) {
    return this.request<any>('/api/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async uploadPhoto(file: File) {
    const formData = new FormData();
    formData.append('photo', file);

    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/api/profile/photo`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload photo');
    }

    return response.json();
  }

  async deletePhoto(photoUrl: string) {
    return this.request<any>('/api/profile/photo', {
      method: 'DELETE',
      body: JSON.stringify({ photoUrl }),
    });
  }

  // Users
  async discoverUsers() {
    return this.request<any[]>('/api/users/discover');
  }

  async getUserById(id: string) {
    return this.request<any>(`/api/users/${id}`);
  }

  // Matches
  async likeUser(userId: string) {
    return this.request<any>(`/api/matches/like/${userId}`, {
      method: 'POST',
    });
  }

  async passUser(userId: string) {
    return this.request<any>(`/api/matches/pass/${userId}`, {
      method: 'POST',
    });
  }

  async getMatches() {
    return this.request<any[]>('/api/matches');
  }

  // Messages
  async getMessages(matchId: string) {
    return this.request<any[]>(`/api/messages/${matchId}`);
  }
}

export const api = new ApiClient();
