import { useState } from 'react';
import { BookmarkIcon as BookmarkOutline } from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolid } from '@heroicons/react/24/solid';
import { forumAPI } from '../../services/api';

const BookmarkButton = ({ postId, isBookmarked: initialBookmarked, onBookmarkChange }) => {
  const [isBookmarked, setIsBookmarked] = useState(initialBookmarked);
  const [loading, setLoading] = useState(false);

  const handleToggleBookmark = async () => {
    if (loading) return;
    
    setLoading(true);
    try {
      if (isBookmarked) {
        await forumAPI.removeBookmark(postId);
        setIsBookmarked(false);
      } else {
        await forumAPI.bookmarkPost(postId);
        setIsBookmarked(true);
      }
      
      if (onBookmarkChange) {
        onBookmarkChange();
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggleBookmark}
      className={`p-2 rounded-lg transition ${
        isBookmarked
          ? 'text-yellow-600 hover:text-yellow-700 bg-yellow-50 hover:bg-yellow-100'
          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
      }`}
      title={isBookmarked ? 'Remove bookmark' : 'Bookmark this post'}
      disabled={loading}
    >
      {isBookmarked ? (
        <BookmarkSolid className="h-5 w-5" />
      ) : (
        <BookmarkOutline className="h-5 w-5" />
      )}
    </button>
  );
};

export default BookmarkButton;
