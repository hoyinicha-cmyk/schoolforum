import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PaperAirplaneIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import Avatar from '../components/Profile/Avatar';
import { getApiBaseUrl } from '../utils/apiUrl';

const Messages = () => {
  const { userId: chatUserId } = useParams();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchConversations();
    if (chatUserId) {
      fetchMessages(chatUserId);
      
      // Poll for new messages every 3 seconds
      const interval = setInterval(() => {
        fetchMessages(chatUserId);
      }, 3000);
      
      return () => clearInterval(interval);
    }
    
    // Trigger sidebar refresh when opening a conversation
    window.dispatchEvent(new Event('messagesRead'));
  }, [chatUserId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-refresh conversations list
  useEffect(() => {
    const interval = setInterval(() => {
      fetchConversations();
    }, 5000); // Every 5 seconds
    
    return () => clearInterval(interval);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/messages/conversations`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setConversations(data.conversations);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (userId) => {
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/messages/conversation/${userId}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages);
        setSelectedUser(data.otherUser);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !chatUserId) return;

    try {
      const response = await fetch(`${getApiBaseUrl()}/api/messages/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          receiverId: chatUserId,
          message: newMessage
        })
      });

      if (response.ok) {
        const data = await response.json();
        setMessages([...messages, data.message]);
        setNewMessage('');
        fetchConversations(); // Refresh conversation list
        window.dispatchEvent(new Event('messagesRead')); // Update sidebar badge
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const selectConversation = (userId) => {
    navigate(`/messages/${userId}`);
  };

  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Conversations List */}
      <div className="w-80 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Messages</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <p>No conversations yet</p>
              <p className="text-sm mt-2">Start a conversation by visiting a user's profile</p>
            </div>
          ) : (
            conversations.map(conv => (
              <button
                key={conv.user_id}
                onClick={() => selectConversation(conv.user_id)}
                className={`w-full p-4 flex items-center gap-3 hover:bg-gray-50 transition border-b border-gray-100 ${
                  parseInt(chatUserId) === conv.user_id ? 'bg-emerald-50' : ''
                }`}
              >
                <Avatar avatarId={conv.avatarId} size="md" />
                <div className="flex-1 text-left">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-gray-900">
                      {conv.firstName} {conv.lastName}
                    </p>
                    {conv.unreadCount > 0 && (
                      <span className="bg-emerald-600 text-white text-xs rounded-full px-2 py-1">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 truncate">{conv.lastMessage}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(conv.lastMessageTime).toLocaleString()}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {chatUserId && selectedUser ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 flex items-center gap-3">
              <button
                onClick={() => navigate('/app/messages')}
                className="lg:hidden text-gray-600 hover:text-gray-900"
              >
                <ArrowLeftIcon className="h-6 w-6" />
              </button>
              <Avatar avatarId={selectedUser.avatarId} size="md" />
              <div>
                <h3 className="font-semibold text-gray-900">
                  {selectedUser.firstName} {selectedUser.lastName}
                </h3>
                {selectedUser.role === 'admin' && (
                  <span className="text-xs text-red-600">Admin</span>
                )}
                {selectedUser.role === 'moderator' && (
                  <span className="text-xs text-blue-600">Moderator</span>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map(msg => (
                <div
                  key={msg.id}
                  className={`flex ${msg.senderId === currentUser.id ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-md px-4 py-2 rounded-lg ${
                      msg.senderId === currentUser.id
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gray-200 text-gray-900'
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">{msg.message}</p>
                    <div className={`flex items-center justify-between gap-2 text-xs mt-1 ${
                      msg.senderId === currentUser.id ? 'text-emerald-100' : 'text-gray-500'
                    }`}>
                      <span>{new Date(msg.createdAt).toLocaleTimeString()}</span>
                      {msg.senderId === currentUser.id && (
                        <span className="flex items-center gap-1">
                          {msg.isRead ? (
                            <>
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                              </svg>
                              <svg className="w-4 h-4 -ml-2" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                              </svg>
                            </>
                          ) : (
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                            </svg>
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <PaperAirplaneIcon className="h-5 w-5" />
                  Send
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <p className="text-lg">Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
