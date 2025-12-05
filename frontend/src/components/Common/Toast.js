import React, { useEffect } from 'react';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ExclamationTriangleIcon, 
  InformationCircleIcon,
  XMarkIcon 
} from '@heroicons/react/24/outline';

/**
 * Toast Notification Component
 * @param {string} type - success, error, warning, info
 * @param {string} message - The message to display
 * @param {function} onClose - Callback when toast is closed
 * @param {number} duration - Auto-close duration in ms (0 = no auto-close)
 */
const Toast = ({ type = 'info', message, onClose, duration = 5000 }) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const getToastStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-gradient-to-r from-emerald-500 to-green-600',
          icon: CheckCircleIcon,
          iconColor: 'text-white',
          border: 'border-emerald-400'
        };
      case 'error':
        return {
          bg: 'bg-gradient-to-r from-red-500 to-red-600',
          icon: XCircleIcon,
          iconColor: 'text-white',
          border: 'border-red-400'
        };
      case 'warning':
        return {
          bg: 'bg-gradient-to-r from-yellow-500 to-orange-500',
          icon: ExclamationTriangleIcon,
          iconColor: 'text-white',
          border: 'border-yellow-400'
        };
      case 'info':
      default:
        return {
          bg: 'bg-gradient-to-r from-blue-500 to-blue-600',
          icon: InformationCircleIcon,
          iconColor: 'text-white',
          border: 'border-blue-400'
        };
    }
  };

  const styles = getToastStyles();
  const Icon = styles.icon;

  return (
    <div className="fixed top-4 right-4 z-[9999] animate-slide-in-right">
      <div className={`${styles.bg} ${styles.border} border-2 rounded-xl shadow-2xl p-4 min-w-[320px] max-w-md backdrop-blur-sm`}>
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <Icon className={`h-6 w-6 ${styles.iconColor} animate-bounce-subtle`} />
          </div>
          <div className="flex-1">
            <p className="text-white font-medium text-sm leading-relaxed">
              {message}
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 text-white hover:text-gray-200 transition-colors"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
        {duration > 0 && (
          <div className="mt-2 h-1 bg-white/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white rounded-full animate-progress"
              style={{ animationDuration: `${duration}ms` }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Toast;
