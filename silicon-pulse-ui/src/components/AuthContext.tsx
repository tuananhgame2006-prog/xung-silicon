/* Copyright (c) 2026 Tuấn Anh (tuananhgame2006). Tác phẩm được bảo hộ bản quyền. Nghiêm cấm sao chép dưới mọi hình thức. */
import { createContext, useContext, useState, useEffect } from 'react';
import { seoBridge } from '../api/seoBridge';
import type { ReactNode } from 'react';

interface AuthContextType {
  isAdmin: boolean;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = sessionStorage.getItem('admin_token');
      if (savedToken) {
        // Defense-grade: Verify token with backend
        const isValid = await seoBridge.verifyToken(savedToken);
        if (isValid) {
          setToken(savedToken);
          setIsAdmin(true);
        } else {
          sessionStorage.removeItem('admin_token');
        }
      }
    };
    initAuth();
  }, []);

  const login = (newToken: string) => {
    sessionStorage.setItem('admin_token', newToken);
    setToken(newToken);
    setIsAdmin(true);
  };

  const logout = () => {
    sessionStorage.removeItem('admin_token');
    setToken(null);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ isAdmin, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
