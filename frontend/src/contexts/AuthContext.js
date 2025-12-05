import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, getCurrentUser, saveAuthData, clearAuthData } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const storedUser = getCurrentUser();
        const storedToken = localStorage.getItem('token');
        
        if (storedUser && storedToken) {
          console.log('🔍 Stored user and token found');
          console.log('👤 User:', storedUser.email, '- Role:', storedUser.role, '- Status:', storedUser.status);
          console.log('🎯 Badge check:', storedUser.badge ? `Has badge: ${storedUser.badge}` : 'NO BADGE - Will refresh!');
          
          // Check if badge property is missing (old user data)
          if (!storedUser.badge) {
            console.log('⚠️ Badge property missing, refreshing user data...');
            try {
              const res = await authAPI.getProfile();
              const updatedUser = res.data.user;
              console.log('📦 Fresh user data received:', updatedUser);
              setUser(updatedUser);
              setIsAuthenticated(true);
              saveAuthData(storedToken, updatedUser);
              console.log('✅ User data refreshed with badge:', updatedUser.badge);
            } catch (refreshErr) {
              console.error('❌ Failed to refresh user data:', refreshErr);
              // Fall back to stored user even without badge
              setUser(storedUser);
              setIsAuthenticated(true);
            }
          } else {
            // Use stored user data directly
            setUser(storedUser);
            setIsAuthenticated(true);
            console.log('✅ Auth restored from localStorage with badge:', storedUser.badge);
          }
        } else {
          console.log('ℹ️ No stored user or token found');
        }
      } catch (err) {
        console.error('❌ Auth init error:', err);
        clearAuthData();
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const login = async (credentials) => {
    try {
      console.log('🔑 AuthContext: Starting login...');
      setLoading(true);
      
      console.log('📡 AuthContext: Calling API...');
      const res = await authAPI.login(credentials);
      console.log('✅ AuthContext: API response received:', res.data);
      
      const { user: userData, token } = res.data;
      
      console.log('💾 AuthContext: Saving auth data...');
      saveAuthData(token, userData);
      
      console.log('👤 AuthContext: Setting user state...');
      setUser(userData);
      setIsAuthenticated(true);

      console.log('✅ AuthContext: Login complete!');
      toast.success(`Welcome back, ${userData.firstName}!`);
      return { success: true, user: userData };
      
    } catch (err) {
      console.error('❌ AuthContext: Login error:', err);
      console.error('❌ AuthContext: Error response:', err.response?.data);
      const msg = err.response?.data?.message || err.response?.data?.error || "Login failed";
      toast.error(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  const register = async (data) => {
    try {
      setLoading(true);
      const res = await authAPI.register(data);
      toast.success("Registration successful! Check your email.");
      return { success: true, data: res.data };
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } finally {
      clearAuthData();
      setUser(null);
      setIsAuthenticated(false);
      toast.success("Logged out");
    }
  };

  const verifyEmail = async (token) => {
    try {
      const res = await authAPI.verify(token);
      toast.success("Email verified!");
      return { success: true };
    } catch (err) {
      toast.error("Verification failed");
      return { success: false };
    }
  };

  // -------------------------------------
  // PERMISSION HELPERS
  // -------------------------------------
  const isEmailVerified = () => user?.emailVerified === 1 || user?.emailVerified === true;
  const isApproved = () => user?.status === "active";

  const isAdmin = () => {
    const r = user?.role || user?.accessLevel;
    return r?.toLowerCase() === "admin";
  };

  const isModerator = () => {
    const r = user?.role || user?.accessLevel;
    return ["moderator", "admin"].includes(r?.toLowerCase());
  };

  const canAccessGrade = (grade) => {
    if (!isApproved()) return false;
    if (isModerator()) return true;
    return user?.yearLevel === grade;
  };

  // 🔵 ADD HERE — getUserStatusInfo (NO REMOVALS)
  const getUserStatusInfo = () => {
    if (!user) return { status: "Unknown", color: "gray" };

    if (!isEmailVerified()) {
      return { status: "Email not verified", color: "red" };
    }

    if (!isApproved()) {
      return { status: "Pending approval", color: "yellow" };
    }

    return { status: "Active", color: "green" };
  };

  // Refresh user data from server
  const refreshUser = async () => {
    try {
      console.log('🔄 Refreshing user data...');
      const res = await authAPI.getProfile();
      const updatedUser = res.data.user;
      setUser(updatedUser);
      
      // Update localStorage with fresh data
      const token = localStorage.getItem('token');
      if (token) {
        saveAuthData(token, updatedUser);
      }
      
      console.log('✅ User data refreshed');
      return { success: true, user: updatedUser };
    } catch (err) {
      console.error('❌ Failed to refresh user:', err.response?.data || err.message);
      // Don't clear auth data on refresh failure - just return error
      return { success: false, error: err.message };
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    verifyEmail,
    isEmailVerified,
    isApproved,
    isAdmin,
    isModerator,
    canAccessGrade,
    getUserStatusInfo,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
