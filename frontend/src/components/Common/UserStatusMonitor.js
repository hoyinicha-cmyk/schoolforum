import { useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

/**
 * Component that monitors user status and refreshes it periodically
 * This ensures that if an admin changes a user's status, the user will be logged out
 */
const UserStatusMonitor = () => {
  const { user, refreshUser, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    // Refresh user data every 30 seconds
    const interval = setInterval(async () => {
      const result = await refreshUser();
      
      if (result.success && result.user) {
        const newStatus = result.user.status;
        
        // If status changed to suspended or banned, logout
        if (newStatus === 'suspended' || newStatus === 'banned') {
          const message = newStatus === 'suspended' 
            ? 'Your account has been suspended by an administrator.'
            : 'Your account has been banned.';
          
          alert(message);
          await logout();
          navigate('/login');
        }
        
        // If status changed from pending to active, show success message
        if (user.status === 'pending' && newStatus === 'active') {
          alert('🎉 Your account has been activated! You now have full access.');
          // Refresh the page to update UI
          window.location.reload();
        }
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [user, refreshUser, logout, navigate]);

  return null; // This component doesn't render anything
};

export default UserStatusMonitor;
