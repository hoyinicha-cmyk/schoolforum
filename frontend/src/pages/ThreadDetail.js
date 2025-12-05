import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ChatBubbleLeftIcon, 
  UserIcon, 
  EyeIcon, 
  ArrowLeftIcon,
  PaperAirplaneIcon,
  PencilIcon,
  TrashIcon,
  EllipsisVerticalIcon,
  LockClosedIcon,
  LockOpenIcon
} from '@heroicons/react/24/outline';
import { MapPinIcon } from '@heroicons/react/24/solid';
import ReactionButton from '../components/Forum/ReactionButton';
import BookmarkButton from '../components/Forum/BookmarkButton';
import PrefixBadge from '../components/Forum/PrefixBadge';
import HiddenContent from '../components/Forum/HiddenContent';
import UserProfileCard from '../components/Forum/UserProfileCard';
import HideContentHelper from '../components/Forum/HideContentHelper';
import Avatar from '../components/Profile/Avatar';
import { forumAPI } from '../services/api';
import { removeKeycapEmojis } from '../utils/removeKeycapEmojis';
import { parseHideContent } from '../utils/hideContentParser';
import { hasContributorPrivileges, hasModeratorPrivileges, canLockThreads } from '../utils/contributorCheck';
import '../components/Forum/HideContentStyles.css';

