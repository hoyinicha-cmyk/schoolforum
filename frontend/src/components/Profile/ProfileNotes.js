import { useState, useEffect } from 'react';
import { 
  PencilIcon, 
  TrashIcon, 
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon 
} from '@heroicons/react/24/outline';
import { hasContributorPrivileges } from '../../utils/contributorCheck';

const ProfileNotes = ({ userId, isOwnProfile, user }) => {
  const [note, setNote] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const isContributor = hasContributorPrivileges(user);

  useEffect(() => {
    fetchNote();
  }, [userId]);

  const fetchNote = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/contributor/profile-note/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setNote(data.note);
      }
    } catch (error) {
      console.error('Error fetching note:', error);
    }
  };

  const handleSaveNote = async () => {
    if (!noteContent.trim()) {
      setMessage('Note cannot be empty');
      setIsSuccess(false);
      return;
    }

    if (noteContent.length > 40) {
      setMessage('Note must be 40 characters or less');
      setIsSuccess(false);
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/contributor/profile-note', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: noteContent })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Note posted successfully! Expires in 24 hours.');
        setIsSuccess(true);
        setNote(data.note);
        setIsEditing(false);
        setNoteContent('');
      } else {
        setMessage(data.error || 'Failed to post note');
        setIsSuccess(false);
      }
    } catch (error) {
      setMessage('Error posting note');
      setIsSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNote = async () => {
    if (!window.confirm('Delete this note?')) return;

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/contributor/profile-note', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setMessage('Note deleted successfully');
        setIsSuccess(true);
        setNote(null);
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      setMessage('Error deleting note');
      setIsSuccess(false);
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

  // Don't show section if not contributor and no note exists
  if (!isContributor && !note) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg shadow-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          📝 Profile Note
          {isContributor && (
            <span className="text-xs font-normal text-purple-600">(Contributor Feature)</span>
          )}
        </h3>
        {isOwnProfile && isContributor && !isEditing && (
          <button
            onClick={() => {
              setIsEditing(true);
              setNoteContent(note?.content || '');
            }}
            className="text-purple-600 hover:text-purple-700 flex items-center gap-1 text-sm"
          >
            <PencilIcon className="h-4 w-4" />
            {note ? 'Edit' : 'Add Note'}
          </button>
        )}
      </div>

      {note && !isEditing && (
        <div className="bg-white rounded-lg p-4 border-l-4 border-purple-500">
          <p className="text-gray-800 whitespace-pre-wrap">{note.content}</p>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <ClockIcon className="h-4 w-4" />
              {getTimeRemaining(note.expires_at)}
            </div>
            {isOwnProfile && isContributor && (
              <button
                onClick={handleDeleteNote}
                disabled={loading}
                className="text-red-600 hover:text-red-700 flex items-center gap-1 text-xs"
              >
                <TrashIcon className="h-4 w-4" />
                Delete
              </button>
            )}
          </div>
        </div>
      )}

      {isEditing && isOwnProfile && isContributor && (
        <div className="space-y-3">
          <textarea
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            placeholder="Write a note for your profile... (max 40 characters)"
            maxLength={40}
            rows={4}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">
              {noteContent.length}/40 characters • Expires in 24 hours
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setIsEditing(false);
                  setNoteContent('');
                  setMessage('');
                }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNote}
                disabled={loading || !noteContent.trim()}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50 text-sm"
              >
                {loading ? 'Posting...' : 'Post Note'}
              </button>
            </div>
          </div>
        </div>
      )}

      {!note && !isEditing && isOwnProfile && isContributor && (
        <div className="text-center py-4">
          <p className="text-gray-600 text-sm mb-3">
            Post a note to your profile. It will be visible for 24 hours.
          </p>
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm"
          >
            Add Profile Note
          </button>
        </div>
      )}

      {message && (
        <div className={`mt-3 flex items-center gap-2 p-3 rounded-lg text-sm ${
          isSuccess ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          {isSuccess ? (
            <CheckCircleIcon className="h-5 w-5" />
          ) : (
            <XCircleIcon className="h-5 w-5" />
          )}
          <span>{message}</span>
        </div>
      )}
    </div>
  );
};

export default ProfileNotes;
