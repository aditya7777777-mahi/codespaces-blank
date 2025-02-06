import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/axios';
import axios from 'axios'

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };

      const { data } = await axios.get('https://expert-space-waddle-jj466w646gvj2pvw5-5000.app.github.dev/api/auth/check', config);
      if (data.isAuthenticated) {
        setUser(data.user);
        setIsAuthenticated(true);
      }
    } catch (error) {
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const register = async (userData) => {
    setLoading(true);
    try {
      const { data } = await api.post('https://expert-space-waddle-jj466w646gvj2pvw5-5000.app.github.dev/api/auth/register', userData);
      setUser(data);
      localStorage.setItem('user', JSON.stringify(data));
      setLoading(false);
      return data;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const login = async (credentials) => {
    const response = await api.post('https://expert-space-waddle-jj466w646gvj2pvw5-5000.app.github.dev/api/auth/login', credentials);
    const { token, user } = response.data;
    localStorage.setItem('token', token);
    setUser(user);
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    register,
    isAdmin: user?.role === 'admin',
    isAgent: user?.role === 'agent',
    isCustomer: user?.role === 'customer',
    checkAuth
  };

  return (
    <AuthContext.Provider value={value}>
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