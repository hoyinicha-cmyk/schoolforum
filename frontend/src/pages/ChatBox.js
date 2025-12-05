import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PaperAirplaneIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import Avatar from '../components/Profile/Avatar';
import { getApiBaseUrl } from '../utils/apiUrl';

const ChatBox = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [showUserSuggestions, setShowUserSuggestions] = useState(false);
  const [mentionSearch, setMentionSearch] = useState('');
  const [highlightMessageId, setHighlightMessageId] = useState(null);
  const messagesEndRef = useRef(null);
  const highlightRef = useRef(null);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [searchParams] = useSearchParams();

  useEffect(() => {
    fetchMessages();
    fetchUsers();
    markChatAsViewed();
    
    // Check if there's a highlight parameter
    const highlightId = searchParams.get('highlight');
    if (highlightId) {
      setHighlightMessageId(parseInt(highlightId));
    }
    
    // Poll for new messages every 3 seconds
    const interval = setInterval(() => {
      fetchMessages();
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const markChatAsViewed = async () => {
    try {
      await fetch(`${getApiBaseUrl()}/api/chat/mark-viewed`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      console.log('✅ Chat marked as viewed - mention count cleared');
    } catch (error) {
      console.error('Error marking chat as viewed:', error);
    }
  };

  useEffect(() => {
    if (highlightMessageId && highlightRef.current) {
      // Scroll to highlighted message
      highlightRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      // Remove highlight after 3 seconds
      setTimeout(() => {
        setHighlightMessageId(null);
      }, 3000);
    } else {
      scrollToBottom();
    }
  }, [messages, highlightMessageId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/chat/messages`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const response = await fetch(`${getApiBaseUrl()}/api/chat/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ message: newMessage })
      });

      if (response.ok) {
        setNewMessage('');
        fetchMessages();
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/auth/users-list`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setNewMessage(value);
    
    // Check for @ mention
    const lastAtIndex = value.lastIndexOf('@');
    if (lastAtIndex !== -1) {
      const searchTerm = value.substring(lastAtIndex + 1);
      if (searchTerm && !searchTerm.includes(' ')) {
        setMentionSearch(searchTerm);
        setShowUserSuggestions(true);
      } else if (!searchTerm) {
        setShowUserSuggestions(true);
        setMentionSearch('');
      } else {
        setShowUserSuggestions(false);
      }
    } else {
      setShowUserSuggestions(false);
    }
  };

  const selectUser = (firstName) => {
    const lastAtIndex = newMessage.lastIndexOf('@');
    const beforeAt = newMessage.substring(0, lastAtIndex);
    setNewMessage(`${beforeAt}@${firstName} `);
    setShowUserSuggestions(false);
  };

  const isMyMessage = (message) => {
    return message.userId === user.id;
  };

  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-3">
          <ChatBubbleLeftRightIcon className="h-8 w-8 text-emerald-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Student Chat</h1>
            <p className="text-sm text-gray-600">Connect with fellow students</p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <ChatBubbleLeftRightIcon className="mx-auto h-16 w-16 text-gray-300" />
            <p className="mt-4 text-gray-500">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => {
            const isHighlighted = message.id === highlightMessageId;
            
            return (
              <div
                key={message.id}
                ref={isHighlighted ? highlightRef : null}
                className={`flex gap-2 ${isMyMessage(message) ? 'justify-end' : 'justify-start'} ${
                  isHighlighted ? 'animate-pulse' : ''
                }`}
              >
                {!isMyMessage(message) && (
                  <Avatar avatarId={message.avatarId} size="sm" />
                )}
                <div
                  className={`max-w-md ${
                    isMyMessage(message)
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white text-gray-900'
                  } rounded-lg px-4 py-3 shadow ${
                    isHighlighted ? 'ring-4 ring-yellow-400 ring-opacity-75' : ''
                  }`}
                >
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-semibold ${
                    isMyMessage(message) ? 'text-emerald-100' : 'text-emerald-600'
                  }`}>
                    {isMyMessage(message) ? 'You' : `${message.firstName} ${message.lastName}`}
                  </span>
                  {message.role === 'admin' && (
                    <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded">Admin</span>
                  )}
                  {message.role === 'moderator' && (
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">Mod</span>
                  )}
                </div>
                <p className="whitespace-pre-wrap break-words">{message.message}</p>
                <span className={`text-xs mt-1 block ${
                  isMyMessage(message) ? 'text-emerald-100' : 'text-gray-500'
                }`}>
                  {new Date(message.createdAt).toLocaleTimeString()}
                </span>
              </div>
              {isMyMessage(message) && (
                <Avatar avatarId={user.avatarId} size="sm" />
              )}
            </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="relative">
          {/* User Suggestions Dropdown */}
          {showUserSuggestions && (
            <div className="absolute bottom-full left-0 mb-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 max-h-48 overflow-y-auto">
              {users
                .filter(u => 
                  u.firstName.toLowerCase().includes(mentionSearch.toLowerCase()) &&
                  u.id !== user.id
                )
                .slice(0, 5)
                .map(u => (
                  <button
                    key={u.id}
                    onClick={() => selectUser(u.firstName)}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2"
                  >
                    <span className="font-medium">{u.firstName} {u.lastName}</span>
                    {u.role === 'admin' && (
                      <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded">Admin</span>
                    )}
                    {u.role === 'moderator' && (
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">Mod</span>
                    )}
                  </button>
                ))}
            </div>
          )}

          <form onSubmit={handleSendMessage} className="flex gap-3">
            <input
              type="text"
              value={newMessage}
              onChange={handleInputChange}
              placeholder="Type your message... (use @ to mention)"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              maxLength="500"
            />
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <PaperAirplaneIcon className="h-5 w-5" />
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatBox;
