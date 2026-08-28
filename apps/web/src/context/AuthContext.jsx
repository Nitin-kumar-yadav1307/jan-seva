import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('coopseva_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('coopseva_token') || null);
  const [sessionReady, setSessionReady] = useState(() => !localStorage.getItem('coopseva_token'));
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    if (user) {
      localStorage.setItem('coopseva_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('coopseva_user');
    }
  }, [user]);

  useEffect(() => {
    if (!token) {
      setSessionReady(true);
      return undefined;
    }

    let cancelled = false;
    setSessionReady(false);
    api.get('/auth/me')
      .then((res) => {
        if (!cancelled) {
          setUser(res.data.user);
          setSessionReady(true);
        }
      })
      .catch(() => {
        if (cancelled) return;
        setUser(null);
        setToken(null);
        localStorage.removeItem('coopseva_token');
        localStorage.removeItem('coopseva_user');
        setSessionReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  const setSession = (userData, tokenData) => {
    setUser(userData);
    setToken(tokenData);
    localStorage.setItem('coopseva_token', tokenData);
    localStorage.setItem('coopseva_user', JSON.stringify(userData));
  };

  // Real login via API only
  const login = async (email, password) => {
    setLoading(true);
    setAuthError(null);
    try {
      const res = await api.post('/auth/login', { email, password });
      setSession(res.data.user, res.data.token);
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.error || 'Login failed. Please try again.';
      setAuthError(msg);
      throw msg;
    } finally {
      setLoading(false);
    }
  };

  // Real registration via API
  const register = async (formData) => {
    setLoading(true);
    setAuthError(null);
    try {
      const res = await api.post('/auth/register', formData);
      setSession(res.data.user, res.data.token);
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.error || 'Registration failed. Please try again.';
      setAuthError(msg);
      throw msg;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setAuthError(null);
    localStorage.removeItem('coopseva_token');
    localStorage.removeItem('coopseva_user');
  };

  const clearError = () => setAuthError(null);

  return (
    <AuthContext.Provider value={{
      user,
      token,
      sessionReady,
      loading,
      authError,
      login,
      register,
      logout,
      clearError,
      isAuthenticated: !!user,
      isCustomer: user?.role === 'CUSTOMER',
      isWorker: user?.role === 'WORKER',
      isAdmin: user?.role === 'ADMIN' || user?.role === 'FEDERATION_ADMIN',
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
