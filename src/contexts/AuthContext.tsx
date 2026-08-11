import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppUser } from '@/types';

interface AuthContextType {
  token: string | null;
  appUser: AppUser | null;
  loading: boolean;
  signOut: () => void;
  loginWithNik: (nik: string, password: string) => Promise<void>;
  registerWithNik: (nik: string, password: string, name: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>; // Keep for compatibility but throw error
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        setToken(storedToken);
        try {
          const res = await fetch('/api/users/me', {
            headers: { 'Authorization': `Bearer ${storedToken}` }
          });
          if (res.ok) {
            const data = await res.json();
            setAppUser(data);
          } else {
            localStorage.removeItem('token');
            setToken(null);
            setAppUser(null);
          }
        } catch (error) {
          console.error('Failed to fetch user:', error);
          localStorage.removeItem('token');
          setToken(null);
          setAppUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const loginWithNik = async (nik: string, password: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nik, password })
    });
    
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Login failed');
    }

    const data = await res.json();
    localStorage.setItem('token', data.token);
    setToken(data.token);
    setAppUser(data.user);
  };

  const registerWithNik = async (nik: string, password: string, name: string) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nik, password, name })
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Registration failed');
    }

    const data = await res.json();
    localStorage.setItem('token', data.token);
    setToken(data.token);
    setAppUser(data.user);
  };

  const signInWithGoogle = async () => {
    throw new Error('Google Sign In is not supported');
  };

  const signOut = () => {
    localStorage.removeItem('token');
    setToken(null);
    setAppUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, appUser, loading, signInWithGoogle, signOut, loginWithNik, registerWithNik }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

