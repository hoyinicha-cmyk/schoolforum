import React, { useState, useEffect } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { ButtonSpinner } from '../components/Common/LoadingSpinner';
import { EyeIcon, EyeSlashIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';

const Login = () => {
  const { login, isAuthenticated } = useAuth();
  const toast = useToast();
  const location = useLocation();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Check for stored auth errors
  useEffect(() => {
    const authError = sessionStorage.getItem('authError');
    if (authError) {
      toast.error(authError);
      sessionStorage.removeItem('authError');
    }
  }, [toast]);

  

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!formData.email.includes('@')) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('🔐 Attempting login with:', formData.email);
      const result = await login(formData);
      console.log('📡 Login result:', result);

      if (result.success) {
        console.log('✅ Login successful!');
        const role = result.user.role?.toLowerCase();
        console.log('👤 User role:', role);

        // ADMIN - redirect to admin panel
        if (role === "admin") {
          console.log('🔀 Redirecting to /admin');
          return window.location.href = "/admin";
        }

        // MODERATOR - redirect to general forum
        if (role === "moderator") {
          console.log('🔀 Redirecting to /forum/general');
          return window.location.href = "/forum/general";
        }

        // STUDENT - redirect to dashboard (chatbox)
        console.log('🔀 Redirecting to /');
        return window.location.href = "/";
      } else {
        // Login failed
        console.error('❌ Login failed:', result.error);
        
        // Check if it's an email verification error
        if (result.error && result.error.toLowerCase().includes('email not verified')) {
          toast.warning('Your email is not verified. Please check your inbox or resend the verification email.');
          setTimeout(() => {
            window.location.href = '/resend-verification';
          }, 2000);
          return;
        }
        
        toast.error(result.error || 'Login failed. Please check your credentials.');
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      toast.error('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }



  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>
      
      <div className="max-w-md w-full space-y-8 relative z-10 animate-fade-in-up">
        {/* Header */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center justify-center space-x-3 group">
            <div className="h-16 w-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center shadow-xl group-hover:shadow-2xl transition-all duration-300 transform group-hover:scale-110 glow-emerald">
              <span className="text-white font-bold text-2xl">SF</span>
            </div>
            <div className="text-left">
              <h1 className="text-3xl font-bold gradient-text">School Forum</h1>
              <p className="text-sm text-gray-600 font-medium">Grades 11 & 12</p>
            </div>
          </Link>
          <h2 className="mt-8 text-4xl font-extrabold text-gray-900">
            Welcome Back!
          </h2>
          <p className="mt-3 text-base text-gray-600">
            Sign in to continue your learning journey
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-emerald-600 hover:text-emerald-500 transition-colors">
              Create one now →
            </Link>
          </p>
        </div>

        {/* Login Form */}
        <div className="card-glass animate-scale-in">
          <div className="card-body p-8">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="form-label">
                  Gmail Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className={`form-input ${errors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'focus:border-emerald-500 focus:ring-emerald-500'}`}
                    placeholder="your.name@gmail.com"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                  {errors.email && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
                    </div>
                  )}
                </div>
                {errors.email && <p className="form-error">{errors.email}</p>}
                <p className="form-help"></p>
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="form-label">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    className={`form-input pr-10 ${errors.password ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'focus:border-emerald-500 focus:ring-emerald-500'}`}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-emerald-600" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400 hover:text-emerald-600" />
                    )}
                  </button>
                </div>
                {errors.password && <p className="form-error">{errors.password}</p>}
              </div>

              {/* Forgot Password Link */}
              <div className="flex items-center justify-end">
                <Link 
                  to="/forgot-password" 
                  className="text-sm font-medium text-emerald-600 hover:text-emerald-500"
                >
                  Forgot your password?
                </Link>
              </div>

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white btn-lg w-full flex justify-center items-center rounded-md py-2 font-semibold"
                >
                  {isLoading ? (
                    <>
                      <ButtonSpinner />
                      <span className="ml-2">Signing in...</span>
                    </>
                  ) : (
                    'Sign in'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Information Card */}
        <div className="card border border-emerald-100">
          <div className="card-body">
            <h3 className="text-lg font-medium text-gray-900 mb-4">New to School Forum?</h3>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 h-5 w-5 bg-emerald-100 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-emerald-600 text-xs font-bold">1</span>
                </div>
                <p>Register with your Gmail address and upload your school ID</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 h-5 w-5 bg-emerald-100 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-emerald-600 text-xs font-bold">2</span>
                </div>
                <p>Verify your email address and wait for admin approval</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 h-5 w-5 bg-emerald-100 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-emerald-600 text-xs font-bold">3</span>
                </div>
                <p>Access grade-specific forums and connect with batchmates</p>
              </div>
            </div>
            <div className="mt-4">
              <Link to="/register" className="border border-emerald-600 text-emerald-600 hover:bg-emerald-50 w-full py-2 rounded-md flex justify-center font-medium">
                Create Account
              </Link>
            </div>
          </div>
        </div>

        {/* Demo Accounts (Commented Out)
        -------------------------------------------------- */}
        {/*
        <div className="card border border-emerald-100">
          <div className="card-body">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Demo Accounts</h4>
            <div className="text-xs text-gray-600 space-y-1">
              <p><strong>Admin:</strong> admin@school.edu / AdminPass123!</p>
              <p><strong>Moderator:</strong> moderator@school.edu / ModPass123!</p>
            </div>
          </div>
        </div>
        */}
      </div>
    </div>
  );
};

export default Login;
