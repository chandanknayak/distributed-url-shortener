import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  // You can point to your configured backend port here:
  const API_URL = "http://localhost:5000/api";

  const api = axios.create({
    baseURL: API_URL,
    headers: {
      Authorization: token ? `Bearer ${token}` : ''
    }
  });

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      api.defaults.headers.Authorization = `Bearer ${token}`;
      setUser({ token }); // For simplicity, in production we would decode JWT or fetch user details
    } else {
      localStorage.removeItem('token');
      delete api.defaults.headers.Authorization;
      setUser(null);
    }
    setLoading(false);
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      setToken(res.data.token);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Login failed' };
    }
  };

  const register = async (email, password) => {
    try {
      // In the backend schema, we didn't specify exactly what fields the UserModel needs
      // but usually email and password are required.
      const res = await api.post('/auth/register', { 
        name: email.split('@')[0], 
        email, 
        password 
      });
      setToken(res.data.token);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Registration failed' };
    }
  };

  const logout = () => {
    setToken(null);
  };

  const value = {
    user,
    token,
    login,
    register,
    logout,
    api,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
