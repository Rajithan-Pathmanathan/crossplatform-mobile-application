import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types/user';
import { api } from '../services/api';
import { StorageService } from '../services/storage';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  activeRole: UserRole;
  login: (email: string, pass: string) => Promise<void>;
  demoLogin: (role: UserRole) => Promise<void>;
  register: (name: string, email: string, phone: string, role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: { name?: string; phone?: string; avatar?: string }) => Promise<void>;
  switchRole: (role: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeRole, setActiveRole] = useState<UserRole>('attendee');

  useEffect(() => {
    async function loadSavedSession() {
      try {
        const savedUser = await StorageService.getUserSession();
        if (savedUser) {
          setUser(savedUser);
          setActiveRole(savedUser.role);
        }
      } catch (error) {
        console.error('Failed to restore user session:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadSavedSession();
  }, []);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const result = await api.login(email, pass);
      setUser(result.user);
      setActiveRole(result.user.role);
    } finally {
      setIsLoading(false);
    }
  };

  const demoLogin = async (role: UserRole) => {
    setIsLoading(true);
    try {
      const email = role === 'organizer' ? 'organizer@eventhub.com' : 'alex@eventhub.com';
      const result = await api.login(email, 'password123');
      setUser(result.user);
      setActiveRole(result.user.role);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, phone: string, role: UserRole) => {
    setIsLoading(true);
    try {
      const result = await api.register(name, email, phone, role);
      setUser(result.user);
      setActiveRole(result.user.role);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await StorageService.clearUserSession();
      setUser(null);
      setActiveRole('attendee');
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (data: { name?: string; phone?: string; avatar?: string }) => {
    if (!user) return;
    setIsLoading(true);
    try {
      const updated = await api.updateProfile(user.id, data);
      setUser(updated);
    } finally {
      setIsLoading(false);
    }
  };

  const switchRole = async (newRole: UserRole) => {
    if (!user) return;
    setActiveRole(newRole);
    // Also persist updated role
    await api.updateProfile(user.id, { role: newRole });
    setUser((prev) => (prev ? { ...prev, role: newRole } : null));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        activeRole,
        login,
        demoLogin,
        register,
        logout,
        updateProfile,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
