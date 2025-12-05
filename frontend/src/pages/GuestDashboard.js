import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AcademicCapIcon,
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  StarIcon,
  ArrowRightIcon,
  ChartBarIcon,
  EyeIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  ClockIcon,
  FireIcon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { getAvatarUrl } from '../utils/avatars';

const GuestDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    weeklyPosts: { general: 0, g11: 0, g12: 0 },
    recentPosts: [],
    newestUsers: [],
    allUsers: [],
    moderators: [],
    userStats: {
      totalUsers: 0,
      activeUsers: 0,
      pendingUsers: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/dashboard-stats', {
        cache: 'no-cache'
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats({
          ...data,
          allUsers: data.newestUsers || [],
          moderators: data.moderators || []
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      name: 'Grade-Specific Forums',
      description: 'Separate discussion areas for Grade 11 and Grade 12 students.',
      icon: AcademicCapIcon,
      color: 'text-emerald-600'
    },
    {
      name: 'Secure Registration',
      description: 'Gmail-only registration with school ID verification.',
      icon: ShieldCheckIcon,
      color: 'text-green-600'
    },
    {
      name: 'Academic Discussions',
      description: 'Share study materials and collaborate on projects.',
      icon: DocumentTextIcon,
      color: 'text-blue-600'
    },
    {
      name: 'Peer Connection',
      description: 'Connect with classmates and build friendships.',
      icon: UserGroupIcon,
      color: 'text-purple-600'
    },
    {
      name: 'Moderated Environment',
      description: 'Safe platform with dedicated moderators.',
      icon: ChatBubbleLeftRightIcon,
      color: 'text-indigo-600'
    },
    {
      name: 'College Prep Support',
      description: 'Get advice on college applications and scholarships.',
      icon: StarIcon,
      color: 'text-yellow-600'
    }
  ];

  const totalWeeklyPosts = (stats.weeklyPosts?.general || 0) + 
                           (stats.weeklyPosts?.g11 || 0) + 
                           (stats.weeklyPosts?.g12 || 0);

  const handleGuestAction = (e) => {
    if (e) e.preventDefault();
    navigate('/register');
  };

  const formatTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + ' years ago';
    
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + ' months ago';
    
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + ' days ago';
    
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + ' hours ago';
    
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + ' minutes ago';
    
    return Math.floor(seconds) + ' seconds ago';
  };

  const getModalData = () => {
    switch (showModal) {
      case 'totalUsers':
        return stats.allUsers || [];
      case 'activeUsers':
        return (stats.allUsers || []).filter(u => u.status === 'active');
      case 'posts':
        return stats.recentPosts || [];
      case 'moderators':
        return stats.moderators || [];
      default:
        return [];
    }
  };

  const getPaginatedData = () => {
    const data = getModalData();
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  };

  const totalPages = Math.ceil(getModalData().length / itemsPerPage);

  const renderModalContent = () => {
    const data = getPaginatedData();

    if (showModal === 'posts') {
      return (
        <div className="space-y-4">
          {data.map((post) => (
            <div key={post.id} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
              <h3 className="font-semibold text-gray-900 mb-2">{post.title}</h3>
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {post.content?.replace(/<[^>]*>/g, '').substring(0, 150)}...
              </p>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <img 
                    src={getAvatarUrl(post.authorAvatar)} 
                    alt={post.authorFirstName}
                    className="w-6 h-6 rounded-full"
                  />
                  <span>{post.authorFirstName} {post.authorLastName}</span>
                </div>
                <span className="flex items-center gap-1">
                  <ChatBubbleOvalLeftEllipsisIcon className="h-4 w-4" />
                  {post.replyCount} replies
                </span>
                <span className="flex items-center gap-1">
                  <EyeIcon className="h-4 w-4" />
                  {post.viewCount} views
                </span>
                <span className="flex items-center gap-1">
                  <ClockIcon className="h-4 w-4" />
                  {formatTimeAgo(post.createdAt)}
                </span>
              </div>
              <button
                onClick={handleGuestAction}
                className="mt-3 px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors text-sm"
              >
                Read More
              </button>
            </div>
          ))}
        </div>
      );
    }

    // Users/Moderators
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {data.map((user) => (
          <div key={user.id} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
            <div className="flex items-center gap-3">
              <img 
                src={getAvatarUrl(user.avatarId)} 
                alt={user.firstName}
                className="w-16 h-16 rounded-full border-2 border-emerald-200"
              />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">
                  {user.firstName} {user.lastName}
                </h3>
                <div className="flex flex-wrap gap-2 mt-1">
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-xs">
                    {user.yearLevel}
                  </span>
                  {user.badge && (
                    <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs">
                      {user.badge}
                    </span>
                  )}
                  {user.role && user.role !== 'student' && (
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs uppercase">
                      {user.role}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">{user.points} points</p>
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <button
                onClick={handleGuestAction}
                className="flex-1 px-3 py-1.5 bg-emerald-600 text-white rounded text-xs hover:bg-emerald-700 transition-colors"
              >
                View Profile
              </button>
              <button
                onClick={handleGuestAction}
                className="flex-1 px-3 py-1.5 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
              >
                Follow
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const getModalTitle = () => {
    switch (showModal) {
      case 'totalUsers':
        return 'All Registered Users';
      case 'activeUsers':
        return 'Active Users (Verified Email & ID)';
      case 'posts':
        return 'Recent Posts This Week';
      case 'moderators':
        return 'Moderators & Admins';
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <AcademicCapIcon className="h-8 w-8 text-emerald-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">School Forum</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-gray-700 hover:text-emerald-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="bg-emerald-600 text-white hover:bg-emerald-700 px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-emerald-600 to-green-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-extrabold mb-6">
              Welcome to School Forum
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-emerald-100">
              Connect, Learn, and Grow with Fellow Students
            </p>
          </div>
        </div>
      </div>

      {/* Weekly Statistics */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            <ChartBarIcon className="inline-block h-8 w-8 text-emerald-600 mr-2" />
            This Week's Activity
          </h2>
          <p className="text-gray-600">Click on any box to see details</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <button
            onClick={() => { setShowModal('totalUsers'); setCurrentPage(1); }}
            className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-all transform hover:scale-105 cursor-pointer text-left"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-3xl font-bold text-emerald-600">
                  {loading ? '...' : stats.userStats?.totalUsers || 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">Click to view all</p>
              </div>
              <UserGroupIcon className="h-12 w-12 text-emerald-600 opacity-20" />
            </div>
          </button>

          <button
            onClick={() => { setShowModal('activeUsers'); setCurrentPage(1); }}
            className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-all transform hover:scale-105 cursor-pointer text-left"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-3xl font-bold text-green-600">
                  {loading ? '...' : stats.userStats?.activeUsers || 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">Verified email & ID</p>
              </div>
              <ShieldCheckIcon className="h-12 w-12 text-green-600 opacity-20" />
            </div>
          </button>

          <button
            onClick={() => { setShowModal('posts'); setCurrentPage(1); }}
            className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-all transform hover:scale-105 cursor-pointer text-left"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Posts This Week</p>
                <p className="text-3xl font-bold text-blue-600">
                  {loading ? '...' : totalWeeklyPosts}
                </p>
                <p className="text-xs text-gray-500 mt-1">Click to view posts</p>
              </div>
              <DocumentTextIcon className="h-12 w-12 text-blue-600 opacity-20" />
            </div>
          </button>

          <button
            onClick={() => { setShowModal('moderators'); setCurrentPage(1); }}
            className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-all transform hover:scale-105 cursor-pointer text-left"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Moderators & Admins</p>
                <p className="text-3xl font-bold text-purple-600">
                  {loading ? '...' : (stats.moderators?.length || 0)}
                </p>
                <p className="text-xs text-gray-500 mt-1">Click to view team</p>
              </div>
              <ShieldCheckIcon className="h-12 w-12 text-purple-600 opacity-20" />
            </div>
          </button>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Join Our Community?
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need for academic success
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div key={feature.name} className="bg-gray-50 rounded-lg p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center mb-4">
                  <feature.icon className={`h-8 w-8 ${feature.color}`} />
                  <h3 className="ml-3 text-lg font-semibold text-gray-900">
                    {feature.name}
                  </h3>
                </div>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-gray-600">
              Everything you need to know about joining our community
            </p>
          </div>

          <div className="space-y-6">
            {/* FAQ 1 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span className="flex-shrink-0 w-8 h-8 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center font-bold">1</span>
                How do I register?
              </h3>
              <p className="text-gray-600 ml-10">
                Click the "Sign Up" button, use your Gmail address, fill in your details (name, year level, school ID number), 
                and upload a clear photo of your school ID. You'll receive a verification email - click the link to verify your account.
              </p>
            </div>

            {/* FAQ 2 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span className="flex-shrink-0 w-8 h-8 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center font-bold">2</span>
                What's the difference between Total Users and Active Users?
              </h3>
              <p className="text-gray-600 ml-10">
                <strong>Total Users</strong> includes everyone who registered. <strong>Active Users</strong> are those who have 
                verified their email AND had their school ID approved by admins. Only active users can access all forum features.
              </p>
            </div>

            {/* FAQ 3 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span className="flex-shrink-0 w-8 h-8 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center font-bold">3</span>
                How long does admin approval take?
              </h3>
              <p className="text-gray-600 ml-10">
                After verifying your email, admins will review your school ID within 24-48 hours. You'll receive a notification 
                once approved. While waiting, you can access the General Discussion forum.
              </p>
            </div>

            {/* FAQ 4 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span className="flex-shrink-0 w-8 h-8 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center font-bold">4</span>
                What forums can I access?
              </h3>
              <p className="text-gray-600 ml-10">
                <strong>General Discussion:</strong> Available to all verified users (email verified).<br/>
                <strong>Grade 11 Forum:</strong> Only for G11 students after admin approval.<br/>
                <strong>Grade 12 Forum:</strong> Only for G12 students after admin approval.<br/>
                Moderators and admins can access all forums.
              </p>
            </div>

            {/* FAQ 5 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span className="flex-shrink-0 w-8 h-8 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center font-bold">5</span>
                What are points and badges?
              </h3>
              <p className="text-gray-600 ml-10">
                You earn points by posting, replying, and being active in forums. Badges are awarded based on your activity:<br/>
                • <strong>Forum Active (25+ points):</strong> Unlocks Chat Box feature<br/>
                • <strong>Contributor (50+ points):</strong> Special privileges and recognition<br/>
                Points help you level up and unlock more features!
              </p>
            </div>

            {/* FAQ 6 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span className="flex-shrink-0 w-8 h-8 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center font-bold">6</span>
                What is the Chat Box?
              </h3>
              <p className="text-gray-600 ml-10">
                Chat Box is a real-time group chat feature unlocked when you earn the "Forum Active" badge (25+ points). 
                It's perfect for quick discussions, study groups, and connecting with classmates instantly.
              </p>
            </div>

            {/* FAQ 7 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span className="flex-shrink-0 w-8 h-8 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center font-bold">7</span>
                Can I send private messages?
              </h3>
              <p className="text-gray-600 ml-10">
                Yes! Once you're an active user, you can send direct messages to other members. Click on any user's profile 
                and select "Message" to start a private conversation.
              </p>
            </div>

            {/* FAQ 8 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span className="flex-shrink-0 w-8 h-8 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center font-bold">8</span>
                What if I forget my password?
              </h3>
              <p className="text-gray-600 ml-10">
                Click "Forgot Password" on the login page, enter your Gmail address, and you'll receive a password reset link. 
                The link is valid for 1 hour. Follow the instructions to create a new password.
              </p>
            </div>

            {/* FAQ 9 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span className="flex-shrink-0 w-8 h-8 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center font-bold">9</span>
                How do I change my avatar?
              </h3>
              <p className="text-gray-600 ml-10">
                Go to your Profile page and click "Edit Profile". You can choose from our collection of customizable avatars 
                with different styles, colors, and accessories. Your avatar will be visible to all community members.
              </p>
            </div>

            {/* FAQ 10 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span className="flex-shrink-0 w-8 h-8 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center font-bold">10</span>
                What are the community rules?
              </h3>
              <p className="text-gray-600 ml-10">
                • Be respectful to all members<br/>
                • No bullying, harassment, or hate speech<br/>
                • Keep discussions academic and appropriate<br/>
                • No spam or advertising<br/>
                • Protect your privacy - don't share personal contact info publicly<br/>
                Violations may result in warnings, suspension, or permanent ban.
              </p>
            </div>

            {/* FAQ 11 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span className="flex-shrink-0 w-8 h-8 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center font-bold">11</span>
                Who are the moderators and admins?
              </h3>
              <p className="text-gray-600 ml-10">
                Click on the "Moderators & Admins" box above to see our team. Admins manage the platform and approve new users. 
                Moderators help maintain a positive environment and can access all forums to ensure everyone follows the rules.
              </p>
            </div>

            {/* FAQ 12 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span className="flex-shrink-0 w-8 h-8 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center font-bold">12</span>
                Is my data safe?
              </h3>
              <p className="text-gray-600 ml-10">
                Yes! We use secure authentication, encrypted passwords, and only collect necessary information. Your school ID photo 
                is only visible to admins for verification. We never share your data with third parties.
              </p>
            </div>
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray-600 mb-4">Still have questions?</p>
            <Link
              to="/register"
              className="inline-flex items-center px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
            >
              Join now and ask the community!
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-emerald-600 py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Join Our Community?
          </h2>
          <p className="text-xl text-emerald-100 mb-8">
            Connect with fellow students, share knowledge, and excel together.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-medium rounded-md text-emerald-600 bg-white hover:bg-emerald-50 transition-colors shadow-lg"
            >
              Get Started
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center">
            <div className="flex items-center mb-4">
              <AcademicCapIcon className="h-8 w-8 text-emerald-400" />
              <span className="ml-2 text-xl font-bold">School Forum</span>
            </div>
            <div className="text-center text-gray-400 text-sm">
              © 2025 School Forum. Made for Grades 11 & 12 students.
            </div>
          </div>
        </div>
      </footer>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">{getModalTitle()}</h2>
              <button
                onClick={() => setShowModal(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              {renderModalContent()}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between p-6 border-t">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeftIcon className="h-5 w-5 mr-1" />
                  Previous
                </button>
                <span className="text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                  <ChevronRightIcon className="h-5 w-5 ml-1" />
                </button>
              </div>
            )}

            <div className="p-6 bg-gray-50 border-t text-center">
              <button
                onClick={handleGuestAction}
                className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
              >
                Sign up to interact with the community
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GuestDashboard;
