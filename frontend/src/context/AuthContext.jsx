import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getMe } from '../api';

const AuthContext = createContext(null);

const TOKEN_KEY = 'jeevansetu_token';

/**
 * AuthProvider wraps the app and provides authentication state + helpers.
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);       // null = unknown, false = logged out
  const [loading, setLoading] = useState(true); // true while verifying token on mount

  // Verify the stored token on every app load
  const loadUser = useCallback(async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setUser(false);
      setLoading(false);
      return;
    }
    try {
      const res = await getMe();
      setUser(res.data);
    } catch {
      // Token invalid or expired — clear it
      localStorage.removeItem(TOKEN_KEY);
      setUser(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  /** Store token after Google OAuth callback */
  const loginWithToken = (token, userData) => {
    localStorage.setItem(TOKEN_KEY, token);
    setUser(userData || null);
  };

  /** Clear token and reset state */
  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(false);
  };

  /** Refresh user data from server */
  const refreshUser = async () => {
    try {
      const res = await getMe();
      setUser(res.data);
      return res.data;
    } catch {
      logout();
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginWithToken, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

/** Hook to consume AuthContext */
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};
