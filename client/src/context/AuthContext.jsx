import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('gym_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      localStorage.removeItem('gym_user');
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('gym_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyUser = async () => {
      if (token) {
        try {
          const res = await authService.getMe();
          if (res.success && res.data.user) {
            const userData = {
              id: res.data.user._id,
              name: res.data.user.name,
              email: res.data.user.email,
              role: res.data.user.role,
              phone: res.data.user.phone,
              avatar: res.data.user.avatar,
              memberId: res.data.member ? res.data.member._id : null,
              trainerId: res.data.trainer ? res.data.trainer._id : null,
            };
            setUser(userData);
            localStorage.setItem('gym_user', JSON.stringify(userData));
          }
        } catch (err) {
          console.error('Session verification failed:', err);
          setToken(null);
          setUser(null);
          localStorage.removeItem('gym_token');
          localStorage.removeItem('gym_user');
        }
      }
      setLoading(false);
    };

    verifyUser();
  }, [token]);

  const login = async (credentials) => {
    const res = await authService.login(credentials);
    if (res.success && res.data) {
      const { token: newToken, user: userData } = res.data;
      setToken(newToken);
      setUser(userData);
      localStorage.setItem('gym_token', newToken);
      localStorage.setItem('gym_user', JSON.stringify(userData));
      return userData;
    }
    throw new Error(res.message || 'Login failed');
  };

  const register = async (userData) => {
    const res = await authService.register(userData);
    if (res.success && res.data) {
      const { token: newToken, user: newUser } = res.data;
      setToken(newToken);
      setUser(newUser);
      localStorage.setItem('gym_token', newToken);
      localStorage.setItem('gym_user', JSON.stringify(newUser));
      return newUser;
    }
    throw new Error(res.message || 'Registration failed');
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('gym_token');
    localStorage.removeItem('gym_user');
    window.location.href = '/login';
  };

  const updateCurrentUser = (updatedFields) => {
    const updated = { ...user, ...updatedFields };
    setUser(updated);
    localStorage.setItem('gym_user', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        updateCurrentUser,
        isAuthenticated: !!token && !!user,
        isAdmin: user?.role === 'admin',
        isTrainer: user?.role === 'trainer',
        isMember: user?.role === 'member',
      }}
    >
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

export default AuthContext;
