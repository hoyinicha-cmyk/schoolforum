import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  XMarkIcon,
  CalendarIcon,
  ChatBubbleLeftIcon,
  HeartIcon,
  UserPlusIcon,
  UserMinusIcon,
  PaperAirplaneIcon,
  AcademicCapIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import Avatar from '../Profile/Avatar';
import { getApiBaseUrl } from '../../utils/apiUrl';

const UserProfileCard = ({ userId, onClose }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    postsCount: 0,
    repliesCount: 0,
    reactionsReceived: 0
  });
  const [note, setNote] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const isOwnProfile = parseInt(currentUser.id) === parseInt(userId);

  useEffect(() => {
    console.log('🔍 UserProfileCard Debug:');
    console.log('Current User from localStorage:', currentUser);
    console.log('Current User ID:', currentUser.id, 'Type:', typeof currentUser.id);
    console.log('Profile User ID (prop):', userId, 'Type:', typeof userId);
    console.log('Parsed Current User ID:', parseInt(currentUser.id), 'Type:', typeof parseInt(currentUser.id));
    console.log('Parsed Profile User ID:', parseInt(userId), 'Type:', typeof parseInt(userId));
    console.log('NEW Comparison:', parseInt(currentUser.id), '===', parseInt(userId), '=', parseInt(currentUser.id) === parseInt(userId));
    console.log('Is Own Profile:', isOwnProfile);
    
    fetchUserData();
  }, [userId]);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      console.log('Fetching user profile for userId:', userId);
      
      // Fetch user info
      const userResponse = await fetch(`${getApiBaseUrl()}/api/auth/user/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      console.log('User response status:', userResponse.status);
      
      if (userResponse.ok) {
        const userData = await userResponse.json();
        console.log('User data:', userData);
        setUser(userData.user);
      } else {
        const errorData = await userResponse.json();
        console.error('Error fetching user:', errorData);
      }

      // Fetch stats
      const statsResponse = await fetch(`${getApiBaseUrl()}/api/auth/user-stats/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData.stats);
      }

      // Check if following
      if (!isOwnProfile) {
        const followResponse = await fetch(`${getApiBaseUrl()}/api/follows/is-following/${userId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (followResponse.ok) {
          const followData = await followResponse.json();
          setIsFollowing(followData.isFollowing);
        }
      }

      // Fetch profile note
      const noteResponse = await fetch(`${getApiBaseUrl()}/api/contributor/profile-note/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (noteResponse.ok) {
        const noteData = await noteResponse.json();
        setNote(noteData.note);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTimeRemaining = (expiresAt) => {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diff = expires - now;
    
    if (diff <= 0) return 'Expired';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m remaining`;
    }
    return `${minutes}m remaining`;
  };

  const handleFollow = async () => {
    console.log('🔵 Attempting to follow user:', userId);
    setFollowLoading(true);
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/follows/follow/${userId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      console.log('Follow response status:', response.status);
      const data = await response.json();
      console.log('Follow response data:', data);
      
      if (response.ok) {
        setIsFollowing(true);
        console.log('✅ Successfully followed user');
      } else {
        console.error('❌ Failed to follow:', data);
      }
    } catch (error) {
      console.error('Error following user:', error);
    } finally {
      setFollowLoading(false);
    }
  };

  const handleUnfollow = async () => {
    console.log('🔴 Attempting to unfollow user:', userId);
    setFollowLoading(true);
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/follows/unfollow/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      console.log('Unfollow response status:', response.status);
      const data = await response.json();
      console.log('Unfollow response data:', data);
      
      if (response.ok) {
        setIsFollowing(false);
        console.log('✅ Successfully unfollowed user');
      } else {
        console.error('❌ Failed to unfollow:', data);
      }
    } catch (error) {
      console.error('Error unfollowing user:', error);
    } finally {
      setFollowLoading(false);
    }
  };

  const handleSendMessage = () => {
    // Navigate to chat with this user
    navigate(`/messages/${userId}`);
    onClose();
  };

  const handleViewFullProfile = () => {
    navigate(`/user/${userId}`);
    onClose();
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
        <div className="bg-white rounded-lg p-8" onClick={(e) => e.stopPropagation()}>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const getRoleBadge = (role) => {
    const badges = {
      admin: { bg: 'bg-red-100', text: 'text-red-700', label: 'Student Admin' },
      moderator: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Student Moderator' },
      student: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Student' }
    };
    
    const badge = badges[role] || badges.student;
    
    return (
      <span className={`px-2 py-1 ${badge.bg} ${badge.text} text-xs font-medium rounded-full`}>
        {badge.label}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        {/* Header with close button */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">User Profile</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Profile Content */}
        <div className="p-6">
          {/* Avatar and Name */}
          <div className="flex items-center gap-4 mb-4">
            <Avatar avatarId={user.avatarId} size="xl" />
            <div className="flex-1">
              <h4 className="text-xl font-bold text-gray-900">
                {user.firstName} {user.lastName}
              </h4>
              <div className="mt-2">
                {getRoleBadge(user.role)}
              </div>
            </div>
          </div>

          {/* User Info */}
          <div className="space-y-3 mb-4 mt-4">
            {user.year_level && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <AcademicCapIcon className="h-4 w-4" />
                <span className="font-medium">Grade {user.year_level}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <CalendarIcon className="h-4 w-4" />
              <span>Joined {new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
            </div>
          </div>

          {/* Profile Note */}
          {note && (
            <div className="mb-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-3 border border-purple-200">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-semibold text-purple-700">📝 Profile Note</span>
              </div>
              <p className="text-sm text-gray-800 mb-2">{note.content}</p>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <ClockIcon className="h-3 w-3" />
                {getTimeRemaining(note.expires_at)}
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="text-center p-3 bg-emerald-50 rounded-lg">
              <ChatBubbleLeftIcon className="h-5 w-5 text-emerald-600 mx-auto mb-1" />
              <div className="text-lg font-bold text-gray-900">{stats.postsCount}</div>
              <div className="text-xs text-gray-600">Posts</div>
            </div>
            
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <ChatBubbleLeftIcon className="h-5 w-5 text-blue-600 mx-auto mb-1" />
              <div className="text-lg font-bold text-gray-900">{stats.repliesCount}</div>
              <div className="text-xs text-gray-600">Replies</div>
            </div>
            
            <div className="text-center p-3 bg-pink-50 rounded-lg">
              <HeartIcon className="h-5 w-5 text-pink-600 mx-auto mb-1" />
              <div className="text-lg font-bold text-gray-900">{stats.reactionsReceived}</div>
              <div className="text-xs text-gray-600">Reactions</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            {!isOwnProfile && (
              <>
                <button
                  onClick={isFollowing ? handleUnfollow : handleFollow}
                  disabled={followLoading}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition ${
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

                <button
                  onClick={handleSendMessage}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  <PaperAirplaneIcon className="h-5 w-5" />
                  Send Message
                </button>
              </>
            )}

            <button
              onClick={handleViewFullProfile}
              className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
            >
              View Full Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfileCard;
