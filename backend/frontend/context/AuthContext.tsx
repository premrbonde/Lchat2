import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiService } from '@/services/apiService';
import * as SecureStore from 'expo-secure-store';

interface User {
  id: string;
  email: string;
  username: string;
  nickname: string;
  profilePictureUrl: string | null;
  bio: string;
  preferences: {
    theme: 'light' | 'dark' | 'system';
    defaultTranslateLanguage: 'en' | 'mr' | 'te' | 'ta';
    autoTranslate: boolean;
    notifications: {
      messages: boolean;
      friendRequests: boolean;
      mentions: boolean;
    };
  };
  isOnline: boolean;
  lastSeen: string;
  isVerified: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (login: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

interface RegisterData {
  email: string;
  username: string;
  password: string;
  nickname?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'auth_token';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      if (token) {
        apiService.setAuthToken(token);
        const response = await apiService.get('/auth/me');
        setUser(response.user);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    } finally {
      setLoading(false);
    }
  };

  const login = async (loginValue: string, password: string) => {
    try {
      const response = await apiService.post('/auth/login', {
        login: loginValue,
        password,
      });

      const { token, user: userData } = response;
      
      await SecureStore.setItemAsync(TOKEN_KEY, token);
      apiService.setAuthToken(token);
      setUser(userData);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      const response = await apiService.post('/auth/register', userData);
      
      const { token, user: newUser } = response;
      
      await SecureStore.setItemAsync(TOKEN_KEY, token);
      apiService.setAuthToken(token);
      setUser(newUser);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  };

  const logout = async () => {
    try {
      await apiService.post('/auth/logout');
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      apiService.setAuthToken(null);
      setUser(null);
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return;

    try {
      const response = await apiService.put(`/users/profile/${user.id}`, updates);
      setUser(response.user);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Profile update failed');
    }
  };

  const refreshUser = async () => {
    try {
      const response = await apiService.get('/auth/me');
      setUser(response.user);
    } catch (error) {
      console.error('Refresh user failed:', error);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}