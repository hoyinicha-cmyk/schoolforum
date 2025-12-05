import { useState, useEffect, useRef } from 'react';
import { PaperAirplaneIcon, ChatBubbleLeftRightIcon, BellIcon } from '@heroicons/react/24/outline';
import { getApiBaseUrl } from '../utils/apiUrl';

const Dashboard = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [users, setUsers] = useState([]);
  const [showUserSuggestions, setShowUserSuggestions] = useState(false);
  const [mentionSearch, setMentionSearch] = useState('');
  const messagesEndRef = useRef(null);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchMessages();
    fetchNotifications();
    fetchUsers();
    // Poll for new messages and notifications every 3 seconds
    const interval = setInterval(() => {
      fetchMessages();
      fetchUnreadCount();
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

  const fetchNotifications = async () => {
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/notifications`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('🔔 Notifications:', data.notifications);
        setNotifications(data.notifications);
        const unread = data.notifications.filter(n => !n.isRead).length;
        console.log('🔔 Unread count:', unread);
        setUnreadCount(unread);
      } else {
        console.error('Failed to fetch notifications:', response.status);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/notifications/unread-count`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.count);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
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

  const markAsRead = async (notificationId) => {
    try {
      await fetch(`${getApiBaseUrl()}/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      fetchNotifications();
    } catch (error) {
      console.error('Error marking as read:', error);
    }
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
    <div className="h-[calc(100vh-8rem)] flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ChatBubbleLeftRightIcon className="h-8 w-8 text-emerald-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Student Chat</h1>
              <p className="text-sm text-gray-600">Connect with fellow students</p>
            </div>
          </div>
          
          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                if (!showNotifications) fetchNotifications();
              }}
              className="relative p-2 text-gray-600 hover:text-emerald-600 hover:bg-gray-100 rounded-lg transition"
            >
              <BellIcon className="h-6 w-6" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-y-auto">
                <div className="p-3 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900">Notifications</h3>
                </div>
                {notifications.length === 0 ? (
                  <p className="p-4 text-center text-gray-500 text-sm">No notifications</p>
                ) : (
                  <div>
                    {notifications.map(notif => (
                      <div
                        key={notif.id}
                        onClick={() => markAsRead(notif.id)}
                        className={`p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                          !notif.isRead ? 'bg-emerald-50' : ''
                        }`}
                      >
                        <p className="text-sm text-gray-900">{notif.message}</p>
                        <span className="text-xs text-gray-500">
                          {new Date(notif.createdAt).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
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
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${isMyMessage(message) ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-md ${
                  isMyMessage(message)
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white text-gray-900'
                } rounded-lg px-4 py-3 shadow`}
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
            </div>
          ))
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

export default Dashboard;
