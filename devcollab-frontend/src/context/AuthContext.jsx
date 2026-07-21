import React, { createContext, useState, useEffect, useContext } from 'react';
import API from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await API.get('/auth/profile');
          setUser(res.data);
        } catch (error) {
          console.error("Auth initialization failed:", error);
          localStorage.removeItem('token');
          setUser(null);
        }
      }
      setLoading(false);
    };
    fetchCurrentUser();
  }, []);

  const login = async (email, password) => {
    const res = await API.post('/auth/login', { email, password });
    localStorage.setItem('token', res.data.token);
    // User profile endpoint returns full details, but login endpoint returns partial profile info in `res.data.user`.
    // Let's fetch full details after login to sync fully.
    const profileRes = await API.get('/auth/profile');
    setUser(profileRes.data);
    return profileRes.data;
  };

  const signup = async (name, email, password, username) => {
    const res = await API.post('/auth/signup', { name, email, password, username });
    localStorage.setItem('token', res.data.token);
    const profileRes = await API.get('/auth/profile');
    setUser(profileRes.data);
    return profileRes.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const updateProfile = async (updatedData) => {
    const res = await API.put('/auth/profile', updatedData);
    setUser(res.data);
    return res.data;
  };

  const completeOnboarding = async () => {
    const res = await API.put('/onboarding/complete');
    const profileRes = await API.get('/auth/profile');
    setUser(profileRes.data);
    return res.data;
  };

  const updateOnboardingStep = async (step) => {
    const res = await API.put('/onboarding/step', { step });
    setUser(prev => {
      if (!prev) return null;
      return {
        ...prev,
        onboardingStep: res.data.onboardingStep
      };
    });
    return res.data;
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, signup, logout, updateProfile, completeOnboarding, updateOnboardingStep }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
