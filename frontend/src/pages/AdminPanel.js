  import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { 
  UserIcon, 
  ExclamationTriangleIcon, 
  NoSymbolIcon,
  XMarkIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleIconSolid } from '@heroicons/react/24/solid';
import { CheckCircleIcon as CheckCircleIconOutline } from '@heroicons/react/24/outline';
import Avatar from '../components/Profile/Avatar';
import Badge from '../components/Forum/Badge';
import { removeKeycapEmojis } from '../utils/removeKeycapEmojis';
import RoleManagement from './RoleManagement';

const AdminPanel = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [clearingChat, setClearingChat] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [showBanModal, setShowBanModal] = useState(false);
  const [showUserInfoModal, setShowUserInfoModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [viewingUser, setViewingUser] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'student',
    gradeLevel: '11',
    schoolIdNumber: ''
  });
  const [actionReason, setActionReason] = useState({
    violation: '',
    customReason: ''
  });

  const suspendViolations = [
    'Spam or inappropriate content',
    'Inappropriate language',
    'Minor rule violation',
    'Disruptive behavior',
    'Off-topic posting',
    'Excessive self-promotion',
    'First-time offense',
    'Other (specify below)'
  ];

  const banViolations = [
    'Severe harassment or bullying',
    'Hate speech or discrimination',
    'Threats or violence',
    'Sharing illegal content',
    'Identity theft or impersonation',
    'Repeated serious violations',
    'Doxxing or privacy violation',
    'Sexual harassment',
    'Scamming or fraud',
    'Other (specify below)'
  ];

  // Fetch all users
  useEffect(() => {
    fetchUsers();
  }, []);

  const handleClearChat = async () => {
    if (!window.confirm('Are you sure you want to clear all chat messages? This cannot be undone.')) {
      return;
    }

    setClearingChat(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/chat/clear', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast.success('Chat box cleared successfully');
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to clear chat');
      }
    } catch (error) {
      console.error('Error clearing chat:', error);
      toast.error('Failed to clear chat');
    } finally {
      setClearingChat(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('📋 Fetched users:', data.users);
        console.log('📋 First user gradeLevel:', data.users[0]?.gradeLevel, 'yearLevel:', data.users[0]?.yearLevel);
        setAllUsers(data.users || []);
        setUsers(data.users || []);
      } else {
        console.error('Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterUsersByStatus = (status) => {
    setStatusFilter(status);
    if (status === 'all') {
      setUsers(allUsers);
    } else {
      setUsers(allUsers.filter(u => u.status === status));
    }
  };

  const validateSchoolId = (schoolId) => {
    if (!schoolId) return true; // Optional field
    
    // Format: YYYY-NNNN-NN (e.g., 2025-2940-23)
    const schoolIdRegex = /^(2025|2026)-\d{4}-\d{2}$/;
    return schoolIdRegex.test(schoolId);
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    
    // Validate school ID format
    if (formData.schoolIdNumber && !validateSchoolId(formData.schoolIdNumber)) {
      toast.error('Invalid School ID format. Use: YYYY-NNNN-NN (e.g., 2025-2940-23). Valid years: 2025-2026');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/users', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast.success('User created successfully!');
        setShowCreateModal(false);
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          password: '',
          role: 'student',
          gradeLevel: '11',
          schoolIdNumber: ''
        });
        fetchUsers();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to create user');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error('Failed to create user');
    }
  };

  const handleEditUser = async (e) => {
    e.preventDefault();
    
    // Validate school ID format
    if (formData.schoolIdNumber && !validateSchoolId(formData.schoolIdNumber)) {
      toast.error('Invalid School ID format. Use: YYYY-NNNN-NN (e.g., 2025-2940-23). Valid years: 2025-2026');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/users/${editingUser.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast.success('User updated successfully!');
        setShowEditModal(false);
        setEditingUser(null);
        fetchUsers();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to update user');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Failed to update user');
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to delete ${userName}? This cannot be undone.`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast.success('User deleted successfully!');
        fetchUsers();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    }
  };

  const openUserInfoModal = (userItem) => {
    setViewingUser(userItem);
    setShowUserInfoModal(true);
  };

  const openEditModal = (userItem) => {
    console.log('🔍 Opening edit modal for user:', userItem);
    console.log('🔍 User gradeLevel:', userItem.gradeLevel, 'yearLevel:', userItem.yearLevel);
    setEditingUser(userItem);
    setFormData({
      firstName: userItem.firstName,
      lastName: userItem.lastName,
      email: userItem.email,
      password: '',
      role: userItem.role,
      gradeLevel: userItem.gradeLevel || '11',
      schoolIdNumber: userItem.schoolIdNumber || ''
    });
    console.log('🔍 FormData gradeLevel set to:', userItem.gradeLevel || '11');
    setShowEditModal(true);
  };

  const openSuspendModal = (userItem) => {
    setSelectedUser(userItem);
    setActionReason({ violation: '', customReason: '' });
    setShowSuspendModal(true);
  };

  const openBanModal = (userItem) => {
    setSelectedUser(userItem);
    setActionReason({ violation: '', customReason: '' });
    setShowBanModal(true);
  };

  const handleSuspendUser = async () => {
    if (!actionReason.violation) {
      toast.error('Please select a violation reason');
      return;
    }

    const reason = actionReason.violation === 'Other (specify below)' 
      ? actionReason.customReason 
      : actionReason.violation;

    if (!reason.trim()) {
      toast.error('Please provide a reason');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/users/${selectedUser.id}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'suspended', reason })
      });

      if (response.ok) {
        toast.success('User suspended successfully!');
        setShowSuspendModal(false);
        setSelectedUser(null);
        fetchUsers();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to suspend user');
      }
    } catch (error) {
      console.error('Error suspending user:', error);
      toast.error('Failed to suspend user');
    }
  };

  const handleBanUser = async () => {
    if (!actionReason.violation) {
      toast.error('Please select a violation reason');
      return;
    }

    const reason = actionReason.violation === 'Other (specify below)' 
      ? actionReason.customReason 
      : actionReason.violation;

    if (!reason.trim()) {
      toast.error('Please provide a reason');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/users/${selectedUser.id}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'banned', reason })
      });

      if (response.ok) {
        toast.success('User banned successfully!');
        setShowBanModal(false);
        setSelectedUser(null);
        fetchUsers();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to ban user');
      }
    } catch (error) {
      console.error('Error banning user:', error);
      toast.error('Failed to ban user');
    }
  };

  // Update user status (suspend/ban/activate)
  const updateUserStatus = async (userId, newStatus) => {
    setActionLoading(prev => ({ ...prev, [userId]: true }));
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/users/${userId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        // Update local state
        setAllUsers(prev => prev.map(u => 
          u.id === userId ? { ...u, status: newStatus } : u
        ));
        setUsers(prev => prev.map(u => 
          u.id === userId ? { ...u, status: newStatus } : u
        ));
        toast.success(`User ${newStatus} successfully!`);
      } else {
        const error = await response.json();
        toast.error(`Failed to update user: ${error.message}`);
      }
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error('Error updating user status');
    } finally {
      setActionLoading(prev => ({ ...prev, [userId]: false }));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'suspended': return 'text-orange-600 bg-orange-100';
      case 'banned': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <CheckCircleIconSolid className="w-4 h-4" />;
      case 'suspended': return <ExclamationTriangleIcon className="w-4 h-4" />;
      case 'banned': return <NoSymbolIcon className="w-4 h-4" />;
      default: return <UserIcon className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Panel</h1>
          <p className="text-gray-600">Manage users, monitor activity, and maintain forum integrity</p>
        </div>
        <button
          onClick={handleClearChat}
          disabled={clearingChat}
          className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 flex items-center gap-2 whitespace-nowrap"
        >
          {clearingChat ? 'Clearing...' : 'Clear Chat Box'}
        </button>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('users')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition ${
              activeTab === 'users'
                ? 'border-emerald-500 text-emerald-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <UserIcon className="h-5 w-5" />
              User Management
            </div>
          </button>
          <button
            onClick={() => setActiveTab('roles')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition ${
              activeTab === 'roles'
                ? 'border-emerald-500 text-emerald-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <ShieldCheckIcon className="h-5 w-5" />
              Role Management
            </div>
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'roles' ? (
        <RoleManagement />
      ) : (
        <div>

      {/* Stats Cards - Clickable */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <button
          onClick={() => filterUsersByStatus('all')}
          className={`bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500 text-left hover:shadow-lg transition ${statusFilter === 'all' ? 'ring-2 ring-blue-500' : ''}`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">All Users</p>
              <p className="text-2xl font-bold text-gray-900">{allUsers.length}</p>
            </div>
            <UserIcon className="w-8 h-8 text-blue-500" />
          </div>
        </button>

        <button
          onClick={() => filterUsersByStatus('active')}
          className={`bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500 text-left hover:shadow-lg transition ${statusFilter === 'active' ? 'ring-2 ring-green-500' : ''}`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-2xl font-bold text-gray-900">
                {allUsers.filter(u => u.status === 'active').length}
              </p>
            </div>
            <CheckCircleIconSolid className="w-8 h-8 text-green-500" />
          </div>
        </button>

        <button
          onClick={() => filterUsersByStatus('pending')}
          className={`bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-500 text-left hover:shadow-lg transition ${statusFilter === 'pending' ? 'ring-2 ring-yellow-500' : ''}`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">
                {allUsers.filter(u => u.status === 'pending').length}
              </p>
            </div>
            <UserIcon className="w-8 h-8 text-yellow-500" />
          </div>
        </button>

        <button
          onClick={() => filterUsersByStatus('suspended')}
          className={`bg-white p-6 rounded-lg shadow-md border-l-4 border-orange-500 text-left hover:shadow-lg transition ${statusFilter === 'suspended' ? 'ring-2 ring-orange-500' : ''}`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Suspended</p>
              <p className="text-2xl font-bold text-gray-900">
                {allUsers.filter(u => u.status === 'suspended').length}
              </p>
            </div>
            <ExclamationTriangleIcon className="w-8 h-8 text-orange-500" />
          </div>
        </button>

        <button
          onClick={() => filterUsersByStatus('banned')}
          className={`bg-white p-6 rounded-lg shadow-md border-l-4 border-red-500 text-left hover:shadow-lg transition ${statusFilter === 'banned' ? 'ring-2 ring-red-500' : ''}`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Banned</p>
              <p className="text-2xl font-bold text-gray-900">
                {allUsers.filter(u => u.status === 'banned').length}
              </p>
            </div>
            <NoSymbolIcon className="w-8 h-8 text-red-500" />
          </div>
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden w-full">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-gray-900">User Management</h2>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition whitespace-nowrap"
          >
            <PlusIcon className="h-5 w-5" />
            Create User
          </button>
        </div>
        
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto w-full">
          <table className="min-w-full divide-y divide-gray-200 text-xs">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  User
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Email
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Grade
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  School ID
                </th>
                <th className="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase" title="Points & Badge">
                  Points
                </th>
                <th className="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase" title="Forum Activity">
                  Stats
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Reason
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Joined
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((userItem) => (
                <tr 
                  key={userItem.id} 
                  onClick={() => openUserInfoModal(userItem)}
                  className="hover:bg-gray-50 cursor-pointer"
                >
                  <td className="px-2 py-2 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Avatar avatarId={userItem.avatarId} size="sm" />
                      <div>
                        <div className="text-xs font-medium text-gray-900">
                          {userItem.firstName} {userItem.lastName}
                        </div>
                        <div className="text-xs text-gray-500">
                          {userItem.role}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-900">
                    <div className="flex items-center gap-1">
                      {userItem.emailVerified ? (
                        <CheckCircleIconSolid className="h-3 w-3 text-emerald-500 flex-shrink-0" title="Verified" />
                      ) : (
                        <CheckCircleIconOutline className="h-3 w-3 text-gray-300 flex-shrink-0" title="Not Verified" />
                      )}
                      <span className="truncate max-w-[120px]">{userItem.email}</span>
                    </div>
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap text-center">
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                      {removeKeycapEmojis(userItem.gradeLevel) || userItem.gradeLevel}
                    </span>
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-600">
                    <span className="truncate max-w-[80px] block">{removeKeycapEmojis(userItem.schoolIdNumber) || <span className="text-gray-400 italic">N/A</span>}</span>
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap text-center">
                    <div className="flex flex-col items-center gap-0.5">
                      <span className="font-bold text-purple-600 text-sm">{userItem.points || 0}</span>
                      <Badge badge={userItem.badge || 'Forum Newbie'} size="small" showLabel={false} />
                    </div>
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap text-center">
                    <div 
                      className="text-xs text-gray-600 cursor-help" 
                      title={`Posts: ${userItem.stats?.postsCount || 0}, Replies: ${userItem.stats?.repliesCount || 0}, Reactions: ${userItem.stats?.reactionsReceived || 0}`}
                    >
                      <div className="font-semibold text-emerald-600">{userItem.stats?.postsCount || 0}</div>
                      <div className="text-blue-600">{userItem.stats?.repliesCount || 0}</div>
                      <div className="text-pink-600">{userItem.stats?.reactionsReceived || 0}</div>
                    </div>
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(userItem.status)}`}>
                      {getStatusIcon(userItem.status)}
                      {userItem.status}
                    </span>
                  </td>
                  <td className="px-2 py-2 text-xs text-gray-600 max-w-[100px]">
                    {(userItem.status === 'suspended' || userItem.status === 'banned') && userItem.statusReason ? (
                      <span className="italic truncate block" title={userItem.statusReason}>
                        {userItem.statusReason.length > 30 
                          ? `${userItem.statusReason.substring(0, 30)}...` 
                          : userItem.statusReason}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-500">
                    {removeKeycapEmojis(new Date(userItem.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }))}
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap text-xs" onClick={(e) => e.stopPropagation()}>
                    {userItem.id !== user?.id ? (
                      <div className="flex gap-1">
                        <button
                          onClick={(e) => { e.stopPropagation(); openEditModal(userItem); }}
                          className="text-blue-600 hover:text-blue-900 p-1"
                          title="Edit"
                        >
                          <PencilIcon className="h-3.5 w-3.5" />
                        </button>
                        
                        {userItem.status !== 'active' && (
                          <button
                            onClick={(e) => { e.stopPropagation(); updateUserStatus(userItem.id, 'active'); }}
                            disabled={actionLoading[userItem.id]}
                            className="text-green-600 hover:text-green-900 disabled:opacity-50 p-1"
                            title="Activate"
                          >
                            ✓
                          </button>
                        )}
                        
                        {userItem.status !== 'pending' && (
                          <button
                            onClick={(e) => { e.stopPropagation(); updateUserStatus(userItem.id, 'pending'); }}
                            className="text-yellow-600 hover:text-yellow-900 p-1"
                            title="Set to Pending"
                          >
                            ⏳
                          </button>
                        )}
                        
                        {userItem.status !== 'suspended' && (
                          <button
                            onClick={(e) => { e.stopPropagation(); openSuspendModal(userItem); }}
                            className="text-orange-600 hover:text-orange-900 p-1"
                            title="Suspend"
                          >
                            ⏸
                          </button>
                        )}
                        
                        {userItem.status !== 'banned' && (
                          <button
                            onClick={(e) => { e.stopPropagation(); openBanModal(userItem); }}
                            className="text-red-600 hover:text-red-900 p-1"
                            title="Ban"
                          >
                            🚫
                          </button>
                        )}
                        
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteUser(userItem.id, `${userItem.firstName} ${userItem.lastName}`); }}
                          className="text-red-600 hover:text-red-900 p-1"
                          title="Delete"
                        >
                          <TrashIcon className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-gray-400 italic">You</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden divide-y divide-gray-200">
          {users.map((userItem) => (
            <div 
              key={userItem.id}
              onClick={() => openUserInfoModal(userItem)}
              className="p-4 hover:bg-gray-50 cursor-pointer"
            >
              {/* User Info */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Avatar avatarId={userItem.avatarId} size="md" />
                  <div>
                    <div className="font-medium text-gray-900">
                      {userItem.firstName} {userItem.lastName}
                    </div>
                    <div className="text-sm text-gray-500">{userItem.role}</div>
                    <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                      {userItem.emailVerified ? (
                        <CheckCircleIconSolid className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <CheckCircleIconOutline className="h-4 w-4 text-gray-300" />
                      )}
                      <span className="text-xs truncate max-w-[200px]">{userItem.email}</span>
                    </div>
                  </div>
                </div>
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(userItem.status)}`}>
                  {getStatusIcon(userItem.status)}
                  {userItem.status}
                </span>
              </div>

              {/* Details */}
              <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                <div>
                  <span className="text-gray-500">Grade:</span>
                  <span className="ml-2 font-medium">G{userItem.gradeLevel}</span>
                </div>
                <div>
                  <span className="text-gray-500">Joined:</span>
                  <span className="ml-2 text-xs">{new Date(userItem.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Points & Badge */}
              <div className="flex items-center gap-4 mb-3 p-2 bg-purple-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-600">Points:</span>
                  <span className="font-bold text-purple-600">{userItem.points || 0}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge badge={userItem.badge || 'Forum Newbie'} size="small" />
                </div>
              </div>

              {/* Forum Stats */}
              <div className="grid grid-cols-3 gap-2 text-xs text-gray-600 mb-3 p-2 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <div className="font-semibold text-gray-900">{userItem.stats?.postsCount || 0}</div>
                  <div>Posts</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-gray-900">{userItem.stats?.repliesCount || 0}</div>
                  <div>Replies</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-gray-900">{userItem.stats?.reactionsReceived || 0}</div>
                  <div>Reactions</div>
                </div>
              </div>

              {/* Actions */}
              {userItem.id !== user?.id && (
                <div className="flex gap-2 flex-wrap" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={(e) => { e.stopPropagation(); openEditModal(userItem); }}
                    className="flex-1 text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1 border border-blue-200"
                  >
                    <PencilIcon className="h-4 w-4" />
                    Edit
                  </button>
                  
                  {userItem.status !== 'active' && (
                    <button
                      onClick={(e) => { e.stopPropagation(); updateUserStatus(userItem.id, 'active'); }}
                      disabled={actionLoading[userItem.id]}
                      className="flex-1 text-green-600 hover:bg-green-50 px-3 py-2 rounded-lg text-sm font-medium border border-green-200 disabled:opacity-50"
                    >
                      Activate
                    </button>
                  )}
                  
                  {userItem.status !== 'suspended' && (
                    <button
                      onClick={(e) => { e.stopPropagation(); openSuspendModal(userItem); }}
                      className="flex-1 text-orange-600 hover:bg-orange-50 px-3 py-2 rounded-lg text-sm font-medium border border-orange-200"
                    >
                      Suspend
                    </button>
                  )}
                  
                  {userItem.status !== 'banned' && (
                    <button
                      onClick={(e) => { e.stopPropagation(); openBanModal(userItem); }}
                      className="flex-1 text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg text-sm font-medium border border-red-200"
                    >
                      Ban
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {users.length === 0 && (
          <div className="text-center py-12">
            <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
            <p className="mt-1 text-sm text-gray-500">No users have registered yet.</p>
          </div>
        )}
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Create New User</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleCreateUser} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  minLength="6"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  >
                    <option value="student">Student</option>
                    <option value="moderator">Moderator</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Grade Level</label>
                  <select
                    value={formData.gradeLevel}
                    onChange={(e) => setFormData({ ...formData, gradeLevel: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  >
                    <option value="11">Grade 11</option>
                    <option value="12">Grade 12</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">School ID Number (Optional)</label>
                <input
                  type="text"
                  value={formData.schoolIdNumber}
                  onChange={(e) => setFormData({ ...formData, schoolIdNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="2025-2940-23"
                  pattern="(2025|2026)-\d{4}-\d{2}"
                />
                <p className="text-xs text-gray-500 mt-1">Format: YYYY-NNNN-NN (Valid years: 2025-2026)</p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition"
                >
                  Create User
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Edit User</h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingUser(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleEditUser} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password (leave blank to keep current)</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  minLength="6"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  >
                    <option value="student">Student</option>
                    <option value="moderator">Moderator</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Grade Level</label>
                  <select
                    value={formData.gradeLevel}
                    onChange={(e) => setFormData({ ...formData, gradeLevel: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  >
                    <option value="11">Grade 11</option>
                    <option value="12">Grade 12</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">School ID Number (Optional)</label>
                <input
                  type="text"
                  value={formData.schoolIdNumber}
                  onChange={(e) => setFormData({ ...formData, schoolIdNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="2025-2940-23"
                  pattern="(2025|2026)-\d{4}-\d{2}"
                />
                <p className="text-xs text-gray-500 mt-1">Format: YYYY-NNNN-NN (Valid years: 2025-2026)</p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingUser(null);
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Suspend User Modal */}
      {showSuspendModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Suspend User</h3>
              <button
                onClick={() => {
                  setShowSuspendModal(false);
                  setSelectedUser(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-600">
                You are about to suspend <span className="font-semibold">{selectedUser.firstName} {selectedUser.lastName}</span>. 
                Please select a violation reason:
              </p>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Suspension Reason (Temporary)</label>
                <select
                  value={actionReason.violation}
                  onChange={(e) => setActionReason({ ...actionReason, violation: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="">Select a reason...</option>
                  {suspendViolations.map((v) => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              </div>

              {actionReason.violation === 'Other (specify below)' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Custom Reason</label>
                  <textarea
                    value={actionReason.customReason}
                    onChange={(e) => setActionReason({ ...actionReason, customReason: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    rows="3"
                    placeholder="Please specify the reason..."
                  />
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSuspendUser}
                  className="flex-1 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition"
                >
                  Suspend User
                </button>
                <button
                  onClick={() => {
                    setShowSuspendModal(false);
                    setSelectedUser(null);
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ban User Modal */}
      {showBanModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-red-50">
              <h3 className="text-lg font-semibold text-red-900">Ban User</h3>
              <button
                onClick={() => {
                  setShowBanModal(false);
                  setSelectedUser(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800">
                  <strong>Warning:</strong> You are about to permanently ban <span className="font-semibold">{selectedUser.firstName} {selectedUser.lastName}</span>. 
                  This action should only be taken for serious violations.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ban Reason (Permanent/Serious)</label>
                <select
                  value={actionReason.violation}
                  onChange={(e) => setActionReason({ ...actionReason, violation: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="">Select a serious violation...</option>
                  {banViolations.map((v) => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              </div>

              {actionReason.violation === 'Other (specify below)' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Custom Reason</label>
                  <textarea
                    value={actionReason.customReason}
                    onChange={(e) => setActionReason({ ...actionReason, customReason: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    rows="3"
                    placeholder="Please specify the reason..."
                  />
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleBanUser}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
                >
                  Ban User
                </button>
                <button
                  onClick={() => {
                    setShowBanModal(false);
                    setSelectedUser(null);
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Info Modal */}
      {showUserInfoModal && viewingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-emerald-50 to-blue-50">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center">
                  <UserIcon className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {viewingUser.firstName} {viewingUser.lastName}
                  </h3>
                  <p className="text-sm text-gray-600">{viewingUser.role}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowUserInfoModal(false);
                  setViewingUser(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Status Badge */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-600">Account Status</span>
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(viewingUser.status)}`}>
                  {getStatusIcon(viewingUser.status)}
                  {viewingUser.status}
                </span>
              </div>

              {/* Status Reason - Only show if suspended or banned */}
              {(viewingUser.status === 'suspended' || viewingUser.status === 'banned') && viewingUser.statusReason && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h4 className="text-sm font-semibold text-red-900 mb-2">
                    {viewingUser.status === 'suspended' ? 'Suspension Reason' : 'Ban Reason'}
                  </h4>
                  <p className="text-sm text-red-800">{viewingUser.statusReason}</p>
                </div>
              )}

              {/* User Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Email Address</p>
                  <div className="flex items-center gap-2">
                    {viewingUser.emailVerified ? (
                      <CheckCircleIconSolid className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                    ) : (
                      <CheckCircleIconOutline className="h-4 w-4 text-gray-300 flex-shrink-0" />
                    )}
                    <p className="text-sm font-medium text-gray-900 break-all">{viewingUser.email}</p>
                  </div>
                  {viewingUser.emailVerified ? (
                    <p className="text-xs text-emerald-600 mt-1">Verified</p>
                  ) : (
                    <p className="text-xs text-gray-500 mt-1">Not verified</p>
                  )}
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Grade Level</p>
                  <p className="text-sm font-medium text-gray-900">
                    Grade {removeKeycapEmojis(viewingUser.gradeLevel) || viewingUser.gradeLevel}
                  </p>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">School ID Number</p>
                  <p className="text-sm font-medium text-gray-900">
                    {removeKeycapEmojis(viewingUser.schoolIdNumber) || <span className="text-gray-400 italic">Not provided</span>}
                  </p>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">User ID</p>
                  <p className="text-sm font-medium text-gray-900">#{viewingUser.id}</p>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Account Created</p>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(viewingUser.createdAt).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Role</p>
                  <p className="text-sm font-medium text-gray-900 capitalize">{viewingUser.role}</p>
                </div>
              </div>

              {/* Points & Badge Section */}
              <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Forum Status</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                    <div className="text-2xl font-bold text-purple-600">{viewingUser.points || 0}</div>
                    <div className="text-xs text-gray-600 mt-1">Points</div>
                  </div>
                  <div className="flex flex-col items-center justify-center p-3 bg-white rounded-lg shadow-sm">
                    <Badge badge={viewingUser.badge || 'Forum Newbie'} size="medium" showLabel={false} />
                    <div className="text-xs font-semibold text-gray-700 mt-2">{viewingUser.badge || 'Forum Newbie'}</div>
                  </div>
                </div>
              </div>

              {/* Forum Activity Stats */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Forum Activity</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-3 bg-white rounded-lg">
                    <div className="text-xl font-bold text-emerald-600">{viewingUser.stats?.postsCount || 0}</div>
                    <div className="text-xs text-gray-600 mt-1">Posts</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg">
                    <div className="text-xl font-bold text-blue-600">{viewingUser.stats?.repliesCount || 0}</div>
                    <div className="text-xs text-gray-600 mt-1">Replies</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg">
                    <div className="text-xl font-bold text-pink-600">{viewingUser.stats?.reactionsReceived || 0}</div>
                    <div className="text-xs text-gray-600 mt-1">Reactions</div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              {viewingUser.id !== user?.id && (
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm font-medium text-gray-700 mb-3">Quick Actions</p>
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => {
                        setShowUserInfoModal(false);
                        openEditModal(viewingUser);
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                    >
                      <PencilIcon className="h-4 w-4" />
                      Edit User
                    </button>

                    {viewingUser.status !== 'active' && (
                      <button
                        onClick={() => {
                          setShowUserInfoModal(false);
                          updateUserStatus(viewingUser.id, 'active');
                        }}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                      >
                        Activate
                      </button>
                    )}

                    {viewingUser.status !== 'suspended' && (
                      <button
                        onClick={() => {
                          setShowUserInfoModal(false);
                          openSuspendModal(viewingUser);
                        }}
                        className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
                      >
                        Suspend
                      </button>
                    )}

                    {viewingUser.status !== 'banned' && (
                      <button
                        onClick={() => {
                          setShowUserInfoModal(false);
                          openBanModal(viewingUser);
                        }}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                      >
                        Ban
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setShowUserInfoModal(false);
                        handleDeleteUser(viewingUser.id, `${viewingUser.firstName} ${viewingUser.lastName}`);
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2"
                    >
                      <TrashIcon className="h-4 w-4" />
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      </div>
      )}
    </div>
  );
};

export default AdminPanel;