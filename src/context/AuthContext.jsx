import { createContext, useContext, useMemo, useState } from 'react';
import { login as loginApi, register as registerApi, getMe } from '../api/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user'));
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(false);

  const persist = (tokenValue, userValue) => {
    localStorage.setItem('token', tokenValue);
    localStorage.setItem('user', JSON.stringify(userValue));
    setToken(tokenValue);
    setUser(userValue);
  };

  const login = async (credentials) => {
    setLoading(true);
    try {
      const { data } = await loginApi(credentials);
      persist(data.token, data.user);
      return data.user;
    } finally {
      setLoading(false);
    }
  };

  const register = async (payload) => {
    setLoading(true);
    try {
      const { data } = await registerApi(payload);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  // Refresh profile data (e.g. after status change)
  const refreshMe = async () => {
    try {
      const { data } = await getMe();
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
    } catch {
      // ignore
    }
  };

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: Boolean(token),
      isAdmin: user?.role === 'admin',
      login,
      register,
      logout,
      refreshMe
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, token, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}