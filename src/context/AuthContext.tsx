import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthUser } from '../types';

interface AuthContextType {
  currentUser: AuthUser | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updatePassword: (oldPass: string, newPass: string) => boolean;
}

const DEFAULT_USER: AuthUser = {
  username: 'Htay Aung',
  displayName: 'Htay Aung',
  role: 'Fleet & Insurance Director',
  email: 'htayaung@autoledger.com',
};

const SESSION_KEY = 'autoledger_auth_session';
const PASS_KEY = 'autoledger_custom_password';
const DEFAULT_PASSWORD = '260266';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    try {
      const stored = localStorage.getItem(SESSION_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // fallback
    }
    return null;
  });

  const login = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const trimmedUser = username.trim().toLowerCase();
    const storedPass = localStorage.getItem(PASS_KEY) || DEFAULT_PASSWORD;

    // Default username is "Htay Aung" (case insensitive check)
    const isValidUser = trimmedUser === 'htay aung' || trimmedUser === 'htayaung';
    const isValidPass = password.trim() === storedPass || password.trim() === DEFAULT_PASSWORD;

    if (isValidUser && isValidPass) {
      const userToSave = { ...DEFAULT_USER };
      setCurrentUser(userToSave);
      localStorage.setItem(SESSION_KEY, JSON.stringify(userToSave));
      return { success: true };
    } else {
      if (!isValidUser) {
        return { success: false, error: 'Invalid username. Default username is "Htay Aung"' };
      }
      return { success: false, error: 'Incorrect password. Default password is "260266"' };
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(SESSION_KEY);
  };

  const updatePassword = (oldPass: string, newPass: string): boolean => {
    const currentPass = localStorage.getItem(PASS_KEY) || DEFAULT_PASSWORD;
    if (oldPass !== currentPass) return false;
    localStorage.setItem(PASS_KEY, newPass);
    return true;
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: Boolean(currentUser),
        login,
        logout,
        updatePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
