// ============================================
// AuthContext.jsx - Authentication State
// ============================================
// Manages user login state across the app.
// ============================================

import { createContext, useState, useEffect } from 'react';
import { getMe } from '../services/authService.js';

const AuthContext = createContext(null);

function AuthProvider({ children }) {
  // State: current user data and loading status
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount: check if user is already logged in via stored token
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const userData = await getMe();
        setUser(userData);
      } catch (error) {
        localStorage.removeItem('token');
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  // Login: save token and set user
  const login = (token, userData) => {
    localStorage.setItem('token', token);
    setUser(userData);
  };

  // Logout: remove token and clear user
  const logoutUser = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout: logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext, AuthProvider };
