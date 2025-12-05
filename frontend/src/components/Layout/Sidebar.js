import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { forumAPI } from '../../services/api';
import { getApiBaseUrl } from '../../utils/apiUrl';
import { canAccessChat } from '../../utils/contributorCheck';
import {
  HomeIcon,
  ChatBubbleLeftRightIcon,
  AcademicCapIcon,
  CogIcon,
  UserGroupIcon,
  DocumentTextIcon,
  CloudArrowUpIcon,
  ExclamationTriangleIcon,
  EnvelopeIcon,
  ChatBubbleOvalLeftEllipsisIcon
} from '@heroicons/react/24/outline';

const Sidebar = () => {
  const { user, isEmailVerified, isApproved, canAccessGrade, isAdmin, isModerator } = useAuth();
  const location = useLocation();
  const [accessibleForums, setAccessibleForums] = useState(['general']);
  const [unreadCount, setUnreadCount] = useState(0);
  const [mentionCount, setMentionCount] = useState(0);

  useEffect(() => {
    const fetchForumAccess = async () => {
      try {
        console.log('🔍 Fetching forum access for user:', user?.email);
        const response = await forumAPI.getAccess();
        console.log('📋 Forum access response:', response.data);
        console.log('✅ Accessible forums:', response.data.accessibleForums);
        setAccessibleForums(response.data.accessibleForums);
      } catch (error) {
        console.error('❌ Failed to fetch forum access:', error);
      }
    };

    const fetchUnreadCount = async () => {
      try {
        const response = await fetch(`${getApiBaseUrl()}/api/messages/unread-count`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (response.ok) {
          const data = await response.json();
          setUnreadCount(data.unreadCount);
        }
      } catch (error) {
        console.error('Failed to fetch unread count:', error);
      }
    };

    const fetchMentionCount = async () => {
      try {
        const response = await fetch(`${getApiBaseUrl()}/api/chat/mention-count`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (response.ok) {
          const data = await response.json();
          setMentionCount(data.mentionCount);
        }
      } catch (error) {
        console.error('Failed to fetch mention count:', error);
      }
    };

    if (user) {
      fetchForumAccess();
      fetchUnreadCount();
      fetchMentionCount();
      
      // Poll for unread messages and mentions every 30 seconds
      const interval = setInterval(() => {
        fetchUnreadCount();
        fetchMentionCount();
      }, 30000);
      
      // Listen for messages read event
      const handleMessagesRead = () => {
        fetchUnreadCount();
      };
      window.addEventListener('messagesRead', handleMessagesRead);
      
      return () => {
        clearInterval(interval);
        window.removeEventListener('messagesRead', handleMessagesRead);
      };
    }
  }, [user]);

  // Check ChatBox access
  const chatBoxAccess = canAccessChat(user);
  console.log('🎯 Sidebar - ChatBox access check:', chatBoxAccess, 'for user:', user?.email, 'role:', user?.role, 'badge:', user?.badge);

  const navigation = [
    {
      name: 'Dashboard',
      href: '/app',
      icon: HomeIcon,
      current: location.pathname === '/app' || location.pathname === '/app/',
      show: true
    },
    {
      name: 'Messages',
      href: '/app/messages',
      icon: ChatBubbleOvalLeftEllipsisIcon,
      current: location.pathname.startsWith('/app/messages'),
      show: true,
      badge: unreadCount > 0 ? unreadCount : null,
      badgeType: 'unread'
    },
    {
      name: 'Chat Box',
      href: '/app/chatbox',
      icon: ChatBubbleLeftRightIcon,
      current: location.pathname === '/app/chatbox',
      show: chatBoxAccess,
      requiresBadge: 'Forum Active (25+ points)',
      badge: mentionCount > 0 ? mentionCount : null,
      badgeType: 'mention'
    },
    {
      name: 'General Discussion',
      href: '/app/forum/general',
      icon: ChatBubbleLeftRightIcon,
      current: location.pathname === '/app/forum/general',
      show: isEmailVerified(),
      badge: accessibleForums.includes('general') ? null : 'Locked'
    },
    {
      name: 'Grade 11 Forum',
      href: '/app/forum/g11',
      icon: AcademicCapIcon,
      current: location.pathname === '/app/forum/g11',
      show: isApproved() && (canAccessGrade('G11') || isModerator() || isAdmin()),
      badge: accessibleForums.includes('g11') ? null : 'G11 Only'
    },
    {
      name: 'Grade 12 Forum',
      href: '/app/forum/g12',
      icon: AcademicCapIcon,
      current: location.pathname === '/app/forum/g12',
      show: isApproved() && (canAccessGrade('G12') || isModerator() || isAdmin()),
      badge: accessibleForums.includes('g12') ? null : 'G12 Only'
    },
    {
      name: 'Upload School ID',
      href: '/app/upload',
      icon: CloudArrowUpIcon,
      current: location.pathname === '/app/upload',
      show: isEmailVerified() && user?.status === 'pending',
      badge: 'Required'
    }
  ];

  const adminNavigation = [
    {
      name: 'Admin Panel',
      href: '/app/admin',
      icon: UserGroupIcon,
      current: location.pathname.startsWith('/app/admin'),
      show: isAdmin() || isModerator()
    }
  ];

  const NavItem = ({ item }) => {
    // Item is accessible if:
    // 1. No badge (always accessible)
    // 2. Badge is 'Required' (like Upload School ID)
    // 3. Badge is a notification count (unread/mention) - these are accessible
    const isAccessible = !item.badge || item.badge === 'Required' || item.badgeType === 'unread' || item.badgeType === 'mention';
    
    return (
      <li>
        {isAccessible ? (
          <Link
            to={item.href}
            className={`group flex items-center justify-between px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
              item.current
                ? 'bg-emerald-100 text-emerald-900 border-r-2 border-emerald-500'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center">
              <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
              {item.name}
            </div>
            {item.badge && (
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                item.badgeType === 'unread'
                  ? 'bg-emerald-600 text-white'
                  : item.badgeType === 'mention'
                  ? 'bg-red-600 text-white'
                  : item.badge === 'Required' 
                  ? 'bg-red-100 text-red-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {item.badge}
              </span>
            )}
          </Link>
        ) : (
          <div className="group flex items-center justify-between px-4 py-2 text-sm font-medium rounded-md text-gray-400 cursor-not-allowed">
            <div className="flex items-center">
              <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
              {item.name}
            </div>
            {item.badge && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                {item.badge}
              </span>
            )}
          </div>
        )}
      </li>
    );
  };

  const getStatusAlert = () => {
    if (user.status === 'suspended') {
      return (
        <div className="mx-4 p-3 bg-orange-50 border border-orange-200 rounded-md">
          <div className="flex">
            <ExclamationTriangleIcon className="h-5 w-5 text-orange-400 flex-shrink-0" />
            <div className="ml-3">
              <h4 className="text-sm font-medium text-orange-800">
                Account Suspended
              </h4>
              <p className="text-xs text-orange-700 mt-1">
                Your account has been suspended. Forum access is restricted.
              </p>
            </div>
          </div>
        </div>
      );
    }

    if (!user.emailVerified) {
      return (
        <div className="mx-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <div className="flex">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-400 flex-shrink-0" />
            <div className="ml-3 flex-1">
              <h4 className="text-sm font-medium text-red-800">
                Email Not Verified
              </h4>
              <p className="text-xs text-red-700 mt-1">
                Check your email for verification link
              </p>
              <Link 
                to="/resend-verification"
                className="inline-flex items-center mt-2 text-xs text-white bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded-md font-medium transition-colors"
              >
                <EnvelopeIcon className="h-3.5 w-3.5 mr-1.5" />
                Resend Verification Email
              </Link>
            </div>
          </div>
        </div>
      );
    }

    if (user.status === 'pending' && !user.school_id_path) {
      return (
        <div className="mx-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <div className="flex">
            <DocumentTextIcon className="h-5 w-5 text-blue-400 flex-shrink-0" />
            <div className="ml-3">
              <h4 className="text-sm font-medium text-blue-800">
                Upload Required
              </h4>
              <p className="text-xs text-blue-700 mt-1">
                Upload your school ID for approval
              </p>
              <Link 
                to="/upload"
                className="text-xs text-blue-600 hover:text-blue-800 font-medium mt-1 block"
              >
                Upload Now →
              </Link>
            </div>
          </div>
        </div>
      );
    }

    if (user.status === 'pending') {
      return (
        <div className="mx-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <div className="flex">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400 flex-shrink-0" />
            <div className="ml-3">
              <h4 className="text-sm font-medium text-yellow-800">
                Pending Approval
              </h4>
              <p className="text-xs text-yellow-700 mt-1">
                Admin is reviewing your account
              </p>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="sidebar">
      <div className="flex flex-col h-full">
        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-6">
          {/* Status Alert */}
          {getStatusAlert()}

          {/* Main Navigation */}
          <div>
            <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Navigation
            </h3>
            <ul className="mt-3 space-y-1">
              {navigation.map((item) => 
                item.show ? <NavItem key={item.name} item={item} /> : null
              )}
            </ul>
          </div>

          {/* Admin Navigation */}
          {(isAdmin() || isModerator()) && (
            <div>
              <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Administration
              </h3>
              <ul className="mt-3 space-y-1">
                {adminNavigation.map((item) => 
                  item.show ? <NavItem key={item.name} item={item} /> : null
                )}
              </ul>
            </div>
          )}

        </nav>
      </div>
    </div>
  );
};

export default Sidebar;