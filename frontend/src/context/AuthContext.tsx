'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'dispatcher' | 'officer';
  department: string;
  ward_id: number | null;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isDispatcher: boolean;
  isOfficer: boolean;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isAuthenticated: false,
  isAdmin: false,
  isDispatcher: false,
  isOfficer: false,
  isLoading: true,
  login: () => {},
  logout: () => {},
});

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore token on initial mount
  useEffect(() => {
    const savedToken = typeof window !== 'undefined' ? localStorage.getItem('vmc_auth_token') : null;
    const savedUser = typeof window !== 'undefined' ? localStorage.getItem('vmc_auth_user') : null;

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));

        // Verify token with backend
        fetch(`${API_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${savedToken}` },
        })
          .then((res) => {
            if (!res.ok) {
              logout();
            } else {
              return res.json();
            }
          })
          .then((data) => {
            if (data?.user) {
              setUser(data.user);
              localStorage.setItem('vmc_auth_user', JSON.stringify(data.user));
            }
          })
          .catch(() => {})
          .finally(() => setIsLoading(false));
        return;
      } catch {
        logout();
      }
    }
    setIsLoading(false);
  }, []);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    if (typeof window !== 'undefined') {
      localStorage.setItem('vmc_auth_token', newToken);
      localStorage.setItem('vmc_auth_user', JSON.stringify(newUser));
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('vmc_auth_token');
      localStorage.removeItem('vmc_auth_user');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isAdmin: user?.role === 'admin',
        isDispatcher: user?.role === 'dispatcher',
        isOfficer: user?.role === 'officer',
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
