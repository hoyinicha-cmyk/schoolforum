import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ButtonSpinner } from '../components/Common/LoadingSpinner';
import { EyeIcon, EyeSlashIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const Register = () => {
  const { register, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    yearLevel: 'G11',
    gender: 'prefer_not_to_say'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

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
   
    }

    if (!formData.firstName || formData.firstName.length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    }

    if (!formData.lastName || formData.lastName.length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and number';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
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
      const { confirmPassword, ...registrationData } = formData;
      const result = await register(registrationData);

      if (result.success) {
        setRegistrationSuccess(true);
      }
    } catch (error) {
      console.error('Registration error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (registrationSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="text-center card-glass p-10 animate-scale-in">
            <div className="mx-auto h-20 w-20 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center shadow-xl glow-emerald animate-bounce-subtle">
              <CheckCircleIcon className="h-12 w-12 text-white" />
            </div>
            <h2 className="mt-6 text-3xl font-bold text-gray-900">Registration Successful!</h2>
            <p className="mt-3 text-base text-gray-600">
              We've sent a verification link to your email address.
            </p>
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                📧 Check your inbox and click the verification link to activate your account.
              </p>
            </div>
            <div className="mt-6 space-y-3">
              <Link to="/login" className="btn-emerald w-full">
                Continue to Login
              </Link>
              <p className="text-xs text-gray-500">
                Didn't receive the email?{' '}
                <Link to="/resend-verification" className="text-emerald-600 hover:text-emerald-500 font-semibold">
                  Resend verification email →
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
            Join Our Community
          </h2>
          <p className="mt-3 text-base text-gray-600">
            Create your account and start learning together
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-emerald-600 hover:text-emerald-500 transition-colors">
              Sign in here →
            </Link>
          </p>
        </div>

        {/* Registration Form */}
        <div className="card">
          <div className="card-body">
            <form className="space-y-4" onSubmit={handleSubmit}>
              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="firstName" className="form-label">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    className={`form-input focus:border-emerald-500 focus:ring-emerald-500 ${errors.firstName ? 'border-red-300' : ''}`}
                    value={formData.firstName}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                  {errors.firstName && <p className="form-error">{errors.firstName}</p>}
                </div>

                <div>
                  <label htmlFor="lastName" className="form-label">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    className={`form-input focus:border-emerald-500 focus:ring-emerald-500 ${errors.lastName ? 'border-red-300' : ''}`}
                    value={formData.lastName}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                  {errors.lastName && <p className="form-error">{errors.lastName}</p>}
                </div>
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="form-label">
  Email Address <span className="text-red-500">*</span>
</label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className={`form-input focus:border-emerald-500 focus:ring-emerald-500 ${errors.email ? 'border-red-300' : ''}`}
                  placeholder="your.name@gmail.com"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isLoading}
                />
                {errors.email && <p className="form-error">{errors.email}</p>}
                <p className="form-help">Enter your active email address</p>

              </div>

              {/* Year Level */}
              <div>
                <label htmlFor="yearLevel" className="form-label">
                  Year Level <span className="text-red-500">*</span>
                </label>
                <select
                  id="yearLevel"
                  name="yearLevel"
                  className="form-input focus:border-emerald-500 focus:ring-emerald-500"
                  value={formData.yearLevel}
                  onChange={handleChange}
                  disabled={isLoading}
                >
                  <option value="G11">Grade 11</option>
                  <option value="G12">Grade 12</option>
                </select>
              </div>

              {/* Gender */}
              <div>
                <label htmlFor="gender" className="form-label">
                  Gender <span className="text-red-500">*</span>
                </label>
                <select
                  id="gender"
                  name="gender"
                  className="form-input focus:border-emerald-500 focus:ring-emerald-500"
                  value={formData.gender}
                  onChange={handleChange}
                  disabled={isLoading}
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="prefer_not_to_say">Prefer not to say</option>
                </select>
              </div>

              {/* Password Fields */}
              <div>
                <label htmlFor="password" className="form-label">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    className={`form-input pr-10 focus:border-emerald-500 focus:ring-emerald-500 ${errors.password ? 'border-red-300' : ''}`}
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

              <div>
                <label htmlFor="confirmPassword" className="form-label">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    className={`form-input pr-10 focus:border-emerald-500 focus:ring-emerald-500 ${errors.confirmPassword ? 'border-red-300' : ''}`}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-emerald-600" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400 hover:text-emerald-600" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && <p className="form-error">{errors.confirmPassword}</p>}
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white btn-lg w-full flex justify-center items-center rounded-md py-2 font-semibold"
                >
                  {isLoading ? (
                    <>
                      <ButtonSpinner />
                      <span className="ml-2">Creating Account...</span>
                    </>
                  ) : (
                    'Create Account'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Demo Info (Commented Out)
        --------------------------------------------- */}
        {/*
        <div className="card border border-emerald-100">
          <div className="card-body">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Demo Accounts Available</h4>
            <div className="text-xs text-gray-600 space-y-1">
              <p><strong>Admin:</strong> admin@school.edu / AdminPass123!</p>
              <p><strong>Moderator:</strong> moderator@school.edu / ModPass123!</p>
              <p><strong>Student:</strong> student@gmail.com / StudentPass123!</p>
            </div>
          </div>
        </div>
        */}
      </div>
    </div>
  );
};

export default Register;
