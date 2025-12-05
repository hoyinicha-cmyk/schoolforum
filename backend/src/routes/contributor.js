const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const { hasContributorPrivileges } = require('../utils/contributorCheck');
const router = express.Router();

// Middleware to check if user is contributor or higher (role OR badge)
const contributorMiddleware = async (req, res, next) => {
  try {
    // Get user's badge from database
    const db = require('../config/database');
    const [users] = await db.execute(
      'SELECT badge, role FROM users WHERE id = ?',
      [req.user.id]
    );
    
    if (users.length === 0) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'User not found'
      });
    }
    
    const user = { ...req.user, badge: users[0].badge, role: users[0].role };
    
    if (!hasContributorPrivileges(user)) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'This feature is only available to contributors or users with Forum Contributor badge (200+ points)'
      });
    }
    
    // Add badge to req.user for later use
    req.user.badge = users[0].badge;
    next();
  } catch (error) {
    console.error('Error checking contributor privileges:', error);
    res.status(500).json({ error: 'Failed to verify permissions' });
  }
};

// Get user's active profile note
router.get('/profile-note', authMiddleware, async (req, res) => {
  try {
    const db = require('../config/database');
    const userId = req.params.userId || req.user.id;
    
    // Get active note (not expired)
    const [notes] = await db.execute(`
      SELECT id, content, created_at, expires_at
      FROM profile_notes
      WHERE user_id = ? AND expires_at > NOW()
      ORDER BY created_at DESC
      LIMIT 1
    `, [userId]);
    
    res.json({
      note: notes.length > 0 ? notes[0] : null
    });
  } catch (error) {
    console.error('Error fetching profile note:', error);
    res.status(500).json({ error: 'Failed to fetch profile note' });
  }
});

// Get user's profile note by userId (for viewing other profiles)
router.get('/profile-note/:userId', authMiddleware, async (req, res) => {
  try {
    const db = require('../config/database');
    const { userId } = req.params;
    
    // Get active note (not expired)
    const [notes] = await db.execute(`
      SELECT id, content, created_at, expires_at
      FROM profile_notes
      WHERE user_id = ? AND expires_at > NOW()
      ORDER BY created_at DESC
      LIMIT 1
    `, [userId]);
    
    res.json({
      note: notes.length > 0 ? notes[0] : null
    });
  } catch (error) {
    console.error('Error fetching profile note:', error);
    res.status(500).json({ error: 'Failed to fetch profile note' });
  }
});

// Create/Update profile note (contributor only)
router.post('/profile-note', authMiddleware, contributorMiddleware, async (req, res) => {
  try {
    const db = require('../config/database');
    const { content } = req.body;
    const userId = req.user.id;
    
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Note content is required' });
    }
    
    if (content.length > 40) {
      return res.status(400).json({ error: 'Note must be 40 characters or less' });
    }
    
    // Delete any existing active notes
    await db.execute(
      'DELETE FROM profile_notes WHERE user_id = ?',
      [userId]
    );
    
    // Create new note with 24-hour expiration
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
    
    const [result] = await db.execute(`
      INSERT INTO profile_notes (user_id, content, expires_at)
      VALUES (?, ?, ?)
    `, [userId, content, expiresAt]);
    
    console.log(`✅ Profile note created for user ${userId}, expires at ${expiresAt}`);
    
    res.json({
      message: 'Profile note posted successfully',
      note: {
        id: result.insertId,
        content,
        created_at: new Date(),
        expires_at: expiresAt
      }
    });
  } catch (error) {
    console.error('Error creating profile note:', error);
    res.status(500).json({ error: 'Failed to create profile note' });
  }
});

// Delete profile note
router.delete('/profile-note', authMiddleware, contributorMiddleware, async (req, res) => {
  try {
    const db = require('../config/database');
    const userId = req.user.id;
    
    await db.execute(
      'DELETE FROM profile_notes WHERE user_id = ?',
      [userId]
    );
    
    res.json({ message: 'Profile note deleted successfully' });
  } catch (error) {
    console.error('Error deleting profile note:', error);
    res.status(500).json({ error: 'Failed to delete profile note' });
  }
});

// Lock own thread (Expert level and above)
router.post('/thread/:postId/lock', authMiddleware, async (req, res) => {
  try {
    const db = require('../config/database');
    const { postId } = req.params;
    const userId = req.user.id;
    const { canLockThreads, hasModeratorPrivileges } = require('../utils/contributorCheck');
    
    // Get user's badge from database
    const [users] = await db.execute(
      'SELECT badge, role FROM users WHERE id = ?',
      [userId]
    );
    
    if (users.length === 0) {
      return res.status(403).json({ error: 'User not found' });
    }
    
    const user = { role: users[0].role, badge: users[0].badge };
    
    // PRIORITY: Role (admin/moderator/contributor) > Badge (Expert/Contributor)
    // Admin, Moderator, Contributor roles ALWAYS have lock privileges
    if (!canLockThreads(user)) {
      return res.status(403).json({ 
        error: 'Access denied',
        message: 'This feature requires Forum Expert badge (100+ points) or Contributor/Moderator/Admin role'
      });
    }
    
    // Check if user owns the thread
    const [post] = await db.execute(
      'SELECT user_id, is_locked FROM posts WHERE id = ?',
      [postId]
    );
    
    if (post.length === 0) {
      return res.status(404).json({ error: 'Thread not found' });
    }
    
    // Allow if: owns thread OR is moderator/admin
    if (post[0].user_id !== userId && !hasModeratorPrivileges(user)) {
      return res.status(403).json({ error: 'You can only lock your own threads' });
    }
    
    // Toggle lock status
    const newLockStatus = !post[0].is_locked;
    
    await db.execute(
      'UPDATE posts SET is_locked = ? WHERE id = ?',
      [newLockStatus, postId]
    );
    
    console.log(`✅ Thread ${postId} ${newLockStatus ? 'locked' : 'unlocked'} by user ${userId}`);
    
    res.json({
      message: `Thread ${newLockStatus ? 'locked' : 'unlocked'} successfully`,
      isLocked: newLockStatus
    });
  } catch (error) {
    console.error('Error toggling thread lock:', error);
    res.status(500).json({ error: 'Failed to toggle thread lock' });
  }
});

// Cleanup expired notes (can be called by cron job or manually)
router.post('/cleanup-expired-notes', authMiddleware, async (req, res) => {
  try {
    const db = require('../config/database');
    
    const [result] = await db.execute(
      'DELETE FROM profile_notes WHERE expires_at <= NOW()'
    );
    
    console.log(`✅ Cleaned up ${result.affectedRows} expired notes`);
    
    res.json({
      message: 'Expired notes cleaned up',
      count: result.affectedRows
    });
  } catch (error) {
    console.error('Error cleaning up notes:', error);
    res.status(500).json({ error: 'Failed to cleanup notes' });
  }
});

module.exports = router;
