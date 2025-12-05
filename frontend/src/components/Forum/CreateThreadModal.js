import { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { forumAPI } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import HideContentHelper from './HideContentHelper';

const CreateThreadModal = ({ isOpen, onClose, forumType, onThreadCreated }) => {
  const toast = useToast();
  const [formData, setFormData] = useState({
    prefix: 'discussion',
    title: '',
    content: '',
    hasHiddenContent: false,
  });
  const [loading, setLoading] = useState(false);
  
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const isContributor = ['contributor', 'moderator', 'admin'].includes(currentUser.role);
  const isModeratorOrAdmin = ['moderator', 'admin'].includes(currentUser.role);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.warning('Please fill in all fields');
      return;
    }
    
    setLoading(true);
    try {
      console.log('Creating post with data:', {
        forumType,
        prefix: formData.prefix,
        title: formData.title,
        content: formData.content.substring(0, 50) + '...',
        hasHiddenContent: formData.hasHiddenContent,
      });
      
      const response = await forumAPI.createPost({
        forumType,
        prefix: formData.prefix,
        title: formData.title,
        content: formData.content,
        hasHiddenContent: formData.hasHiddenContent,
      });
      
      console.log('Post created successfully:', response.data);
      
      setFormData({ prefix: 'discussion', title: '', content: '', hasHiddenContent: false });
      toast.success('Thread created successfully!');
      onClose();
      
      if (onThreadCreated) {
        onThreadCreated();
      }
    } catch (error) {
      console.error('Error creating thread:', error);
      console.error('Error response:', error.response?.data);
      const errorMessage = error.response?.data?.error || error.response?.data?.details || error.message || 'Unknown error';
      toast.error(`Failed to create thread: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const insertHiddenTag = () => {
    const textarea = document.getElementById('thread-content');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = formData.content;
    const before = text.substring(0, start);
    const selected = text.substring(start, end);
    const after = text.substring(end);
    
    const newContent = `${before}[HIDDEN]${selected || 'Hidden content here'}[/HIDDEN]${after}`;
    setFormData({ ...formData, content: newContent, hasHiddenContent: true });
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + 8, start + 8 + (selected || 'Hidden content here').length);
    }, 0);
  };

  const insertHideUserTag = (hideTag) => {
    const textarea = document.getElementById('thread-content');
    const start = textarea.selectionStart;
    const text = formData.content;
    const before = text.substring(0, start);
    const after = text.substring(start);
    
    const newContent = `${before}${hideTag}${after}`;
    setFormData({ ...formData, content: newContent });
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + hideTag.length, start + hideTag.length);
    }, 0);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Create New Thread</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Prefix selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Thread Prefix
            </label>
            <select
              value={formData.prefix}
              onChange={(e) => setFormData({ ...formData, prefix: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="discussion">Discussion</option>
              <option value="question">Question</option>
              <option value="tutorial">Tutorial</option>
              
              {/* General Forum only */}
              {forumType === 'general' && (
                <>
                  <option value="food">Food</option>
                  <option value="lost-found">Lost and Found</option>
                  {isModeratorOrAdmin && (
                    <option value="announcement">Announcement</option>
                  )}
                </>
              )}
              
              {/* G11 & G12 Forums only */}
              {(forumType === 'g11' || forumType === 'g12') && (
                <option value="unlock-request">Unlock Request (Scribd/Studocu)</option>
              )}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Thread Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter thread title..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              maxLength={200}
            />
          </div>

          {/* Content */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Content
              </label>
            </div>

            {/* Hide Content Helper */}
            <HideContentHelper onInsert={insertHideUserTag} />

            <textarea
              id="thread-content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder={
                isContributor
                  ? "Write your post content here...&#10;&#10;Tip: Use [HIDEUSER=@firstname]content[/HIDEUSER] to hide content for specific users only."
                  : "Write your post content here..."
              }
              rows={10}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-mono text-sm"
            />
            {isContributor && (
              <p className="text-xs text-gray-500 mt-1">
                Use [HIDEUSER=@username]...[/HIDEUSER] for private content
              </p>
            )}
          </div>

          {/* Submit buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-emerald-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-emerald-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Thread'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateThreadModal;
