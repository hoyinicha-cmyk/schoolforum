import { useState } from 'react';
import { UserIcon, XMarkIcon } from '@heroicons/react/24/outline';

const HideContentHelper = ({ onInsert }) => {
  const [username, setUsername] = useState('');
  const [content, setContent] = useState('');
  const [showHelper, setShowHelper] = useState(false);
  
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const isContributor = ['contributor', 'moderator', 'admin'].includes(currentUser.role);
  
  // Don't show if not contributor
  if (!isContributor) {
    return null;
  }

  const handleInsert = () => {
    if (!username || !content) {
      alert('Please enter both username and content');
      return;
    }

    // Remove @ if user added it
    const cleanUsername = username.startsWith('@') ? username.slice(1) : username;
    const hideTag = `[HIDEUSER=@${cleanUsername}]${content}[/HIDEUSER]`;
    onInsert(hideTag);
    
    // Reset
    setUsername('');
    setContent('');
    setShowHelper(false);
  };

  if (!showHelper) {
    return (
      <button
        type="button"
        onClick={() => setShowHelper(true)}
        className="flex items-center gap-2 px-3 py-2 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition"
      >
        <span>🔒</span>
        Add Hidden Content
      </button>
    );
  }

  return (
    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-purple-900 flex items-center gap-2">
          <span>🔒</span>
          Hidden Content (Private)
        </h4>
        <button
          type="button"
          onClick={() => setShowHelper(false)}
          className="text-purple-600 hover:text-purple-800"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>

      <p className="text-sm text-purple-700 mb-3">
        This content will only be visible to you and the specified user.
      </p>

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <UserIcon className="h-4 w-4 inline mr-1" />
            Username (First Name)
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter first name (e.g., John or @John)"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">
            Tip: Enter the user's first name (with or without @)
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Hidden Content
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Enter the content you want to hide..."
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
          />
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleInsert}
            className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            Insert Hidden Content
          </button>
          <button
            type="button"
            onClick={() => setShowHelper(false)}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
          >
            Cancel
          </button>
        </div>
      </div>

      <div className="mt-3 p-3 bg-purple-100 rounded-lg">
        <p className="text-xs text-purple-800 font-mono">
          Preview: [HIDEUSER=@{username || 'username'}]{content || 'content'}[/HIDEUSER]
        </p>
      </div>
    </div>
  );
};

export default HideContentHelper;
