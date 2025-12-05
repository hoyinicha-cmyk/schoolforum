import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import LoadingSpinner from '../Common/LoadingSpinner';


const ProtectedRoute = ({ 
  children, 
  requiresVerification = false, 
  requiresApproval = false,
  requiredGrade = null,
  requiresAdmin = false
}) => {
  const { user, loading, isAuthenticated, isEmailVerified, isApproved, canAccessGrade, isAdmin, isModerator } = useAuth();
  const toast = useToast();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner />;
  }

  // Check if user is authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check email verification requirement
  if (requiresVerification && !isEmailVerified()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100">
              <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Email Verification Required</h3>
            <p className="mt-2 text-sm text-gray-500">
              Please check your email and click the verification link to access this content.
            </p>
            <div className="mt-4">
              <Navigate to="/dashboard" replace />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Check approval requirement
  if (requiresApproval && !isApproved()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100">
              <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Account Approval Required</h3>
            <p className="mt-2 text-sm text-gray-500">
              Your account is pending admin approval. You can only access General Discussion for now.
            </p>
            <div className="mt-4">
              <Navigate to="/forum/general" replace />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Check grade-specific access
  if (requiredGrade) {
    console.log('🎓 Grade Check:', {
      requiredGrade,
      userGrade: user?.yearLevel,
      userStatus: user?.status,
      userRole: user?.role,
      canAccess: canAccessGrade(requiredGrade)
    });
    
    if (!canAccessGrade(requiredGrade)) {
      console.error('❌ Access denied to', requiredGrade, 'forum');
      toast.error(`Access Denied! You need ${requiredGrade} access to view this forum.`);
      
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Access Denied</h3>
              <p className="mt-2 text-sm text-gray-500">
                You don't have access to the {requiredGrade} forum. This content is only available for {requiredGrade} students.
              </p>
              <p className="mt-2 text-xs text-gray-400">
                Your grade: {user?.yearLevel} | Status: {user?.status}
              </p>
              <div className="mt-4">
                <Navigate to="/dashboard" replace />
              </div>
            </div>
          </div>
        </div>
      );
    }
  }

  // Check admin requirement
  if (requiresAdmin && !isAdmin() && !isModerator()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H10m8-9a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Admin Access Required</h3>
            <p className="mt-2 text-sm text-gray-500">
              You need administrator privileges to access this content.
            </p>
            <div className="mt-4">
              <Navigate to="/dashboard" replace />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;