// Move ReplyItem outside to prevent re-creation on every render
const ReplyItem = ({ 
  reply, 
  depth = 0, 
  editingReply, 
  editReplyContent, 
  setEditReplyContent, 
  setEditingReply,
  handleEditReply,
  handleDeleteReply,
  canEditDelete,
  startEditReply,
  setReplyingTo,
  setShowUserProfile,
  fetchThread,
  replies,
  removeKeycapEmojis,
  moderatorOverride,
  currentUser
}) => {
  const maxDepth = 5;
  const isNested = depth > 0;
  const canNestMore = depth < maxDepth;

  return (
    <div className={`${isNested ? 'ml-8 mt-4' : 'mt-4'}`}>
      <div className={`bg-white rounded-lg p-4 shadow-sm ${isNested ? 'border-l-4 border-emerald-200 bg-emerald-50/30' : ''}`}>
        {/* Reply Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Avatar avatarId={reply.authorAvatarId} size="sm" />
            <button
              onClick={() => setShowUserProfile(reply.authorId)}
              className="font-medium text-emerald-600 hover:text-emerald-700 hover:underline transition"
            >
              {reply.authorFirstName} {reply.authorLastName}
            </button>
            {reply.authorRole === 'admin' && (
              <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded">Admin</span>
            )}
            {reply.authorRole === 'moderator' && (
              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">Mod</span>
            )}
            <span className="text-gray-400">•</span>
            <span>{new Date(reply.createdAt).toLocaleString()}</span>
          </div>
          
          {canEditDelete(reply.authorId) && (
            <div className="flex gap-2">
              <button
                onClick={() => startEditReply(reply)}
                className="text-gray-500 hover:text-emerald-600 transition"
              >
                <PencilIcon className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleDeleteReply(reply.id)}
                className="text-gray-500 hover:text-red-600 transition"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* Reply Content */}
        {editingReply === reply.id ? (
          <form onSubmit={(e) => { e.preventDefault(); handleEditReply(reply.id); }} className="mb-3">
            <textarea
              value={editReplyContent}
              onChange={(e) => setEditReplyContent(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
              rows="3"
              autoFocus
            />
            <div className="flex gap-2 mt-2">
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => { setEditingReply(null); setEditReplyContent(''); }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <>
            {reply.parentReplyId && (
              <div className="mb-2 p-2 bg-gray-100 rounded text-sm text-gray-600 italic">
                Replying to: {replies.find(r => r.id === reply.parentReplyId)?.authorFirstName || 'Unknown'}
              </div>
            )}
            <div 
              className="text-gray-700 whitespace-pre-wrap break-words mb-3" 
              style={{ overflowWrap: 'break-word', wordBreak: 'break-word' }}
              dangerouslySetInnerHTML={{ 
                __html: removeKeycapEmojis(
                  parseHideContent(
                    reply.content, 
                    currentUser.id, 
                    reply.authorId,
                    currentUser.firstName,
                    currentUser.role,
                    moderatorOverride
                  )
                )
              }}
            />
          </>
        )}

        {/* Reply Actions */}
        <div className="flex items-center gap-3">
          <ReactionButton
            replyId={reply.id}
            reactions={{
              likeCount: reply.likeCount,
              loveCount: reply.loveCount,
              hahaCount: reply.hahaCount,
              wowCount: reply.wowCount,
              sadCount: reply.sadCount,
              angryCount: reply.angryCount,
            }}
            userReaction={reply.userReaction}
            onReactionChange={fetchThread}
          />
          {canNestMore && (
            <button
              onClick={() => setReplyingTo(reply)}
              className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1"
            >
              <ChatBubbleLeftIcon className="h-4 w-4" />
              Reply
            </button>
          )}
        </div>
      </div>

      {/* Nested Replies */}
      {reply.children && reply.children.length > 0 && (
        <div className="mt-2">
          {reply.children.map(childReply => (
            <ReplyItem 
              key={childReply.id} 
              reply={childReply} 
              depth={depth + 1}
              editingReply={editingReply}
              editReplyContent={editReplyContent}
              setEditReplyContent={setEditReplyContent}
              setEditingReply={setEditingReply}
              handleEditReply={handleEditReply}
              handleDeleteReply={handleDeleteReply}
              canEditDelete={canEditDelete}
              startEditReply={startEditReply}
              setReplyingTo={setReplyingTo}
              setShowUserProfile={setShowUserProfile}
              fetchThread={fetchThread}
              replies={replies}
              removeKeycapEmojis={removeKeycapEmojis}
              moderatorOverride={moderatorOverride}
              currentUser={currentUser}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const ThreadDetail = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyContent, setReplyContent] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [editingPost, setEditingPost] = useState(false);
  const [editPostData, setEditPostData] = useState({ title: '', content: '', prefix: '' });
  const [editingReply, setEditingReply] = useState(null);
  const [editReplyContent, setEditReplyContent] = useState('');
  const [showUserProfile, setShowUserProfile] = useState(null);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [moderatorOverride, setModeratorOverride] = useState(false);
  const [currentUser, setCurrentUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
  const repliesEndRef = useRef(null);
  const optionsMenuRef = useRef(null);
  const isModerator = ['moderator', 'admin'].includes(currentUser.role);
  
  console.log('👤 Current user:', currentUser);

  // Fetch updated user data with badge
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setCurrentUser(data.user);
          // Update localStorage with badge
          localStorage.setItem('user', JSON.stringify(data.user));
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    
    fetchUserData();
  }, []);

  const fetchThread = useCallback(async () => {
    try {
      setLoading(true);
      const [postResponse, repliesResponse] = await Promise.all([
        forumAPI.getPost(postId),
        forumAPI.getReplies(postId)
      ]);
      
      setPost(postResponse.data.post);
      setReplies(repliesResponse.data.replies || []);
    } catch (error) {
      console.error('Error fetching thread:', error);
      // If 403 or 404, set post to null to show 404 page
      if (error.response?.status === 403 || error.response?.status === 404) {
        setPost(null);
      }
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    fetchThread();
  }, [fetchThread]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (optionsMenuRef.current && !optionsMenuRef.current.contains(event.target)) {
        setShowOptionsMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmitReply = async (e) => {
    e.preventDefault();
    if (!replyContent.trim()) return;

    try {
      await forumAPI.createReply(postId, {
        content: replyContent,
        parentReplyId: replyingTo?.id || null
      });
      
      setReplyContent('');
      setReplyingTo(null);
      await fetchThread();
      
      // Scroll to bottom after posting
      setTimeout(() => {
        repliesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (error) {
      console.error('Error posting reply:', error);
      alert('Failed to post reply');
    }
  };

  const handleEditPost = async (e) => {
    e.preventDefault();
    try {
      await forumAPI.updatePost(postId, {
        title: editPostData.title,
        content: editPostData.content,
        prefix: editPostData.prefix
      });
      setEditingPost(false);
      await fetchThread();
    } catch (error) {
      console.error('Error updating post:', error);
      alert('Failed to update post');
    }
  };

  const handleDeletePost = async () => {
    if (!window.confirm('Are you sure you want to delete this thread?')) return;
    
    try {
      await forumAPI.deletePost(postId);
      navigate(-1);
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post');
    }
  };

  const handleEditReply = async (replyId) => {
    try {
      await forumAPI.updateReply(replyId, { content: editReplyContent });
      setEditingReply(null);
      setEditReplyContent('');
      await fetchThread();
    } catch (error) {
      console.error('Error updating reply:', error);
      alert('Failed to update reply');
    }
  };

  const handleDeleteReply = async (replyId) => {
    if (!window.confirm('Are you sure you want to delete this reply?')) return;
    
    try {
      await forumAPI.deleteReply(replyId);
      await fetchThread();
    } catch (error) {
      console.error('Error deleting reply:', error);
      alert('Failed to delete reply');
    }
  };

  const canEditDelete = (authorId) => {
    return currentUser.id === authorId || 
           currentUser.role === 'admin' || 
           currentUser.role === 'moderator';
  };

  const startEditPost = () => {
    setEditPostData({ title: post.title, content: post.content, prefix: post.prefix || 'none' });
    setEditingPost(true);
    setShowOptionsMenu(false);
  };

  const handleToggleLock = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/contributor/thread/${postId}/lock`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to toggle lock');
      }
      
      setShowOptionsMenu(false);
      await fetchThread();
    } catch (error) {
      console.error('Error toggling lock:', error);
      alert(error.message || 'Failed to toggle lock');
    }
  };

  const handleTogglePin = async () => {
    try {
      await forumAPI.updatePost(postId, { isPinned: !post.isPinned });
      setShowOptionsMenu(false);
      await fetchThread();
    } catch (error) {
      console.error('Error toggling pin:', error);
      alert('Failed to toggle pin');
    }
  };

  const startEditReply = (reply) => {
    setEditingReply(reply.id);
    setEditReplyContent(reply.content);
  };

  // Build nested reply structure
  const buildReplyTree = (replies, parentId = null, depth = 0) => {
    return replies
      .filter(reply => reply.parentReplyId === parentId)
      .map(reply => ({
        ...reply,
        depth,
        children: buildReplyTree(replies, reply.id, depth + 1)
      }));
  };

  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-9xl font-bold text-emerald-600">404</h1>
          <h2 className="text-3xl font-semibold text-gray-900 mt-4">Thread Not Found</h2>
          <p className="text-gray-600 mt-2 mb-8">The thread you're looking for doesn't exist or has been deleted.</p>
          <button 
            onClick={() => navigate(-1)} 
            className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const replyTree = buildReplyTree(replies);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition"
      >
        <ArrowLeftIcon className="h-5 w-5" />
        Back to Forum
      </button>

      {/* Thread Post */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6 overflow-hidden">
        {/* Post Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
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
            
            {editingPost ? (
              <form onSubmit={handleEditPost} className="space-y-4">
                <input
                  type="text"
                  value={editPostData.title}
                  onChange={(e) => setEditPostData({ ...editPostData, title: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-xl font-semibold"
                  placeholder="Thread title"
                />
                <select
                  value={editPostData.prefix}
                  onChange={(e) => setEditPostData({ ...editPostData, prefix: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="none">No Prefix</option>
                  <option value="question">Question</option>
                  <option value="discussion">Discussion</option>
                  <option value="tutorial">Tutorial</option>
                  <option value="unlock-request">Unlock Request</option>
                  <option value="food">Food</option>
                  <option value="lost-found">Lost and Found</option>
                </select>
                <textarea
                  value={editPostData.content}
                  onChange={(e) => setEditPostData({ ...editPostData, content: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                  rows="6"
                  placeholder="Thread content"
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingPost(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h1 className="text-3xl font-bold text-gray-900">{removeKeycapEmojis(post.title)}</h1>
                  {isModerator && (
                    <button
                      onClick={() => setModeratorOverride(!moderatorOverride)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition text-sm font-medium ${
                        moderatorOverride
                          ? 'bg-red-600 text-white hover:bg-red-700'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      <span>👁️</span>
                      {moderatorOverride ? 'Hide All Content' : 'View All Hidden Content'}
                    </button>
                  )}
                </div>
                <div 
                  className="text-gray-700 whitespace-pre-wrap break-words mb-4" 
                  style={{ overflowWrap: 'break-word', wordBreak: 'break-word' }}
                >
                  {post.hasHiddenContent ? (
                    <HiddenContent 
                      content={post.content} 
                      postId={post.id}
                      authorId={post.authorId}
                      hasReacted={!!post.userReaction}
                      moderatorOverride={moderatorOverride}
                    />
                  ) : (
                    <div 
                      dangerouslySetInnerHTML={{ 
                        __html: removeKeycapEmojis(
                          parseHideContent(
                            post.content, 
                            currentUser.id, 
                            post.authorId,
                            currentUser.firstName,
                            currentUser.role,
                            moderatorOverride
                          )
                        )
                      }}
                    />
                  )}
                </div>
              </>
            )}
          </div>
          
          {!editingPost && (currentUser.role === 'admin' || currentUser.role === 'moderator' || canEditDelete(post.authorId)) && (
            <div className="relative ml-4" ref={optionsMenuRef}>
              <button
                onClick={() => setShowOptionsMenu(!showOptionsMenu)}
                className="text-gray-500 hover:text-gray-700 transition p-2 rounded-lg hover:bg-gray-100"
              >
                <EllipsisVerticalIcon className="h-6 w-6" />
              </button>
              
              {showOptionsMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                  {canEditDelete(post.authorId) && (
                    <button
                      onClick={startEditPost}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    >
                      <PencilIcon className="h-4 w-4" />
                      Edit Thread
                    </button>
                  )}
                  
                  {/* Lock/Unlock - Expert badge (100+ pts) and above can lock their own threads */}
                  {(hasModeratorPrivileges(currentUser) || 
                    (canLockThreads(currentUser) && post.authorId === currentUser.id)) && (
                    <button
                      onClick={handleToggleLock}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    >
                      {post.isLocked ? (
                        <>
                          <LockOpenIcon className="h-4 w-4" />
                          Unlock Thread
                        </>
                      ) : (
                        <>
                          <LockClosedIcon className="h-4 w-4" />
                          Lock Thread
                        </>
                      )}
                    </button>
                  )}
                  
                  {/* Pin - Only admin/moderator */}
                  {(currentUser.role === 'admin' || currentUser.role === 'moderator') && (
                    <button
                      onClick={handleTogglePin}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    >
                      <MapPinIcon className="h-4 w-4" />
                      {post.isPinned ? 'Unpin Thread' : 'Pin Thread'}
                    </button>
                  )}
                  
                  {canEditDelete(post.authorId) && (
                    <button
                      onClick={handleDeletePost}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-gray-200 mt-1 pt-2"
                    >
                      <TrashIcon className="h-4 w-4" />
                      Delete Thread
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Post Meta */}
        {!editingPost && (
          <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
            <div className="flex items-center gap-1">
              <UserIcon className="h-4 w-4" />
              <button
                onClick={() => setShowUserProfile(post.authorId)}
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
        )}

        {/* Post Reactions */}
        {!editingPost && (
          <div className="flex items-center gap-3">
            <ReactionButton
              postId={post.id}
              reactions={{
                likeCount: post.likeCount,
                loveCount: post.loveCount,
                hahaCount: post.hahaCount,
                wowCount: post.wowCount,
                sadCount: post.sadCount,
                angryCount: post.angryCount,
              }}
              userReaction={post.userReaction}
              onReactionChange={fetchThread}
            />
            <BookmarkButton
              postId={post.id}
              isBookmarked={post.isBookmarked > 0}
              onBookmarkChange={fetchThread}
            />
          </div>
        )}
      </div>

      {/* Replies Section */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Replies ({replies.length})
        </h2>

        {/* Replies List */}
        {replyTree.length > 0 ? (
          <div className="space-y-4 mb-6">
            {replyTree.map(reply => (
              <ReplyItem 
                key={reply.id} 
                reply={reply} 
                depth={0}
                editingReply={editingReply}
                editReplyContent={editReplyContent}
                setEditReplyContent={setEditReplyContent}
                setEditingReply={setEditingReply}
                handleEditReply={handleEditReply}
                handleDeleteReply={handleDeleteReply}
                canEditDelete={canEditDelete}
                startEditReply={startEditReply}
                setReplyingTo={setReplyingTo}
                setShowUserProfile={setShowUserProfile}
                fetchThread={fetchThread}
                replies={replies}
                removeKeycapEmojis={removeKeycapEmojis}
                moderatorOverride={moderatorOverride}
                currentUser={currentUser}
              />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 py-8 mb-6">No replies yet. Be the first to reply!</p>
        )}

        {/* Reply Form - Moved to bottom */}
        {!post.isLocked && (
          <form onSubmit={handleSubmitReply} className="border-t pt-6">
            {replyingTo && (
              <div className="mb-3 p-3 bg-emerald-50 rounded-lg flex items-center justify-between">
                <span className="text-sm text-emerald-700">
                  Replying to <strong>{replyingTo.authorFirstName}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => setReplyingTo(null)}
                  className="text-emerald-600 hover:text-emerald-700 text-sm font-medium"
                >
                  Cancel
                </button>
              </div>
            )}
            
            {/* Hide Content Helper for replies */}
            <HideContentHelper onInsert={(hideTag) => {
              setReplyContent(prev => prev + hideTag);
            }} />
            
            <div className="flex gap-3">
              <textarea
                id="reply-content"
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder={replyingTo ? `Reply to ${replyingTo.authorFirstName}...` : "Write your reply..."}
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                rows="3"
              />
              <button
                type="submit"
                disabled={!replyContent.trim()}
                className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <PaperAirplaneIcon className="h-5 w-5" />
                Post
              </button>
            </div>
          </form>
        )}

        <div ref={repliesEndRef} />
      </div>

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

export default ThreadDetail;
