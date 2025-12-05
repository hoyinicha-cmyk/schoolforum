const db = require('../config/database');

// Badge thresholds and features
const BADGES = {
  'Forum Newbie': { 
    minPoints: 0, 
    maxPoints: 24,
    postsPerDay: 20,
    color: 'bg-gray-100 text-gray-700',
    icon: '🌱'
  },
  'Forum Active': { 
    minPoints: 25, 
    maxPoints: 99,
    postsPerDay: 50,
    color: 'bg-blue-100 text-blue-700',
    icon: '⚡'
  },
  'Forum Expert': { 
    minPoints: 100, 
    maxPoints: 199,
    postsPerDay: 999, // Unlimited
    color: 'bg-purple-100 text-purple-700',
    icon: '🎓'
  },
  'Forum Contributor': { 
    minPoints: 200, 
    maxPoints: Infinity,
    postsPerDay: 999, // Unlimited + perks
    color: 'bg-yellow-100 text-yellow-700',
    icon: '👑'
  }
};

// Point values
const POINTS = {
  CREATE_POST: 5,
  CREATE_REPLY: 2,
  RECEIVE_REACTION: 1,
  POST_BOOKMARKED: 3,
  FOLLOW_USER: 8
};

// Get badge based on points
function getBadgeForPoints(points) {
  for (const [badge, config] of Object.entries(BADGES)) {
    if (points >= config.minPoints && points <= config.maxPoints) {
      return badge;
    }
  }
  return 'Forum Newbie';
}

// Add points to user
async function addPoints(userId, points, action, description) {
  try {
    // Add points to user
    await db.execute(
      'UPDATE users SET points = points + ? WHERE id = ?',
      [points, userId]
    );
    
    // Log in history
    await db.execute(
      'INSERT INTO points_history (user_id, points, action, description) VALUES (?, ?, ?, ?)',
      [userId, points, action, description]
    );
    
    // Get updated points and check badge
    const [users] = await db.execute('SELECT points, badge FROM users WHERE id = ?', [userId]);
    if (users.length > 0) {
      const newPoints = users[0].points;
      const currentBadge = users[0].badge;
      const correctBadge = getBadgeForPoints(newPoints);
      
      // Update badge if changed
      if (currentBadge !== correctBadge) {
        await db.execute('UPDATE users SET badge = ? WHERE id = ?', [correctBadge, userId]);
        console.log(`🎖️ User ${userId} badge updated: ${currentBadge} → ${correctBadge}`);
        return { points: newPoints, badge: correctBadge, badgeChanged: true };
      }
      
      return { points: newPoints, badge: correctBadge, badgeChanged: false };
    }
  } catch (error) {
    console.error('Error adding points:', error);
    throw error;
  }
}

// Check if user can post today
async function canPostToday(userId) {
  try {
    const [users] = await db.execute(
      'SELECT points, badge, posts_today, last_post_date FROM users WHERE id = ?',
      [userId]
    );
    
    if (users.length === 0) return { canPost: false, reason: 'User not found' };
    
    const user = users[0];
    const badge = user.badge || 'Forum Newbie';
    const badgeConfig = BADGES[badge];
    const today = new Date().toISOString().split('T')[0];
    const lastPostDate = user.last_post_date ? new Date(user.last_post_date).toISOString().split('T')[0] : null;
    
    // Reset counter if new day
    if (lastPostDate !== today) {
      await db.execute(
        'UPDATE users SET posts_today = 0, last_post_date = CURDATE() WHERE id = ?',
        [userId]
      );
      return { 
        canPost: true, 
        postsToday: 0, 
        limit: badgeConfig.postsPerDay,
        badge 
      };
    }
    
    // Check limit
    const postsToday = user.posts_today || 0;
    const canPost = postsToday < badgeConfig.postsPerDay;
    
    return { 
      canPost, 
      postsToday, 
      limit: badgeConfig.postsPerDay,
      badge,
      reason: canPost ? null : `Daily limit reached (${badgeConfig.postsPerDay} posts/day for ${badge})`
    };
  } catch (error) {
    console.error('Error checking post limit:', error);
    throw error;
  }
}

// Increment daily post count
async function incrementPostCount(userId) {
  try {
    await db.execute(
      'UPDATE users SET posts_today = posts_today + 1, last_post_date = CURDATE() WHERE id = ?',
      [userId]
    );
  } catch (error) {
    console.error('Error incrementing post count:', error);
    throw error;
  }
}

module.exports = {
  BADGES,
  POINTS,
  getBadgeForPoints,
  addPoints,
  canPostToday,
  incrementPostCount
};
