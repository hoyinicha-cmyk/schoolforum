import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ChatBubbleLeftIcon, 
  UserGroupIcon,
  AcademicCapIcon,
  ChartBarIcon,
  UserPlusIcon,
  DocumentTextIcon,
  UsersIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { getApiBaseUrl } from '../utils/apiUrl';
import UserProfileCard from '../components/Forum/UserProfileCard';
import Avatar from '../components/Profile/Avatar';
import { canAccessChat } from '../utils/contributorCheck';

const StudentDashboard = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showUserProfile, setShowUserProfile] = useState(null);
  const [showUsersModal, setShowUsersModal] = useState(null);
  const [usersModalData, setUsersModalData] = useState([]);
  
  // Check if user has access to grade-specific forums
  // User has access if they are active and have a year level
  const hasGradeAccess = user.status === 'active' && (user.yearLevel === 'G11' || user.yearLevel === 'G12');

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/auth/dashboard-stats`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('📊 Dashboard stats:', data);
        setStats(data);
      } else {
        console.error('Failed to fetch stats:', response.status);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusClick = async (status, title) => {
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/auth/users-by-status/${status}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsersModalData(data.users);
        setShowUsersModal(title);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user.firstName}! 👋
        </h1>
        <p className="text-gray-600 mt-2">Here's what's happening in the community</p>
      </div>

      {/* Statistics Section */}
      {stats && stats.weeklyPosts && stats.userStats && (
        <div className="mb-8">
          {/* Weekly Posts Stats */}
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <ChartBarIcon className="h-6 w-6 text-emerald-600" />
              Posts This Week
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">General Forum</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.weeklyPosts.general}</p>
                  </div>
                  <div className="bg-blue-100 rounded-full p-3">
                    <UserGroupIcon className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Grade 11 Forum</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.weeklyPosts.g11}</p>
                  </div>
                  <div className="bg-purple-100 rounded-full p-3">
                    <AcademicCapIcon className="h-8 w-8 text-purple-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6 border-l-4 border-orange-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Grade 12 Forum</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.weeklyPosts.g12}</p>
                  </div>
                  <div className="bg-orange-100 rounded-full p-3">
                    <AcademicCapIcon className="h-8 w-8 text-orange-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Community Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <button
              onClick={() => handleStatusClick('active', 'All Users')}
              className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition cursor-pointer w-full text-left"
            >
              <div className="flex items-center gap-3">
                <div className="bg-emerald-100 rounded-full p-2">
                  <UsersIcon className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.userStats.totalUsers}</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => handleStatusClick('active', 'Active Users')}
              className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition cursor-pointer w-full text-left"
            >
              <div className="flex items-center gap-3">
                <div className="bg-green-100 rounded-full p-2">
                  <UsersIcon className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-600">Active Users</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.userStats.activeUsers}</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => handleStatusClick('pending', 'Pending Users')}
              className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition cursor-pointer w-full text-left"
            >
              <div className="flex items-center gap-3">
                <div className="bg-yellow-100 rounded-full p-2">
                  <ClockIcon className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.userStats.pendingUsers}</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => handleStatusClick('suspended', 'Suspended/Banned Users')}
              className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition cursor-pointer w-full text-left"
            >
              <div className="flex items-center gap-3">
                <div className="bg-red-100 rounded-full p-2">
                  <UsersIcon className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-600">Suspended/Banned</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.userStats.suspendedUsers + stats.userStats.bannedUsers}
                  </p>
                </div>
              </div>
            </button>
          </div>

          {/* Latest Activity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Latest Post */}
            {stats.latestPost && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <DocumentTextIcon className="h-5 w-5 text-emerald-600" />
                  Latest Post
                </h3>
                <Link
                  to={`/forum/${stats.latestPost.forumType}/thread/${stats.latestPost.id}`}
                  className="block p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition"
                >
                  <p className="font-semibold text-gray-900 mb-2">{stats.latestPost.title}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>By {stats.latestPost.authorFirstName} {stats.latestPost.authorLastName}</span>
                    <span>•</span>
                    <span>{new Date(stats.latestPost.createdAt).toLocaleString()}</span>
                  </div>
                  <div className="mt-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      stats.latestPost.forumType === 'general' ? 'bg-blue-100 text-blue-700' :
                      stats.latestPost.forumType === 'g11' ? 'bg-purple-100 text-purple-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {stats.latestPost.forumType === 'general' ? 'General Forum' :
                       stats.latestPost.forumType === 'g11' ? 'Grade 11 Forum' : 'Grade 12 Forum'}
                    </span>
                  </div>
                </Link>
              </div>
            )}

            {/* Newest User */}
            {stats.newestUser && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <UserPlusIcon className="h-5 w-5 text-emerald-600" />
                  Newest Member
                </h3>
                <div className="p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition cursor-pointer">
                  <button
                    onClick={() => setShowUserProfile(stats.newestUser.id)}
                    className="w-full text-left"
                  >
                    <p className="font-semibold text-emerald-600 hover:text-emerald-700 mb-1">
                      {stats.newestUser.firstName} {stats.newestUser.lastName}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-xs">
                        {stats.newestUser.yearLevel}
                      </span>
                      <span>•</span>
                      <span>Joined {new Date(stats.newestUser.createdAt).toLocaleDateString()}</span>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className={`grid grid-cols-1 ${hasGradeAccess && canAccessChat(user) ? 'lg:grid-cols-3' : canAccessChat(user) || hasGradeAccess ? 'lg:grid-cols-2' : 'lg:grid-cols-1'} gap-6 mb-8`}>
        {canAccessChat(user) && (
          <Link
            to="/chatbox"
            className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg shadow-lg p-6 text-white hover:shadow-xl transition transform hover:scale-105"
          >
            <div className="flex items-center gap-4">
              <div className="bg-white/20 rounded-full p-3">
                <ChatBubbleLeftIcon className="h-8 w-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Student Chat</h3>
                <p className="text-emerald-100 text-sm">Connect with classmates</p>
              </div>
            </div>
          </Link>
        )}

        <Link
          to="/forum/general"
          className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-lg p-6 text-white hover:shadow-xl transition transform hover:scale-105"
        >
          <div className="flex items-center gap-4">
            <div className="bg-white/20 rounded-full p-3">
              <UserGroupIcon className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold">General Forum</h3>
              <p className="text-blue-100 text-sm">Join discussions</p>
            </div>
          </div>
        </Link>

        {/* Grade-Specific Forum - Only show if user has access */}
        {hasGradeAccess && (
          <Link
            to={`/forum/${user.yearLevel?.toLowerCase()}`}
            className={`bg-gradient-to-br ${
              user.yearLevel === 'G11' 
                ? 'from-purple-500 to-pink-600' 
                : 'from-orange-500 to-red-600'
            } rounded-lg shadow-lg p-6 text-white hover:shadow-xl transition transform hover:scale-105`}
          >
            <div className="flex items-center gap-4">
              <div className="bg-white/20 rounded-full p-3">
                <AcademicCapIcon className="h-8 w-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold">{user.yearLevel} Forum</h3>
                <p className={`text-sm ${
                  user.yearLevel === 'G11' ? 'text-purple-100' : 'text-orange-100'
                }`}>
                  Grade-specific discussions
                </p>
              </div>
            </div>
          </Link>
        )}
      </div>

      {/* User Profile Modal */}
      {showUserProfile && (
        <UserProfileCard
          userId={showUserProfile}
          onClose={() => setShowUserProfile(null)}
        />
      )}

      {/* Users List Modal */}
      {showUsersModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">{showUsersModal}</h2>
              <button
                onClick={() => setShowUsersModal(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {usersModalData.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No users found</p>
              ) : (
                <div className="space-y-3">
                  {usersModalData.map(u => (
                    <button
                      key={u.id}
                      onClick={() => {
                        setShowUserProfile(u.id);
                        setShowUsersModal(null);
                      }}
                      className="w-full p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition text-left flex items-center gap-4"
                    >
                      {/* Avatar */}
                      <div className="flex-shrink-0">
                        <Avatar avatarId={u.avatarId} size="lg" />
                      </div>
                      
                      {/* User Info */}
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 text-lg">
                          {u.firstName} {u.lastName}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded font-medium">
                            {u.yearLevel}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded font-medium ${
                            u.status === 'active' ? 'bg-green-100 text-green-700' :
                            u.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                            u.status === 'suspended' ? 'bg-orange-100 text-orange-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {u.status}
                          </span>
                          {u.role !== 'student' && (
                            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded font-medium">
                              {u.role}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Joined {new Date(u.createdAt).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
