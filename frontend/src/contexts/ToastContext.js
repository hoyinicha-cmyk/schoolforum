import React, { createContext, useContext, useState, useCallback } from 'react';
import Toast from '../components/Common/Toast';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((type, message, duration = 5000) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, type, message, duration }]);
  }, []);

  const success = useCallback((message, duration) => {
    showToast('success', message, duration);
  }, [showToast]);

  const error = useCallback((message, duration) => {
    showToast('error', message, duration);
  }, [showToast]);

  const warning = useCallback((message, duration) => {
    showToast('warning', message, duration);
  }, [showToast]);

  const info = useCallback((message, duration) => {
    showToast('info', message, duration);
  }, [showToast]);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ success, error, warning, info }}>
      {children}
      <div className="fixed top-4 right-4 z-[9999] space-y-2">
        {toasts.map((toast, index) => (
          <div 
            key={toast.id} 
            style={{ 
              transform: `translateY(${index * 10}px)`,
              transition: 'transform 0.3s ease'
            }}
          >
            <Toast
              type={toast.type}
              message={toast.message}
              duration={toast.duration}
              onClose={() => removeToast(toast.id)}
            />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
