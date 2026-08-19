import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, SmokingProfile } from '../types/index.js';
import { api } from '../services/api.js';

interface AuthContextType {
  user: User | null;
  profile: SmokingProfile | null;
  token: string | null;
  loading: boolean;
  hasCompletedOnboarding: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (name: string, email: string, password: string, confirmPassword?: string) => Promise<{ success: boolean; message?: string }>;
  demoLogin: () => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  updateProfile: (data: Partial<SmokingProfile> & { name?: string }) => Promise<{ success: boolean; message?: string }>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<SmokingProfile | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('quittrack_token'));
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const refreshAuth = async () => {
    const storedToken = localStorage.getItem('quittrack_token');
    if (!storedToken) {
      setUser(null);
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      const res = await api.getMe();
      if (res.success && res.data) {
        setUser(res.data.user);
        setProfile(res.data.profile || null);
        setHasCompletedOnboarding(Boolean(res.data.hasCompletedOnboarding));
      } else {
        localStorage.removeItem('quittrack_token');
        setToken(null);
        setUser(null);
        setProfile(null);
      }
    } catch (err) {
      console.error('Error refreshing auth:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.login({ email, password });
    if (res.success && res.data) {
      localStorage.setItem('quittrack_token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      setHasCompletedOnboarding(res.data.hasCompletedOnboarding);
      await refreshAuth();
      return { success: true };
    }
    return { success: false, message: res.message || 'Login failed' };
  };

  const register = async (name: string, email: string, password: string, confirmPassword?: string) => {
    const res = await api.register({ name, email, password, confirmPassword });
    if (res.success && res.data) {
      localStorage.setItem('quittrack_token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      setHasCompletedOnboarding(false);
      return { success: true };
    }
    return { success: false, message: res.message || 'Registration failed' };
  };

  const demoLogin = async () => {
    const res = await api.demoLogin();
    if (res.success && res.data) {
      localStorage.setItem('quittrack_token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      setHasCompletedOnboarding(true);
      await refreshAuth();
      return { success: true };
    }
    return { success: false, message: res.message || 'Demo login failed' };
  };

  const logout = () => {
    localStorage.removeItem('quittrack_token');
    setToken(null);
    setUser(null);
    setProfile(null);
    setHasCompletedOnboarding(false);
  };

  const updateProfile = async (data: Partial<SmokingProfile> & { name?: string }) => {
    const res = await api.updateProfile(data);
    if (res.success && res.data) {
      setProfile(res.data);
      if (res.data.onboardingCompleted) {
        setHasCompletedOnboarding(true);
      }
      return { success: true };
    }
    return { success: false, message: res.message || 'Failed to update profile' };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        token,
        loading,
        hasCompletedOnboarding,
        login,
        register,
        demoLogin,
        logout,
        updateProfile,
        refreshAuth
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
