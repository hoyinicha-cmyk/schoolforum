import { useState } from 'react';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { forumAPI } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import { parseHideContent } from '../../utils/hideContentParser';

const HiddenContent = ({ content, postId, authorId, hasReacted, moderatorOverride = false }) => {
  const toast = useToast();
  const [unlocked, setUnlocked] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  // Parse content for [HIDDEN]...[/HIDDEN] tags
  const parseContent = (text) => {
    if (!text) return { visible: '', hidden: '' };
    
    const hiddenRegex = /\[HIDDEN\]([\s\S]*?)\[\/HIDDEN\]/g;
    const hiddenMatches = [];
    let match;
    
    while ((match = hiddenRegex.exec(text)) !== null) {
      hiddenMatches.push(match[1]);
    }
    
    const visible = text.replace(hiddenRegex, '[HIDDEN CONTENT - React to view]');
    const hidden = hiddenMatches.join('\n\n');
    
    return { visible, hidden };
  };

  const { visible, hidden } = parseContent(content);

  const handleUnlock = async () => {
    if (!hasReacted) {
      toast.warning('Please react to this post first to unlock hidden content!');
      return;
    }
    
    setLoading(true);
    try {
      await forumAPI.unlockHiddenContent(postId);
      setUnlocked(true);
    } catch (error) {
      console.error('Error unlocking content:', error);
      toast.error('Failed to unlock content. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!hidden) {
    // Parse HIDEUSER tags even if no HIDDEN tags
    const parsedContent = parseHideContent(content, currentUser.id, authorId, currentUser.firstName, currentUser.role, moderatorOverride);
    return (
      <div 
        className="text-gray-700 whitespace-pre-wrap"
        dangerouslySetInnerHTML={{ __html: parsedContent }}
      />
    );
  }

  return (
    <div>
      <p className="text-gray-700 whitespace-pre-wrap mb-4">{visible}</p>
      
      {!unlocked ? (
        <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <EyeSlashIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Hidden Content</h3>
          <p className="text-gray-600 mb-4">
            {hasReacted 
              ? 'Click below to reveal hidden content'
              : 'React to this post to unlock hidden content'}
          </p>
          <button
            onClick={handleUnlock}
            disabled={!hasReacted || loading}
            className={`px-6 py-2 rounded-lg font-medium transition ${
              hasReacted
                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {loading ? 'Unlocking...' : hasReacted ? 'Unlock Content' : 'React First'}
          </button>
        </div>
      ) : (
        <div className="bg-emerald-50 border-2 border-emerald-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-3">
            <EyeIcon className="h-5 w-5 text-emerald-600" />
            <h3 className="text-sm font-semibold text-emerald-900">Unlocked Content</h3>
          </div>
          <p className="text-gray-700 whitespace-pre-wrap">{hidden}</p>
        </div>
      )}
    </div>
  );
};

export default HiddenContent;
