import Constants from "expo-constants";

class ApiService {
  private baseURL: string;
  private authToken: string | null = null;

  constructor() {
    this.baseURL = 'http://192.168.0.108:5000/api';
  }

  setAuthToken(token: string | null) {
    this.authToken = token;
  }

  private getHeaders() {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    return headers;
  }

  private async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw {
          status: response.status,
          message: errorData.message || `HTTP ${response.status}`,
          response: { data: errorData }
        };
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw {
          status: 0,
          message: 'Network error - please check your connection',
          response: { data: { message: 'Network error' } }
        };
      }
      throw error;
    }
  }

  async get<T = any>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T = any>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T = any>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T = any>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  async patch<T = any>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // Specific API methods
  async searchUsers(query: string) {
    return this.get(`/users/search?query=${encodeURIComponent(query)}`);
  }

  async sendFriendRequest(userId: string) {
    return this.post('/friends/request', { toUserId: userId });
  }

  async getFriendsList() {
    return this.get('/friends/list');
  }

  async createConversation(friendId: string) {
    return this.post('/messages/conversation', { friendId });
  }

  async removeFriend(friendId: string) {
    return this.delete(`/friends/remove/${friendId}`);
  }

  async uploadProfilePicture(userId: string, file: any) {
    return this.uploadFile(`/users/profile/${userId}/avatar`, file);
  }

  async getMe() {
    return this.get('/auth/me');
  }

  async getReceivedFriendRequests() {
    return this.get('/friends/requests');
  }

  async getSentFriendRequests() {
    return this.get('/friends/requests/sent');
  }

  async acceptFriendRequest(requestId: string) {
    return this.post('/friends/accept', { requestId });
  }

  async rejectFriendRequest(requestId: string) {
    return this.post('/friends/reject', { requestId });
  }

  async login(loginValue: string, password: string) {
    return this.post('/auth/login', { login: loginValue, password });
  }

  async register(userData: any) {
    return this.post('/auth/register', userData);
  }

  async logout() {
    return this.post('/auth/logout');
  }

  async updateProfile(userId: string, updates: any) {
    return this.put(`/users/profile/${userId}`, updates);
  }

  // File upload method
  async uploadFile<T = any>(
    endpoint: string,
    file: {
      uri: string;
      name: string;
      type: string;
    }
  ): Promise<T> {
    const formData = new FormData();
    formData.append('avatar', {
      uri: file.uri,
      name: file.name,
      type: file.type,
    } as any);

    const headers: Record<string, string> = {};
    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      body: formData,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw {
        status: response.status,
        message: errorData.message || `HTTP ${response.status}`,
        response: { data: errorData }
      };
    }

    return response.json();
  }
}

export const apiService = new ApiService();