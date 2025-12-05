import { useState, useEffect } from 'react';
import { ChatBubbleLeftIcon, UserIcon, ChevronDownIcon, ChevronUpIcon, PlusIcon, EyeIcon } from '@heroicons/react/24/outline';
import ReactionButton from '../components/Forum/ReactionButton';
import BookmarkButton from '../components/Forum/BookmarkButton';
import PrefixBadge from '../components/Forum/PrefixBadge';
import HiddenContent from '../components/Forum/HiddenContent';
import CreateThreadModal from '../components/Forum/CreateThreadModal';
import { forumAPI } from '../services/api';
import { removeKeycapEmojis } from '../utils/removeKeycapEmojis';

const ForumGeneralComplete = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedPost, setExpandedPost] = useState(null);
  const [replies, setReplies] = useState({});
  const [loadingReplies, setLoadingReplies] = useState({});
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await forumAPI.getPosts('general');
      setPosts(response.data.posts || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReplies = async (postId) => {
    if (replies[postId]) {
      setExpandedPost(expandedPost === postId ? null : postId);
      return;
    }

    setLoadingReplies(prev => ({ ...prev, [postId]: true }));
    try {
      const response = await forumAPI.getReplies(postId);
      setReplies(prev => ({ ...prev, [postId]: response.data.replies || [] }));
      setExpandedPost(postId);
    } catch (error) {
      console.error('Error fetching replies:', error);
    } finally {
      setLoadingReplies(prev => ({ ...prev, [postId]: false }));
    }
  };

  const toggleReplies = (postId) => {
    if (expandedPost === postId) {
      setExpandedPost(null);
    } else {
      fetchReplies(postId);
    }
  };

  const handleReactionChange = () => {
    fetchPosts();
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">General Discussion</h1>
          <p className="text-gray-600">Open forum for all students</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-700 transition"
        >
          <PlusIcon className="h-5 w-5" />
          Create Thread
        </button>
      </div>

      <div className="space-y-4">
        {posts.map(post => (
          <div key={post.id} className="bg-white rounded-lg shadow hover:shadow-md transition">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    {post.isPinned && (
                      <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded">
                        Pinned
                      </span>
                    )}
                    {post.isLocked && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded">
                        Locked
                      </span>
                    )}
                    <PrefixBadge prefix={post.prefix} />
                    <h2 className="text-xl font-semibold text-gray-900">{removeKeycapEmojis(post.title)}</h2>
                  </div>
                  
                  {post.hasHiddenContent ? (
                    <HiddenContent 
                      content={post.content} 
                      postId={post.id}
                      hasReacted={!!post.userReaction}
                    />
                  ) : (
                    <p className="text-gray-700 whitespace-pre-wrap mb-4">
                      {removeKeycapEmojis(post.content)}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-1">
                      <UserIcon className="h-4 w-4" />
                      <span>{post.authorFirstName} {post.authorLastName}</span>
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

                  {/* Reactions and Bookmark */}
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
                      onReactionChange={handleReactionChange}
                    />
                    <BookmarkButton
                      postId={post.id}
                      isBookmarked={post.isBookmarked > 0}
                      onBookmarkChange={handleReactionChange}
                    />
                  </div>
                </div>
              </div>

              {/* View Replies Button */}
              {post.replyCount > 0 && (
                <button
                  onClick={() => toggleReplies(post.id)}
                  className="mt-4 flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium text-sm"
                >
                  {expandedPost === post.id ? (
                    <>
                      <ChevronUpIcon className="h-4 w-4" />
                      Hide Replies
                    </>
                  ) : (
                    <>
                      <ChevronDownIcon className="h-4 w-4" />
                      View {post.replyCount} {post.replyCount === 1 ? 'Reply' : 'Replies'}
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Replies Section */}
            {expandedPost === post.id && (
              <div className="border-t border-gray-200 bg-gray-50 p-6">
                {loadingReplies[post.id] ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 mb-4">Replies</h3>
                    {replies[post.id]?.map(reply => (
                      <div key={reply.id} className="bg-white rounded-lg p-4 shadow-sm">
                        {reply.hasHiddenContent ? (
                          <HiddenContent 
                            content={reply.content} 
                            postId={post.id}
                            hasReacted={!!post.userReaction}
                          />
                        ) : (
                          <p className="text-gray-700 mb-3 whitespace-pre-wrap">
                            {removeKeycapEmojis(reply.content)}
                          </p>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <UserIcon className="h-4 w-4" />
                            <span>{reply.authorFirstName} {reply.authorLastName}</span>
                            {reply.authorRole === 'admin' && (
                              <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded">Admin</span>
                            )}
                            {reply.authorRole === 'moderator' && (
                              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">Mod</span>
                            )}
                            <span className="ml-2">{new Date(reply.createdAt).toLocaleDateString()}</span>
                          </div>
                          
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
                            onReactionChange={() => fetchReplies(post.id)}
                          />
                        </div>
                      </div>
                    ))}
                    {replies[post.id]?.length === 0 && (
                      <p className="text-gray-500 text-center py-4">No replies yet</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

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
        forumType="general"
        onThreadCreated={handleThreadCreated}
      />
    </div>
  );
};

export default ForumGeneralComplete;
