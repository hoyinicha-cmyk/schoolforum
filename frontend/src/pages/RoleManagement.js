import { useState, useEffect } from 'react';
import { useToast } from '../contexts/ToastContext';
import { 
  UserIcon,
  ShieldCheckIcon,
  PencilIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import Avatar from '../components/Profile/Avatar';

const RoleManagement = () => {
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [editingUser, setEditingUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [pendingRole, setPendingRole] = useState(null);
  const [pendingBadge, setPendingBadge] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const roles = [
    { value: 'student', label: 'Student', color: 'gray' },
    { value: 'moderator', label: 'Moderator', color: 'purple' },
    { value: 'admin', label: 'Admin', color: 'red' }
  ];

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole })
      });

      if (response.ok) {
        toast.success('Role updated successfully');
        fetchUsers();
        setShowEditModal(false);
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to update role');
      }
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('Failed to update role');
    }
  };

  const handleBadgeChange = async (userId, newBadge) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/users/${userId}/badge`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ badge: newBadge })
      });

      if (response.ok) {
        toast.success('Badge updated successfully');
        fetchUsers();
        // Update editingUser to reflect new badge
        setEditingUser(prev => ({ ...prev, badge: newBadge }));
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to update badge');
      }
    } catch (error) {
      console.error('Error updating badge:', error);
      toast.error('Failed to update badge');
    }
  };

  const getRoleBadge = (role) => {
    const roleConfig = {
      admin: { bg: 'bg-red-100', text: 'text-red-700', label: 'Admin' },
      moderator: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Moderator' },
      student: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Student' }
    };
    
    const config = roleConfig[role] || roleConfig.student;
    return (
      <span className={`px-3 py-1 ${config.bg} ${config.text} text-xs font-medium rounded-full`}>
        {config.label}
      </span>
    );
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    
    return matchesSearch && matchesRole;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <ShieldCheckIcon className="h-8 w-8 text-emerald-600" />
          Role Management
        </h1>
        <p className="text-gray-600 mt-1">
          Manage user roles and permissions
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          {/* Role Filter */}
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          >
            <option value="all">All Roles</option>
            {roles.map(role => (
              <option key={role.value} value={role.value}>{role.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Users List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Grade
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Badge
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map(user => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Avatar avatarId={user.avatarId} size="sm" />
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          {user.firstName} {user.lastName}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.yearLevel || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getRoleBadge(user.role)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      user.badge === 'Forum Contributor' ? 'bg-purple-100 text-purple-700' :
                      user.badge === 'Forum Expert' ? 'bg-blue-100 text-blue-700' :
                      user.badge === 'Forum Active' ? 'bg-green-100 text-green-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {user.badge || 'Forum Newbie'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      user.status === 'active' ? 'bg-green-100 text-green-700' :
                      user.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      user.status === 'suspended' ? 'bg-orange-100 text-orange-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => {
                        setEditingUser(user);
                        setShowEditModal(true);
                      }}
                      className="text-emerald-600 hover:text-emerald-900 flex items-center gap-1"
                    >
                      <PencilIcon className="h-4 w-4" />
                      Change Role
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-gray-500">No users found</p>
          </div>
        )}
      </div>

      {/* Edit Role Modal */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] flex flex-col">
            {/* Fixed Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">
                Change Role for {editingUser.firstName} {editingUser.lastName}
              </h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingUser(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="overflow-y-auto p-6 flex-1">

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Current Role:</p>
              {getRoleBadge(editingUser.role)}
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select New Role:
              </label>
              <div className="space-y-2">
                {roles.map(role => (
                  <button
                    key={role.value}
                    onClick={() => setPendingRole(role.value)}
                    disabled={role.value === editingUser.role}
                    className={`w-full text-left px-4 py-3 rounded-lg border-2 transition ${
                      pendingRole === role.value
                        ? 'border-emerald-500 bg-emerald-50'
                        : role.value === editingUser.role
                        ? 'border-gray-300 bg-gray-100 cursor-not-allowed'
                        : 'border-gray-200 hover:border-emerald-500 hover:bg-emerald-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">{role.label}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {role.value === 'admin' && 'Full system access'}
                          {role.value === 'moderator' && 'Can moderate content and users'}
                          {role.value === 'student' && 'Standard user access'}
                        </div>
                      </div>
                      {role.value === editingUser.role && (
                        <span className="text-xs text-gray-500">(Current)</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6 pt-4 border-t border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Set Badge (for testing):
              </label>
              <div className="space-y-2">
                {[
                  { 
                    value: 'Forum Newbie', 
                    icon: '🌱', 
                    points: '0-24 pts', 
                    features: 'Forums • Private Messages • 20 posts/day' 
                  },
                  { 
                    value: 'Forum Active', 
                    icon: '⚡', 
                    points: '25-99 pts', 
                    features: 'All Newbie features + ChatBox • 50 posts/day' 
                  },
                  { 
                    value: 'Forum Expert', 
                    icon: '🎓', 
                    points: '100-199 pts', 
                    features: 'All Active features + Lock own threads • Unlimited posts' 
                  },
                  { 
                    value: 'Forum Contributor', 
                    icon: '👑', 
                    points: '200+ pts', 
                    features: 'All Expert features + Profile notes • HIDEUSER tags' 
                  }
                ].map(badge => (
                  <button
                    key={badge.value}
                    onClick={() => setPendingBadge(badge.value)}
                    disabled={badge.value === editingUser.badge}
                    className={`w-full text-left px-4 py-3 rounded-lg border-2 transition ${
                      pendingBadge === badge.value
                        ? 'border-blue-500 bg-blue-50'
                        : badge.value === editingUser.badge
                        ? 'border-gray-300 bg-gray-100 cursor-not-allowed'
                        : 'border-gray-200 hover:border-blue-500 hover:bg-blue-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{badge.icon}</span>
                        <div>
                          <div className="font-medium text-gray-900">{badge.value}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            {badge.points} • {badge.features}
                          </div>
                        </div>
                      </div>
                      {badge.value === editingUser.badge && (
                        <span className="text-xs text-gray-500">(Current)</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
            </div>

            {/* Fixed Footer */}
            <div className="p-6 border-t border-gray-200">
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingUser(null);
                    setPendingRole(null);
                    setPendingBadge(null);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowConfirmation(true)}
                  disabled={!pendingRole && !pendingBadge}
                  className={`flex-1 px-4 py-2 rounded-lg transition font-medium ${
                    pendingRole || pendingBadge
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmation && editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Confirm Changes</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to update <span className="font-semibold">{editingUser.firstName} {editingUser.lastName}</span>?
            </p>
            
            {pendingRole && (
              <div className="mb-4 p-3 bg-emerald-50 rounded-lg">
                <p className="text-sm text-gray-600">New Role:</p>
                <p className="font-semibold text-emerald-700">{roles.find(r => r.value === pendingRole)?.label}</p>
              </div>
            )}
            
            {pendingBadge && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">New Badge:</p>
                <p className="font-semibold text-blue-700">{pendingBadge}</p>
              </div>
            )}
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmation(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (pendingRole) {
                    await handleRoleChange(editingUser.id, pendingRole);
                  }
                  if (pendingBadge) {
                    await handleBadgeChange(editingUser.id, pendingBadge);
                  }
                  setShowConfirmation(false);
                  setShowEditModal(false);
                  setEditingUser(null);
                  setPendingRole(null);
                  setPendingBadge(null);
                }}
                className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-medium"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleManagement;
