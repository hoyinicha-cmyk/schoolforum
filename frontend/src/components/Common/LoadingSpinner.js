import React from 'react';

const LoadingSpinner = ({ size = 'medium', text = 'Loading...' }) => {
  const sizeClasses = {
    small: 'h-4 w-4',
    medium: 'h-8 w-8',
    large: 'h-12 w-12'
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] space-y-4">
      <div className={`animate-spin rounded-full border-4 border-gray-200 border-t-primary-500 ${sizeClasses[size]}`}></div>
      {text && (
        <p className="text-gray-600 text-sm font-medium">{text}</p>
      )}
    </div>
  );
};

export const PageLoader = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-primary-500 mx-auto"></div>
        <h2 className="mt-4 text-lg font-medium text-gray-900">Loading...</h2>
        <p className="mt-2 text-sm text-gray-500">Please wait while we load your content</p>
      </div>
    </div>
  );
};

export const ButtonSpinner = () => {
  return (
    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
  );
};

export default LoadingSpinner;