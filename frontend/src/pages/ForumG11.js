import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChatBubbleLeftIcon, PlusIcon, EyeIcon } from '@heroicons/react/24/outline';
import CreateThreadModal from '../components/Forum/CreateThreadModal';
import UserProfileCard from '../components/Forum/UserProfileCard';
import SearchBar from '../components/Forum/SearchBar';
import PrefixBadge from '../components/Forum/PrefixBadge';
import Avatar from '../components/Profile/Avatar';
import { forumAPI } from '../services/api';
import { removeKeycapEmojis } from '../utils/removeKeycapEmojis';

const ForumG11 = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [allPosts, setAllPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(null);
  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await forumAPI.getPosts('g11');
      const fetchedPosts = response.data.posts || [];
      setAllPosts(fetchedPosts);
      setPosts(fetchedPosts);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setLoading(false);
      // If 403 error, show 404 instead (hide forum existence)
      if (error.response?.status === 403) {
        navigate('/404', { replace: true });
      }
    }
  };

  const handleSearch = (prefix) => {
    if (!prefix) {
      setPosts(allPosts);
    } else {
      const filtered = allPosts.filter(post => post.prefix === prefix);
      setPosts(filtered);
    }
  };

  const handleThreadCreated = () => {
    fetchPosts();
  };

  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Grade 11 Forum</h1>
          <p className="text-gray-600">Discussion forum for Grade 11 students</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-700 transition"
        >
          <PlusIcon className="h-5 w-5" />
          Create Thread
        </button>
      </div>

      {/* Search Bar */}
      <SearchBar onSearch={handleSearch} />

      <div className="space-y-4">
        {posts.map(post => {
          const getBorderColor = () => {
            switch(post.prefix) {
              case 'question': return 'border-l-4 border-blue-500 bg-blue-50';
              case 'tutorial': return 'border-l-4 border-green-500 bg-green-50';
              case 'unlock-request': return 'border-l-4 border-purple-500 bg-purple-50';
              case 'announcement': return 'border-l-4 border-red-500 bg-red-50';
              case 'food': return 'border-l-4 border-orange-500 bg-orange-50';
              case 'lost-found': return 'border-l-4 border-yellow-500 bg-yellow-50';
              default: return '';
            }
          };
          
          return (
          <div key={post.id} className={`bg-white rounded-lg shadow hover:shadow-md transition ${getBorderColor()}`}>
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    {post.isPinned === 1 && (
                      <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded">
                        Pinned
                      </span>
                    )}
                    {post.isLocked === 1 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded">
                        Locked
                      </span>
                    )}
                    <PrefixBadge prefix={post.prefix} />
                  </div>
                  
                  <Link 
                    to={`/forum/general/thread/${post.id}`}
                    className="text-xl font-semibold text-gray-900 hover:text-emerald-600 transition block mb-4"
                  >
                    {removeKeycapEmojis(post.title)}
                  </Link>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-2">
                      <Avatar avatarId={post.authorAvatarId} size="sm" />
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          setShowUserProfile(post.authorId);
                        }}
                        className="font-medium text-emerald-600 hover:text-emerald-700 hover:underline transition"
                      >
                        {post.authorFirstName} {post.authorLastName}
                      </button>
                      {post.authorRole === 'admin' && (
                        <span className="ml-1 px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded">Admin</span>
                      )}
                      {post.authorRole === 'moderator' && (
                        <span className="ml-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">Mod</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <ChatBubbleLeftIcon className="h-4 w-4" />
                      <span>{post.replyCount} {post.replyCount === 1 ? 'reply' : 'replies'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <EyeIcon className="h-4 w-4" />
                      <span>{post.viewCount} views</span>
                    </div>
                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          );
        })}

        {posts.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <ChatBubbleLeftIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No posts yet</h3>
            <p className="mt-1 text-sm text-gray-500">Be the first to start a discussion!</p>
          </div>
        )}
      </div>

      <CreateThreadModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        forumType="g11"
        onThreadCreated={handleThreadCreated}
      />

      {showUserProfile && (
        <UserProfileCard
          userId={showUserProfile}
          onClose={() => setShowUserProfile(null)}
        />
      )}
    </div>
  );
};

export default ForumG11;