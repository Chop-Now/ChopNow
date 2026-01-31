import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        // Prefer backend verification if available
        const response = await api.get('/api/users/profile');
        const profile = response.data;
        localStorage.setItem('user', JSON.stringify(profile));
        setUser(profile);
      } catch (error) {
        // Fallback to stored user if profile endpoint fails
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        } else {
          localStorage.removeItem('token');
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/api/users/login', { email, password });
      const { token, ...userData } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));

      setUser({ ...userData, token });
      toast.success('Login successful!');
      return true;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
      toast.error(error.response?.data?.message || 'Login failed');
      return false;
    }
  };

  const register = async (userData) => {
    try {
      await api.post('/api/users/register', userData);
      toast.success('Registration successful! Please login.');
      return true;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
      toast.error(error.response?.data?.message || 'Registration failed');
      return false;
    }
  };

  const googleLogin = async (accessToken) => {
    try {
      const response = await api.post('/api/users/google-login', { accessToken });
      const { token, ...userData } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));

      setUser({ ...userData, token });
      toast.success('Login successful with Google!');
      return true;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
      toast.error(error.response?.data?.message || 'Google Login failed');
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    toast.success('Logged out successfully');
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isBusiness: user?.role === 'business_owner' || user?.role === 'business',
    isAdmin: user?.role === 'admin',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
