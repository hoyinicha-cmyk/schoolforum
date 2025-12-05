const express = require('express');
const User = require('../models/User');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const { sendApprovalEmail, sendRejectionEmail } = require('../utils/email');

const router = express.Router();

// Helper function to remove keycap emojis
const removeKeycapEmojis = (text) => {
  if (!text) return text;
  return String(text)
    .replace(/0️⃣/g, '0')
    .replace(/1️⃣/g, '1')
    .replace(/2️⃣/g, '2')
    .replace(/3️⃣/g, '3')
    .replace(/4️⃣/g, '4')
    .replace(/5️⃣/g, '5')
    .replace(/6️⃣/g, '6')
    .replace(/7️⃣/g, '7')
    .replace(/8️⃣/g, '8')
    .replace(/9️⃣/g, '9')
    .replace(/\*️⃣/g, '*')
    .replace(/#️⃣/g, '#');
};

// Get all users (Admin only)
router.get('/users', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const db = require('../config/database');
    
    // Get all users with points, badge, and stats
    const [users] = await db.execute(`
      SELECT 
        u.id, u.email, u.first_name, u.last_name, u.year_level, u.status, u.role, 
        u.email_verified, u.school_id_number, u.avatar_id, u.created_at, u.status_reason,
        u.points, u.badge,
        (SELECT COUNT(*) FROM posts WHERE user_id = u.id) as postsCount,
        (SELECT COUNT(*) FROM replies WHERE user_id = u.id) as repliesCount,
        (SELECT COUNT(*) FROM reactions r 
         JOIN posts p ON r.post_id = p.id 
         WHERE p.user_id = u.id) + 
        (SELECT COUNT(*) FROM reactions r 
         JOIN replies rp ON r.reply_id = rp.id 
         WHERE rp.user_id = u.id) as reactionsReceived
      FROM users u
      ORDER BY u.created_at DESC
    `);
    
    // Clean emoji data and transform
    const cleanedUsers = users.map(user => ({
      id: user.id,
      email: user.email,
      firstName: removeKeycapEmojis(user.first_name),
      lastName: removeKeycapEmojis(user.last_name),
      yearLevel: user.year_level,
      gradeLevel: user.year_level ? user.year_level.replace('G', '') : '11',
      status: user.status,
      statusReason: user.status_reason,
      role: user.role,
      emailVerified: user.email_verified,
      schoolIdNumber: removeKeycapEmojis(user.school_id_number),
      avatarId: user.avatar_id,
      createdAt: user.created_at,
      points: user.points || 0,
      badge: user.badge || 'Forum Newbie',
      stats: {
        postsCount: user.postsCount || 0,
        repliesCount: user.repliesCount || 0,
        reactionsReceived: user.reactionsReceived || 0
      }
    }));
    
    res.json({ 
      success: true, 
      users: cleanedUsers
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ 
      error: 'Failed to fetch users',
      message: 'Please try again later'
    });
  }
});

// Get pending users for approval
router.get('/pending', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const pendingUsers = await User.getPendingUsers();
    
    res.json({
      users: pendingUsers,
      count: pendingUsers.length
    });
    
  } catch (error) {
    console.error('Fetch pending users error:', error);
    res.status(500).json({
      error: 'Failed to fetch pending users',
      message: 'Please try again later'
    });
  }
});

// Approve user
router.put('/approve/:userId', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const { yearLevel, role = 'student' } = req.body;
    
    // Validate year level
    if (!['G11', 'G12'].includes(yearLevel)) {
      return res.status(400).json({
        error: 'Invalid year level',
        message: 'Year level must be G11 or G12'
      });
    }
    
    // Validate role
    if (!['student', 'moderator'].includes(role)) {
      return res.status(400).json({
        error: 'Invalid role',
        message: 'Role must be student or moderator'
      });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }
    
    if (user.status !== 'pending') {
      return res.status(400).json({
        error: 'User not pending approval',
        message: `User status is already: ${user.status}`
      });
    }
    
    // Update user status and year level
    await User.updateStatus(userId, 'active', role);
    await User.updateYearLevel(userId, yearLevel);
    
    // Send approval email
    await sendApprovalEmail(user.email, user.first_name, yearLevel);
    
    // Clean up uploaded school ID after approval
    if (user.school_id_path) {
      // Note: File cleanup will be handled by the upload route's delete endpoint
      // This keeps the audit trail intact while removing sensitive documents
    }
    
    res.json({
      message: 'User approved successfully',
      user: {
        id: userId,
        email: user.email,
        name: `${user.first_name} ${user.last_name}`,
        yearLevel,
        role,
        status: 'active'
      }
    });
    
  } catch (error) {
    console.error('Approve user error:', error);
    res.status(500).json({
      error: 'Failed to approve user',
      message: 'Please try again later'
    });
  }
});

