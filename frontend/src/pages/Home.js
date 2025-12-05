import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import UserProfileCard from '../components/Forum/UserProfileCard';
import {
  AcademicCapIcon,
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  StarIcon
} from '@heroicons/react/24/outline';

const Dashboard = () => {
  const { isAuthenticated, user } = useAuth();
  const [stats, setStats] = React.useState({
    activeUsers: 0,
    totalRegistered: 0,
    lastPost: null,
    newestUser: null,
    weeklyPosts: { general: 0, g11: 0, g12: 0 },
    userStats: null
  });
  const [showUserProfile, setShowUserProfile] = React.useState(null);

  React.useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = {};
      
      // Only add Authorization header if token exists
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      // Add timestamp to prevent caching
      const response = await fetch(`http://localhost:5000/api/auth/dashboard-stats?t=${Date.now()}`, {
        headers,
        cache: 'no-cache'
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Dashboard stats:', data);
        setStats(data);
      } else {
        console.error('Failed to fetch stats:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  const features = [
    {
      name: 'Grade-Specific Forums',
      description: 'Separate discussion areas for Grade 11 and Grade 12 students with moderated content.',
      icon: AcademicCapIcon,
      color: 'text-emerald-600'
    },
    {
      name: 'Secure Registration',
      description: 'Gmail-only registration with school ID verification to ensure authentic student community.',
      icon: ShieldCheckIcon,
      color: 'text-green-600'
    },
    {
      name: 'Academic Discussions',
      description: 'Share study materials, form study groups, and collaborate on academic projects.',
      icon: DocumentTextIcon,
      color: 'text-blue-600'
    },
    {
      name: 'Peer Connection',
      description: 'Connect with classmates, share experiences, and build lasting friendships.',
      icon: UserGroupIcon,
      color: 'text-purple-600'
    },
    {
      name: 'Moderated Environment',
      description: 'Safe and supervised platform with dedicated moderators ensuring positive interactions.',
      icon: ChatBubbleLeftRightIcon,
      color: 'text-indigo-600'
    },
    {
      name: 'College Prep Support',
      description: 'Get advice on college applications, scholarships, and career guidance from peers and mentors.',
      icon: StarIcon,
      color: 'text-yellow-600'
    }
  ];

  const statsDisplay = [
    { 
      name: 'Total Users', 
      value: stats.userStats?.totalUsers || 0,
      color: 'text-emerald-600',
      icon: UserGroupIcon
    },
    { 
      name: 'Active Users', 
      value: stats.userStats?.activeUsers || 0,
      color: 'text-green-600',
      icon: ShieldCheckIcon
    },
    { 
      name: 'Posts This Week', 
      value: (stats.weeklyPosts?.general || 0) + (stats.weeklyPosts?.g11 || 0) + (stats.weeklyPosts?.g12 || 0),
      color: 'text-blue-600',
      icon: DocumentTextIcon
    },
    { 
      name: 'General Forum', 
      value: `${stats.weeklyPosts?.general || 0} posts`,
      color: 'text-purple-600',
      icon: ChatBubbleLeftRightIcon
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="sm:text-center lg:text-left">
                <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                  <span className="block xl:inline">Connect with</span>{' '}
                  <span className="block text-emerald-600 xl:inline">fellow students</span>
                </h1>
                <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  Join our exclusive school forum for Grades 11 & 12. Share knowledge, form study groups, 
                  and prepare for your future together in a safe, moderated environment.
                </p>
                
                {!isAuthenticated ? (
                  <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                    <div className="rounded-md shadow">
                      <Link
                        to="/register"
                        className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 md:py-4 md:text-lg md:px-10 transition-colors"
                      >
                        Join Now
                      </Link>
                    </div>
                    <div className="mt-3 sm:mt-0 sm:ml-3">
                      <Link
                        to="/login"
                        className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-emerald-700 bg-emerald-100 hover:bg-emerald-200 md:py-4 md:text-lg md:px-10 transition-colors"
                      >
                        Sign In
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="mt-5 sm:mt-8">
                    <div className="rounded-md shadow">
                      <Link
                        to="/"
                        className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 md:py-4 md:text-lg md:px-10 transition-colors"
                      >
                        Go to Dashboard
                      </Link>
                    </div>
                    <p className="mt-3 text-sm text-gray-600">
                      Welcome back, {user?.firstName}! Ready to continue your discussions?
                    </p>
                  </div>
                )}
              </div>
            </main>
          </div>
        </div>
        
        {/* Hero Image/Illustration */}
        <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
          <div className="h-56 w-full bg-gradient-emerald sm:h-72 md:h-96 lg:w-full lg:h-full flex items-center justify-center">
            <div className="text-center text-white">
              <AcademicCapIcon className="mx-auto h-24 w-24 opacity-80" />
              <h3 className="mt-4 text-2xl font-bold">Academic Excellence</h3>
              <p className="mt-2 text-lg opacity-90">Together We Achieve More</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Our Growing Community
            </h2>
            <p className="mt-4 text-lg text-gray-500">
              Join thousands of students making a difference together
            </p>
          </div>
          <dl className="mt-10 grid grid-cols-2 gap-5 sm:grid-cols-4">
            {statsDisplay.map((stat) => (
              <div key={stat.name} className="bg-white overflow-hidden shadow-lg rounded-lg hover:shadow-xl transition-shadow">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {stat.name}
                      </dt>
                      <dd className={`mt-1 text-3xl font-bold ${stat.color}`}>
                        {stat.value}
                      </dd>
                    </div>
                    {stat.icon && (
                      <div className={`ml-3 ${stat.color} opacity-20`}>
                        <stat.icon className="h-12 w-12" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </dl>
          
          {/* Latest Activity */}
          {(stats.lastPost || stats.newestUser) && (
            <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Latest Post */}
              {stats.lastPost && (
                <div className="bg-white shadow-lg rounded-lg p-6 hover:shadow-xl transition-shadow">
                  <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <DocumentTextIcon className="h-5 w-5 text-emerald-600" />
                    Latest Post
                  </h3>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="font-semibold text-gray-900 mb-2">{stats.lastPost.title}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span>By {stats.lastPost.authorFirstName} {stats.lastPost.authorLastName}</span>
                      <span>•</span>
                      <span>{new Date(stats.lastPost.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Newest User */}
              {stats.newestUser && (
                <div className="bg-white shadow-lg rounded-lg p-6 hover:shadow-xl transition-shadow">
                  <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <UserGroupIcon className="h-5 w-5 text-emerald-600" />
                    Newest Member
                  </h3>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <button
                      onClick={() => setShowUserProfile(stats.newestUser.id)}
                      className="font-semibold text-emerald-600 hover:text-emerald-700 mb-1"
                    >
                      {stats.newestUser.firstName} {stats.newestUser.lastName}
                    </button>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-xs">
                        {stats.newestUser.yearLevel}
                      </span>
                      <span>•</span>
                      <span>Joined {new Date(stats.newestUser.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Features Section */}
        <div className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-base text-emerald-600 font-semibold tracking-wide uppercase">
                Features
              </h2>
              <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                Everything you need for academic success
              </p>
              <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
                Our platform provides a comprehensive suite of tools designed specifically for high school students.
              </p>
            </div>

            <div className="mt-16">
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {features.map((feature) => (
                  <div key={feature.name} className="relative">
                    <div className="card h-full transition duration-300 transform hover:scale-[1.03] hover:-translate-y-1 hover:shadow-xl">
                      <div className="card-body">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <feature.icon className={`h-8 w-8 ${feature.color}`} />
                          </div>
                          <div className="ml-4">
                            <h3 className="text-lg font-medium text-gray-900">
                              {feature.name}
                            </h3>
                          </div>
                        </div>
                        <p className="mt-4 text-gray-500">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>


      {/* CTA Section */}
      <div className="bg-emerald-600">
        <div className="max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            <span className="block">Ready to join our community?</span>
            <span className="block text-emerald-200"></span>
          </h2>
          <p className="mt-4 text-lg leading-6 text-emerald-200">
            Connect with fellow students, share knowledge, and excel together in a supportive academic environment.
          </p>
          {!isAuthenticated ? (
            <Link
              to="/register"
              className="mt-8 w-full inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-emerald-600 bg-white hover:bg-emerald-50 sm:w-auto transition-colors"
            >
              Get Started Now
            </Link>
          ) : (
            <Link
              to="/app/forum/general"
              className="mt-8 w-full inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-emerald-600 bg-white hover:bg-emerald-50 sm:w-auto transition-colors"
            >
              Visit Forums
            </Link>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white">
        <div className="max-w-7xl mx-auto py-12 px-4 overflow-hidden sm:px-6 lg:px-8">
          <div className="flex justify-center space-x-6">
            <Link to="/login" className="text-gray-500 hover:text-gray-900">
              Login
            </Link>
            <Link to="/register" className="text-gray-500 hover:text-gray-900">
              Register
            </Link>
            {isAuthenticated && (
              <>
                <Link to="/app" className="text-gray-500 hover:text-gray-900">
                  Dashboard
                </Link>
                <Link to="/app/forum/general" className="text-gray-500 hover:text-gray-900">
                  Forums
                </Link>
              </>
            )}
          </div>
          <p className="mt-8 text-center text-base text-gray-400">
            &copy; 2025 School Forum. Made with FEPC Student for Grades 11 & 12 students.
          </p>
        </div>
      </footer>

      {/* User Profile Card Modal */}
      {showUserProfile && (
        <UserProfileCard
          userId={showUserProfile}
          onClose={() => setShowUserProfile(null)}
        />
      )}
    </div>
  );
};

export default Dashboard;