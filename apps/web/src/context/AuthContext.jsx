import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/api';

const AuthContext = createContext();

const DEMO_PERSONAS = [
  {
    id: 'user_cust_01',
    name: 'Aditi Sharma',
    email: 'customer@coopseva.org',
    role: 'CUSTOMER',
    badge: 'Customer'
  },
  {
    id: 'user_worker_01',
    name: 'Suresh Kumar',
    email: 'suresh@coopseva.org',
    role: 'WORKER',
    badge: 'Worker (Plumber)'
  },
  {
    id: 'user_admin_01',
    name: 'Vikas Mehra',
    email: 'admin@coopseva.org',
    role: 'ADMIN',
    badge: 'Co-op Admin'
  }
];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('coopseva_user');
    return saved ? JSON.parse(saved) : DEMO_PERSONAS[0];
  });
  const [token, setToken] = useState(() => localStorage.getItem('coopseva_token') || 'demo_jwt_token');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem('coopseva_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('coopseva_user');
    }
  }, [user]);

  const switchPersona = (persona) => {
    setUser(persona);
    const mockToken = `demo_token_${persona.role.toLowerCase()}`;
    setToken(mockToken);
    localStorage.setItem('coopseva_token', mockToken);
    localStorage.setItem('coopseva_user', JSON.stringify(persona));
  };

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      setUser(res.data.user);
      setToken(res.data.token);
      localStorage.setItem('coopseva_token', res.data.token);
      return res.data;
    } catch (err) {
      throw err.response?.data?.error || 'Login failed';
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('coopseva_token');
    localStorage.removeItem('coopseva_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, switchPersona, login, logout, personas: DEMO_PERSONAS, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