// Reject user
router.put('/reject/:userId', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason = 'Document verification failed' } = req.body;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }
    
    if (user.status !== 'pending') {
      return res.status(400).json({
        error: 'User not pending approval',
        message: `User status is already: ${user.status}`
      });
    }
    
    // Update user status
    await User.updateStatus(userId, 'rejected');
    
    // Send rejection email
    await sendRejectionEmail(user.email, user.first_name, reason);
    
    res.json({
      message: 'User rejected',
      user: {
        id: userId,
        email: user.email,
        name: `${user.first_name} ${user.last_name}`,
        status: 'rejected',
        reason
      }
    });
    
  } catch (error) {
    console.error('Reject user error:', error);
    res.status(500).json({
      error: 'Failed to reject user',
      message: 'Please try again later'
    });
  }
});

// Get dashboard statistics
router.get('/stats', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const stats = await User.getStats();
    
    res.json({
      statistics: stats,
      generatedAt: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({
      error: 'Failed to fetch statistics',
      message: 'Please try again later'
    });
  }
});

// Update user role (admin only)
router.put('/role/:userId', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;
    
    // Only super admin can create other admins
    if (role === 'admin' && req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Access denied',
        message: 'Only administrators can assign admin roles'
      });
    }
    
    if (!['student', 'contributor', 'moderator', 'admin'].includes(role)) {
      return res.status(400).json({
        error: 'Invalid role',
        message: 'Role must be student, contributor, moderator, or admin'
      });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }
    
    await User.updateStatus(userId, user.status, role);
    
    res.json({
      message: 'User role updated successfully',
      user: {
        id: userId,
        email: user.email,
        name: `${user.first_name} ${user.last_name}`,
        role: role
      }
    });
    
  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json({
      error: 'Failed to update role',
      message: 'Please try again later'
    });
  }
});

// Update user role (alternative endpoint for role management)
router.put('/users/:userId/role', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;
    
    console.log('🔧 Update user role:', { userId, role, admin: req.user.id });
    
    // Only super admin can create other admins
    if (role === 'admin' && req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Access denied',
        message: 'Only administrators can assign admin roles'
      });
    }
    
    if (!['student', 'contributor', 'moderator', 'admin'].includes(role)) {
      return res.status(400).json({
        error: 'Invalid role',
        message: 'Role must be student, contributor, moderator, or admin'
      });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }
    
    await User.updateStatus(userId, user.status, role);
    
    console.log('✅ Role updated successfully');
    
    res.json({
      message: 'User role updated successfully',
      user: {
        id: userId,
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
        role: role
      }
    });
    
  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json({
      error: 'Failed to update role',
      message: 'Please try again later'
    });
  }
});

// Update user badge (admin only - for testing)
router.put('/users/:userId/badge', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const { badge } = req.body;
    const db = require('../config/database');
    
    console.log('🎖️ Update user badge:', { userId, badge, admin: req.user.id });
    
    const validBadges = ['Forum Newbie', 'Forum Active', 'Forum Expert', 'Forum Contributor'];
    if (!validBadges.includes(badge)) {
      return res.status(400).json({
        error: 'Invalid badge',
        message: 'Badge must be one of: ' + validBadges.join(', ')
      });
    }
    
    const [user] = await db.execute('SELECT * FROM users WHERE id = ?', [userId]);
    if (user.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Update badge
    await db.execute('UPDATE users SET badge = ? WHERE id = ?', [badge, userId]);
    
    console.log('✅ Badge updated successfully');
    
    res.json({
      message: 'User badge updated successfully',
      user: {
        id: userId,
        email: user[0].email,
        name: `${user[0].first_name} ${user[0].last_name}`,
        badge: badge
      }
    });
    
  } catch (error) {
    console.error('Update badge error:', error);
    res.status(500).json({
      error: 'Failed to update badge',
      message: 'Please try again later'
    });
  }
});

