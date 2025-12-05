const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authMiddleware } = require('../middleware/auth');
const { addPoints, POINTS } = require('../utils/pointsSystem');

// Follow a user
router.post('/follow/:userId', authMiddleware, async (req, res) => {
  const followingId = parseInt(req.params.userId);
  const followerId = req.user.id;

  if (followerId === followingId) {
    return res.status(400).json({ message: 'Cannot follow yourself' });
  }

  try {
    await db.execute(
      'INSERT INTO follows (follower_id, following_id) VALUES (?, ?)',
      [followerId, followingId]
    );

    // Create notification for the followed user
    const followerName = req.user.firstName || 'Someone';
    await db.execute(
      `INSERT INTO notifications (user_id, type, message, related_id) 
       VALUES (?, 'follow', ?, ?)`,
      [followingId, `${followerName} started following you`, followerId]
    );

    // Award points for following someone
    try {
      const pointsResult = await addPoints(
        followerId, 
        POINTS.FOLLOW_USER, 
        'follow_user', 
        `Followed user #${followingId}`
      );
      console.log(`🎯 Awarded ${POINTS.FOLLOW_USER} points for following. Total: ${pointsResult.points}, Badge: ${pointsResult.badge}`);
      if (pointsResult.badgeChanged) {
        console.log(`🎖️ Badge upgraded to: ${pointsResult.badge}`);
      }
    } catch (pointsError) {
      console.error('⚠️ Failed to award points:', pointsError);
      // Don't fail follow action if points fail
    }

    res.json({ message: 'Successfully followed user' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Already following this user' });
    }
    console.error('Follow error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Unfollow a user
router.delete('/unfollow/:userId', authMiddleware, async (req, res) => {
  const followingId = parseInt(req.params.userId);
  const followerId = req.user.id;

  try {
    const [result] = await db.execute(
      'DELETE FROM follows WHERE follower_id = ? AND following_id = ?',
      [followerId, followingId]
    );

    if (result.affectedRows === 0) {
      return res.status(400).json({ message: 'Not following this user' });
    }

    res.json({ message: 'Successfully unfollowed user' });
  } catch (error) {
    console.error('Unfollow error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get followers of a user
router.get('/followers/:userId', authMiddleware, async (req, res) => {
  const userId = parseInt(req.params.userId);

  try {
    const [followers] = await db.execute(
      `SELECT u.id, u.first_name as username, u.email, u.year_level, u.avatar_id as avatarId, f.created_at as followed_at, f.follower_id
       FROM follows f
       JOIN users u ON f.follower_id = u.id
       WHERE f.following_id = ?
       ORDER BY f.created_at DESC`,
      [userId]
    );

    res.json(followers);
  } catch (error) {
    console.error('Get followers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get users that a user is following
router.get('/following/:userId', authMiddleware, async (req, res) => {
  const userId = parseInt(req.params.userId);

  try {
    const [following] = await db.execute(
      `SELECT u.id, u.first_name as username, u.email, u.year_level, u.avatar_id as avatarId, f.created_at as followed_at, f.following_id as followed_id
       FROM follows f
       JOIN users u ON f.following_id = u.id
       WHERE f.follower_id = ?
       ORDER BY f.created_at DESC`,
      [userId]
    );

    res.json(following);
  } catch (error) {
    console.error('Get following error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Check if current user is following another user
router.get('/is-following/:userId', authMiddleware, async (req, res) => {
  const followingId = parseInt(req.params.userId);
  const followerId = req.user.id;

  try {
    const [rows] = await db.execute(
      'SELECT id FROM follows WHERE follower_id = ? AND following_id = ?',
      [followerId, followingId]
    );

    res.json({ isFollowing: rows.length > 0 });
  } catch (error) {
    console.error('Check following error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get follow stats for a user
router.get('/stats/:userId', authMiddleware, async (req, res) => {
  const userId = parseInt(req.params.userId);

  try {
    const [followersCount] = await db.execute(
      'SELECT COUNT(*) as count FROM follows WHERE following_id = ?',
      [userId]
    );

    const [followingCount] = await db.execute(
      'SELECT COUNT(*) as count FROM follows WHERE follower_id = ?',
      [userId]
    );

    res.json({
      followers: followersCount[0].count,
      following: followingCount[0].count
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
