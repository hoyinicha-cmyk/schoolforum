import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  EnvelopeIcon, 
  AcademicCapIcon,
  CalendarIcon,
  ChatBubbleLeftIcon,
  HeartIcon,
  UserPlusIcon,
  UserMinusIcon,
  UsersIcon
} from '@heroicons/react/24/outline';
import Avatar from '../components/Profile/Avatar';
import { getApiBaseUrl } from '../utils/apiUrl';

const UserProfile = () => {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    postsCount: 0,
    repliesCount: 0,
    reactionsReceived: 0
  });
  const [followStats, setFollowStats] = useState({
    followers: 0,
    following: 0
  });
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const isOwnProfile = currentUser.id === parseInt(userId);

  useEffect(() => {
    fetchUserProfile();
    fetchUserStats();
    fetchFollowStats();
    if (!isOwnProfile) {
      checkIfFollowing();
    }
  }, [userId]);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/auth/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStats = async () => {
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/auth/user-stats/${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchFollowStats = async () => {
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/follows/stats/${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setFollowStats(data);
      }
    } catch (error) {
      console.error('Error fetching follow stats:', error);
    }
  };

  const checkIfFollowing = async () => {
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/follows/is-following/${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setIsFollowing(data.isFollowing);
      }
    } catch (error) {
      console.error('Error checking follow status:', error);
    }
  };

  const handleFollow = async () => {
    setFollowLoading(true);
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/follows/follow/${userId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        setIsFollowing(true);
        setFollowStats(prev => ({ ...prev, followers: prev.followers + 1 }));
      }
    } catch (error) {
      console.error('Error following user:', error);
    } finally {
      setFollowLoading(false);
    }
  };

  const handleUnfollow = async () => {
    setFollowLoading(true);
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/follows/unfollow/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        setIsFollowing(false);
        setFollowStats(prev => ({ ...prev, followers: prev.followers - 1 }));
      }
    } catch (error) {
      console.error('Error unfollowing user:', error);
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-600">User not found</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6">
        {/* Profile Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <Avatar avatarId={user.avatarId} size="xl" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {user.firstName} {user.lastName}
              </h2>
              <p className="text-gray-600">
                {user.role === 'admin' ? 'Student Admin' : user.role === 'moderator' ? 'Student Moderator' : 'Student'}
              </p>
            </div>
          </div>
          
          {!isOwnProfile && (
            <button
              onClick={isFollowing ? handleUnfollow : handleFollow}
              disabled={followLoading}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg transition ${
                isFollowing
                  ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  : 'bg-emerald-600 text-white hover:bg-emerald-700'
              } disabled:opacity-50`}
            >
              {isFollowing ? (
                <>
                  <UserMinusIcon className="h-5 w-5" />
                  Unfollow
                </>
              ) : (
                <>
                  <UserPlusIcon className="h-5 w-5" />
                  Follow
                </>
              )}
            </button>
          )}
        </div>

        {/* Profile Info */}
        <div className="space-y-3 mb-6">
          {user.year_level && (
            <div className="flex items-center gap-3 text-gray-700">
              <AcademicCapIcon className="h-5 w-5 text-gray-400" />
              <span>Grade {user.year_level}</span>
            </div>
          )}

          <div className="flex items-center gap-3 text-gray-700">
            <CalendarIcon className="h-5 w-5 text-gray-400" />
            <span>Joined {new Date(user.created_at || Date.now()).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-4 bg-emerald-50 rounded-lg">
            <ChatBubbleLeftIcon className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{stats.postsCount}</div>
            <div className="text-sm text-gray-600">Posts</div>
          </div>
          
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <ChatBubbleLeftIcon className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{stats.repliesCount}</div>
            <div className="text-sm text-gray-600">Replies</div>
          </div>
          
          <div className="text-center p-4 bg-pink-50 rounded-lg">
            <HeartIcon className="h-8 w-8 text-pink-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{stats.reactionsReceived}</div>
            <div className="text-sm text-gray-600">Reactions</div>
          </div>
          
          <div className="text-center p-4 bg-indigo-50 rounded-lg">
            <UsersIcon className="h-8 w-8 text-indigo-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{followStats.followers}</div>
            <div className="text-sm text-gray-600">Followers</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