// Update user status (suspend/ban/activate)
router.patch('/users/:userId/status', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const { status, reason } = req.body;

    console.log('🔧 Update user status request:', { 
      userId, 
      status,
      reason,
      requestingUser: req.user ? req.user.id : 'undefined',
      fullUser: req.user 
    });

    // Validate status
    const validStatuses = ['active', 'suspended', 'banned', 'pending'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be one of: active, suspended, banned, pending'
      });
    }

    // Require reason for suspend/ban
    if ((status === 'suspended' || status === 'banned') && !reason) {
      return res.status(400).json({
        success: false,
        message: 'Reason is required for suspending or banning users'
      });
    }

    // Prevent admin from changing their own status
    if (parseInt(userId) === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot change your own account status'
      });
    }

    // Find user first
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'The specified user does not exist'
      });
    }

    // Prevent banning/suspending other admins
    if (user.role === 'admin' && ['suspended', 'banned'].includes(status)) {
      return res.status(403).json({
        success: false,
        message: 'Cannot suspend or ban other administrators'
      });
    }

    // Update user status with reason
    await User.updateStatus(userId, status);
    
    // Update status reason if provided
    if (reason) {
      await User.updateStatusReason(userId, reason);
    } else if (status === 'active') {
      // Clear reason when activating
      await User.updateStatusReason(userId, null);
    }

    // If activating a user, also verify their email
    if (status === 'active' && !user.emailVerified) {
      await User.updateEmailVerification(userId, true);
      console.log(`✅ Email verified for user ${userId} during activation`);
    }

    res.json({
      success: true,
      message: `User ${status} successfully`,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        status: status
      }
    });

  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user status. Please try again later.'
    });
  }
});

// Create new user (admin only)
router.post('/users', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { firstName, lastName, email, password, role, gradeLevel, schoolIdNumber } = req.body;
    
    // Validate required fields
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'First name, last name, email, and password are required'
      });
    }

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        error: 'User already exists',
        message: 'A user with this email already exists'
      });
    }

    // Create user
    const userId = await User.create({
      firstName,
      lastName,
      email,
      password,
      role: role || 'student',
      gradeLevel: gradeLevel || '11',
      schoolIdNumber: schoolIdNumber || '',
      status: 'active',
      emailVerified: true
    });

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      userId
    });

  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      error: 'Failed to create user',
      message: 'Please try again later'
    });
  }
});

// Update user (admin only)
router.put('/users/:userId', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const { firstName, lastName, email, password, role, gradeLevel, schoolIdNumber } = req.body;

    // Find user first
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    // Prevent editing own account through this endpoint
    if (parseInt(userId) === req.user.id) {
      return res.status(400).json({
        error: 'Cannot edit your own account through this endpoint'
      });
    }

    // Update user
    await User.update(userId, {
      firstName,
      lastName,
      email,
      password: password || undefined, // Only update if provided
      role,
      gradeLevel,
      schoolIdNumber
    });

    res.json({
      success: true,
      message: 'User updated successfully'
    });

  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      error: 'Failed to update user',
      message: 'Please try again later'
    });
  }
});

// Delete user (admin only)
router.delete('/users/:userId', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;

    // Find user first
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    // Prevent deleting own account
    if (parseInt(userId) === req.user.id) {
      return res.status(400).json({
        error: 'Cannot delete your own account'
      });
    }

    // Prevent deleting other admins
    if (user.role === 'admin') {
      return res.status(403).json({
        error: 'Cannot delete other administrators'
      });
    }

    // Delete user
    await User.delete(userId);

    res.json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      error: 'Failed to delete user',
      message: 'Please try again later'
    });
  }
});

module.exports = router;