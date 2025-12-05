import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  UserCircleIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronDownIcon,
  ArrowRightOnRectangleIcon,
  UserIcon,
  CogIcon,
  BellIcon
} from '@heroicons/react/24/outline';
import Avatar from '../Profile/Avatar';
import { getApiBaseUrl } from '../../utils/apiUrl';

const Header = () => {
  const { user, isAuthenticated, logout, getUserStatusInfo } = useAuth();
  const navigate = useNavigate();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (isAuthenticated) {
      fetchUnreadCount();
      // Poll for new notifications every 10 seconds
      const interval = setInterval(fetchUnreadCount, 10000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const fetchNotifications = async () => {
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/notifications`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications);
        const unread = data.notifications.filter(n => !n.isRead).length;
        setUnreadCount(unread);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/notifications/unread-count`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.count);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await fetch(`${getApiBaseUrl()}/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      fetchNotifications();
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
    setIsProfileMenuOpen(false);
  };

  const statusInfo = getUserStatusInfo();

  const getStatusBadge = () => {
    if (!user || !isAuthenticated) return null;

    // Determine color based on status
    let colorClasses = 'bg-yellow-100 text-yellow-800'; // default to yellow
    
    const status = statusInfo.status.toLowerCase();
    
    if (status === 'active') {
      colorClasses = 'bg-green-100 text-green-800';
    } else if (status.includes('suspended')) {
      colorClasses = 'bg-yellow-100 text-yellow-800';
    } else if (status.includes('pending')) {
      colorClasses = 'bg-yellow-100 text-yellow-800';
    } else if (status.includes('unknown')) {
      return null; // Don't show badge if status is unknown
    }

    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colorClasses}`}>
        {statusInfo.status}
      </span>
    );
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      {/* SHIFT CONTENT RIGHT TO CLEAR SIDEBAR */}
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 ml-0 sm:ml-16 lg:ml-64">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Title */}
          <div className="flex items-center min-w-0 flex-1">
            <Link to="/app" className="flex items-center space-x-2 min-w-0">
              {/* FIXED: real gradient class */}
              <div className="h-8 w-8 flex-shrink-0 bg-gradient-to-r from-emerald-500 to-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">SF</span>
              </div>
              <div className="min-w-0">
                <h1 className="text-base sm:text-xl font-bold text-gray-900 truncate">School Forum</h1>
                <p className="text-xs text-gray-500 hidden sm:block">Grades 11 & 12</p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {!isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="btn-emerald btn-sm"
                >
                  Sign Up
                </Link>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                {/* Status Badge */}
                {getStatusBadge()}
                
                {/* Notification Bell */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowNotifications(!showNotifications);
                      if (!showNotifications) fetchNotifications();
                    }}
                    className="relative p-2 text-gray-600 hover:text-emerald-600 hover:bg-gray-100 rounded-lg transition"
                  >
                    <BellIcon className="h-6 w-6" />
                    {unreadCount > 0 && (
                      <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notifications Dropdown */}
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-y-auto">
                      <div className="p-3 border-b border-gray-200">
                        <h3 className="font-semibold text-gray-900">Notifications</h3>
                      </div>
                      {notifications.length === 0 ? (
                        <p className="p-4 text-center text-gray-500 text-sm">No notifications</p>
                      ) : (
                        <div>
                          {notifications.map(notif => {
                            const handleNotificationClick = () => {
                              markAsRead(notif.id);
                              
                              // Close the notification dropdown
                              setShowNotifications(false);
                              
                              // If it's a new_post or announcement notification, navigate to the thread
                              if ((notif.type === 'new_post' || notif.type === 'announcement') && notif.relatedId) {
                                navigate(`/thread/${notif.relatedId}`);
                              }
                              
                              // If it's a mention notification, navigate to chat box with highlight
                              if (notif.type === 'mention' && notif.relatedId) {
                                navigate(`/chatbox?highlight=${notif.relatedId}`);
                              }
                            };
                            
                            return (
                              <div
                                key={notif.id}
                                onClick={handleNotificationClick}
                                className={`p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition ${
                                  !notif.isRead ? 'bg-emerald-50' : ''
                                }`}
                              >
                                <p className="text-sm text-gray-900">{notif.message}</p>
                                <span className="text-xs text-gray-500">
                                  {new Date(notif.createdAt).toLocaleString()}
                                </span>
                                {notif.type === 'new_post' && (
                                  <span className="text-xs text-emerald-600 block mt-1">
                                    Click to view thread →
                                  </span>
                                )}
                                {notif.type === 'mention' && (
                                  <span className="text-xs text-blue-600 block mt-1">
                                    Click to view message →
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 rounded-md p-1"
                  >
                    <Avatar avatarId={user.avatarId} size="md" />
                    <div className="hidden lg:block text-left">
                      <p className="text-sm font-medium text-gray-900">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs text-gray-500">{user.yearLevel} Student</p>
                    </div>
                    <ChevronDownIcon className="h-4 w-4" />
                  </button>

                  {/* Dropdown Menu */}
                  {isProfileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                      <div className="py-1">
                        <Link
                          to="/app/profile"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsProfileMenuOpen(false)}
                        >
                          <UserIcon className="h-4 w-4 mr-3" />
                          Profile
                        </Link>
                        <Link
                          to="/app"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsProfileMenuOpen(false)}
                        >
                          <CogIcon className="h-4 w-4 mr-3" />
                          Dashboard
                        </Link>
                        {(user.role === 'admin' || user.role === 'moderator') && (
                          <Link
                            to="/app/admin"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => setIsProfileMenuOpen(false)}
                          >
                            <CogIcon className="h-4 w-4 mr-3" />
                            Admin Panel
                          </Link>
                        )}
                        <hr className="my-1" />
                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <ArrowRightOnRectangleIcon className="h-4 w-4 mr-3" />
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-emerald-500"
            >
              {isMobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-200">
              {!isAuthenticated ? (
                <>
                  <Link
                    to="/login"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="block px-3 py-2 rounded-md text-base font-medium text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              ) : (
                <div className="space-y-1">
                  <div className="px-3 py-2">
                    <p className="text-base font-medium text-gray-800">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                    <div className="mt-1">{getStatusBadge()}</div>
                  </div>
                  <Link
                    to="/app"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/app/profile"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  {(user.role === 'admin' || user.role === 'moderator') && (
                    <Link
                      to="/app/admin"
                      className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Admin Panel
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Click outside to close dropdowns */}
      {isProfileMenuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsProfileMenuOpen(false)}
        ></div>
      )}
      {showNotifications && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowNotifications(false)}
        ></div>
      )}
    </header>
  );
};

export default Header;
