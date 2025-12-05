import axios from 'axios';
import Cookies from 'js-cookie';

// Auto-detect API URL based on current host
const getApiUrl = () => {
  // If REACT_APP_API_URL is set, use it
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  // Get current hostname
  const hostname = window.location.hostname;
  
  // If accessing from localhost, use localhost
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:5000/api';
  }
  
  // Otherwise, use the same hostname (IP address) with port 5000
  return `http://${hostname}:5000/api`;
};

// Create axios instance with base configuration
const api = axios.create({
  baseURL: getApiUrl(),
  withCredentials: true,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token') || localStorage.getItem('token');
    console.log('🔑 API Interceptor: Token from cookies:', Cookies.get('token') ? 'EXISTS' : 'MISSING');
    console.log('🔑 API Interceptor: Token from localStorage:', localStorage.getItem('token') ? 'EXISTS' : 'MISSING');
    console.log('🔑 API Interceptor: Using token:', token ? token.substring(0, 20) + '...' : 'NO TOKEN');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('✅ API Interceptor: Authorization header set');
    } else {
      console.warn('⚠️ API Interceptor: NO TOKEN FOUND!');
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle suspended/banned accounts
    if (error.response?.status === 403 && error.response?.data?.requiresLogout) {
      // Clear auth data
      Cookies.remove('token');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Store message for display after redirect
      const message = error.response.data.message || 'Your account has been restricted.';
      sessionStorage.setItem('authError', message);
      
      // Redirect to login
      window.location.href = '/login';
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Clear invalid token
      Cookies.remove('token');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Redirect to login if not already there
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// Auth API endpoints
export const authAPI = {
  register: (userData, schoolIdFile) => {
    const formData = new FormData();
    Object.keys(userData).forEach(key => {
      formData.append(key, userData[key]);
    });
    if (schoolIdFile) {
      formData.append('schoolId', schoolIdFile);
    }
    return api.post('/auth/register', userData);
  },

  login: (credentials) => api.post('/auth/login', credentials),
  
  logout: () => api.post('/auth/logout'),
  
  verify: (token) => api.get(`/auth/verify/${token}`),
  
  getProfile: () => api.get('/auth/profile'),
  
  refreshToken: () => api.post('/auth/refresh'),
};

// Upload API endpoints
export const uploadAPI = {
  uploadSchoolId: (file) => {
    const formData = new FormData();
    formData.append('schoolId', file);
    return api.post('/upload/school-id', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  getSchoolId: (userId) => api.get(`/upload/school-id/${userId}`),
  
  getUploadStatus: () => api.get('/upload/status'),
  
  deleteSchoolId: (userId) => api.delete(`/upload/school-id/${userId}`),
};

// Forum API endpoints
export const forumAPI = {
  getGeneral: () => api.get('/forum/general'),
  
  getG11: () => api.get('/forum/g11'),
  
  getG12: () => api.get('/forum/g12'),
  
  getAccess: () => api.get('/forum/access'),
  
  getPosts: (forumType) => api.get(`/forum/${forumType}/posts`),
  
  getPost: (postId) => api.get(`/forum/posts/${postId}`),
  
  getReplies: (postId) => api.get(`/forum/posts/${postId}/replies`),
  
  createPost: (postData) => api.post('/forum/posts', postData),
  
  createReply: (postId, replyData) => api.post(`/forum/posts/${postId}/replies`, replyData),
  
  // Reactions
  reactToPost: (postId, reactionType) => api.post(`/forum/posts/${postId}/react`, { reactionType }),
  
  removePostReaction: (postId) => api.delete(`/forum/posts/${postId}/react`),
  
  reactToReply: (replyId, reactionType) => api.post(`/forum/replies/${replyId}/react`, { reactionType }),
  
  removeReplyReaction: (replyId) => api.delete(`/forum/replies/${replyId}/react`),
  
  // Edit and delete
  updatePost: (postId, data) => api.put(`/forum/posts/${postId}`, data),
  deletePost: (postId) => api.delete(`/forum/posts/${postId}`),
  updateReply: (replyId, data) => api.put(`/forum/replies/${replyId}`, data),
  deleteReply: (replyId) => api.delete(`/forum/replies/${replyId}`),
  
  // Bookmarks
  bookmarkPost: (postId) => api.post(`/forum/bookmarks/${postId}`),
  
  removeBookmark: (postId) => api.delete(`/forum/bookmarks/${postId}`),
  
  getBookmarks: () => api.get('/forum/bookmarks'),
  
  // Hidden content
  unlockHiddenContent: (postId) => api.post(`/forum/posts/${postId}/unlock`),
};

// Admin API endpoints
export const adminAPI = {
  getPendingUsers: () => api.get('/admin/pending'),
  
  approveUser: (userId, userData) => api.put(`/admin/approve/${userId}`, userData),
  
  rejectUser: (userId, reason) => api.put(`/admin/reject/${userId}`, { reason }),
  
  getStats: () => api.get('/admin/stats'),
  
  updateUserRole: (userId, role) => api.put(`/admin/role/${userId}`, { role }),
  
  getUsers: (params) => api.get('/admin/users', { params }),
};

// Utility functions for API responses
export const handleApiError = (error) => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  } else if (error.response?.data?.error) {
    return error.response.data.error;
  } else if (error.message) {
    return error.message;
  } else {
    return 'An unexpected error occurred';
  }
};

export const isNetworkError = (error) => {
  return !error.response && error.request;
};

export const getErrorStatus = (error) => {
  return error.response?.status;
};

// Helper function to check if user is authenticated
export const isAuthenticated = () => {
  const token = Cookies.get('token') || localStorage.getItem('token');
  const user = localStorage.getItem('user');
  return !!(token && user);
};

// Helper function to get current user
export const getCurrentUser = () => {
  try {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
};

// Helper function to save auth data
export const saveAuthData = (token, user) => {
  if (token) {
    // Only use secure cookies in production (HTTPS)
    const isProduction = window.location.protocol === 'https:';
    Cookies.set('token', token, { expires: 7, secure: isProduction, sameSite: 'strict' });
    localStorage.setItem('token', token);
  }
  if (user) {
    localStorage.setItem('user', JSON.stringify(user));
  }
};

// Helper function to clear auth data
export const clearAuthData = () => {
  Cookies.remove('token');
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export default api;