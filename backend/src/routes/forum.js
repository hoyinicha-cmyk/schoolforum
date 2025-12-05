const express = require('express');
const { authMiddleware, verifiedMiddleware, approvedMiddleware, gradeMiddleware } = require('../middleware/auth');
const { addPoints, canPostToday, incrementPostCount, POINTS } = require('../utils/pointsSystem');

const router = express.Router();

// Get general discussion (available to all verified users)
router.get('/general', authMiddleware, verifiedMiddleware, (req, res) => {
  res.json({
    forum: 'General Discussion',
    description: 'Open discussion for all verified students',
    access: 'All verified users',
    posts: [
      {
        id: 1,
        title: 'Welcome to the School Forum!',
        author: 'Admin',
        content: 'This is the general discussion area where all verified students can participate.',
        timestamp: new Date().toISOString(),
        replies: 5
      },
      {
        id: 2,
        title: 'Forum Guidelines',
        author: 'Moderator',
        content: 'Please read and follow our community guidelines for a positive experience.',
        timestamp: new Date().toISOString(),
        replies: 2
      }
    ]
  });
});

// Get G11 forum (G11 students, moderators, and admins only)
router.get('/g11', authMiddleware, verifiedMiddleware, approvedMiddleware, gradeMiddleware('G11'), (req, res) => {
  res.json({
    forum: 'Grade 11 Forum',
    description: 'Discussions for Grade 11 students',
    access: 'G11 students, moderators, and admins',
    posts: [
      {
        id: 3,
        title: 'G11 Study Groups',
        author: 'Student_G11',
        content: 'Looking for study partners for upcoming exams.',
        timestamp: new Date().toISOString(),
        replies: 8
      },
      {
        id: 4,
        title: 'Subject Selection Help',
        author: 'G11_Helper',
        content: 'Need advice on choosing electives for next semester?',
        timestamp: new Date().toISOString(),
        replies: 12
      }
    ]
  });
});

// Get G12 forum (G12 students, moderators, and admins only)
router.get('/g12', authMiddleware, verifiedMiddleware, approvedMiddleware, gradeMiddleware('G12'), (req, res) => {
  res.json({
    forum: 'Grade 12 Forum',
    description: 'Discussions for Grade 12 students',
    access: 'G12 students, moderators, and admins',
    posts: [
      {
        id: 5,
        title: 'College Applications',
        author: 'Senior2024',
        content: 'Tips and experiences with college application process.',
        timestamp: new Date().toISOString(),
        replies: 15
      },
      {
        id: 6,
        title: 'Graduation Requirements',
        author: 'G12_Student',
        content: 'Anyone have the updated graduation requirements checklist?',
        timestamp: new Date().toISOString(),
        replies: 6
      }
    ]
  });
});

// Get post forum type (for navigation from notifications)
router.get('/post/:postId/forum-type', authMiddleware, async (req, res) => {
  try {
    const { postId } = req.params;
    const db = require('../config/database');
    
    const [posts] = await db.execute(
      'SELECT forum_type FROM posts WHERE id = ?',
      [postId]
    );
    
    if (posts.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    res.json({ forumType: posts[0].forum_type });
  } catch (error) {
    console.error('Error getting post forum type:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get posts for a specific forum
router.get('/:forumType/posts', authMiddleware, async (req, res) => {
  try {
    const { forumType } = req.params;
    const db = require('../config/database');
    const userId = req.user.id;
    
    // Validate forum type
    if (!['general', 'g11', 'g12'].includes(forumType)) {
      return res.status(400).json({ error: 'Invalid forum type' });
    }
    
    // Get posts with user info, reactions, and bookmark status
    const [posts] = await db.execute(`
      SELECT 
        p.id, 
        p.title, 
        p.content,
        p.prefix,
        p.user_id as authorId,
        p.has_hidden_content as hasHiddenContent,
        p.is_pinned as isPinned,
        p.is_locked as isLocked,
        p.view_count as viewCount,
        p.created_at as createdAt,
        u.first_name as authorFirstName,
        u.last_name as authorLastName,
        u.role as authorRole,
        u.avatar_id as authorAvatarId,
        u.badge as authorBadge,
        (SELECT COUNT(*) FROM replies WHERE post_id = p.id) as replyCount,
        (SELECT COUNT(*) FROM reactions WHERE post_id = p.id AND reaction_type = 'like') as likeCount,
        (SELECT COUNT(*) FROM reactions WHERE post_id = p.id AND reaction_type = 'love') as loveCount,
        (SELECT COUNT(*) FROM reactions WHERE post_id = p.id AND reaction_type = 'haha') as hahaCount,
        (SELECT COUNT(*) FROM reactions WHERE post_id = p.id AND reaction_type = 'wow') as wowCount,
        (SELECT COUNT(*) FROM reactions WHERE post_id = p.id AND reaction_type = 'sad') as sadCount,
        (SELECT COUNT(*) FROM reactions WHERE post_id = p.id AND reaction_type = 'angry') as angryCount,
        (SELECT reaction_type FROM reactions WHERE post_id = p.id AND user_id = ?) as userReaction,
        (SELECT COUNT(*) FROM bookmarks WHERE post_id = p.id AND user_id = ?) as isBookmarked
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.forum_type = ?
      ORDER BY p.is_pinned DESC, p.created_at DESC
    `, [userId, userId, forumType]);
    
    res.json({ posts });
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// Get single post by ID
router.get('/posts/:postId', authMiddleware, async (req, res) => {
  try {
    const { postId } = req.params;
    const db = require('../config/database');
    const userId = req.user.id;
    
    const [posts] = await db.execute(`
      SELECT 
        p.id, 
        p.title, 
        p.content,
        p.prefix,
        p.forum_type as forumType,
        p.user_id as authorId,
        p.has_hidden_content as hasHiddenContent,
        p.is_pinned as isPinned,
        p.is_locked as isLocked,
        p.view_count as viewCount,
        p.created_at as createdAt,
        u.first_name as authorFirstName,
        u.last_name as authorLastName,
        u.role as authorRole,
        u.avatar_id as authorAvatarId,
        u.badge as authorBadge,
        (SELECT COUNT(*) FROM replies WHERE post_id = p.id) as replyCount,
        (SELECT COUNT(*) FROM reactions WHERE post_id = p.id AND reaction_type = 'like') as likeCount,
        (SELECT COUNT(*) FROM reactions WHERE post_id = p.id AND reaction_type = 'love') as loveCount,
        (SELECT COUNT(*) FROM reactions WHERE post_id = p.id AND reaction_type = 'haha') as hahaCount,
        (SELECT COUNT(*) FROM reactions WHERE post_id = p.id AND reaction_type = 'wow') as wowCount,
        (SELECT COUNT(*) FROM reactions WHERE post_id = p.id AND reaction_type = 'sad') as sadCount,
        (SELECT COUNT(*) FROM reactions WHERE post_id = p.id AND reaction_type = 'angry') as angryCount,
        (SELECT reaction_type FROM reactions WHERE post_id = p.id AND user_id = ?) as userReaction,
        (SELECT COUNT(*) FROM bookmarks WHERE post_id = p.id AND user_id = ?) as isBookmarked
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.id = ?
    `, [userId, userId, postId]);
    
    if (posts.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    const post = posts[0];
    
    // Check if user has access to this forum type
    const forumType = post.forumType;
    const userRole = req.user.role;
    const userYearLevel = req.user.yearLevel;
    
    // Admin and moderators can access all forums
    if (userRole !== 'admin' && userRole !== 'moderator') {
      // Check forum-specific access
      if (forumType === 'g11' && userYearLevel !== 'G11') {
        return res.status(403).json({ error: 'Access denied to this forum' });
      }
      if (forumType === 'g12' && userYearLevel !== 'G12') {
        return res.status(403).json({ error: 'Access denied to this forum' });
      }
    }
    
    // Track unique view - only increment if user hasn't viewed this post before
    try {
      await db.execute(
        'INSERT IGNORE INTO post_views (post_id, user_id) VALUES (?, ?)',
        [postId, userId]
      );
      
      // Update view count based on unique views
      const [viewCount] = await db.execute(
        'SELECT COUNT(*) as count FROM post_views WHERE post_id = ?',
        [postId]
      );
      
      await db.execute(
        'UPDATE posts SET view_count = ? WHERE id = ?',
        [viewCount[0].count, postId]
      );
    } catch (viewError) {
      console.error('Error tracking view:', viewError);
      // Continue even if view tracking fails
    }
    
    res.json({ post: posts[0] });
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({ error: 'Failed to fetch post' });
  }
});

// Get replies for a specific post
router.get('/posts/:postId/replies', authMiddleware, async (req, res) => {
  try {
    const { postId } = req.params;
    const db = require('../config/database');
    const userId = req.user.id;
    
    const [replies] = await db.execute(`
      SELECT 
        r.id,
        r.content,
        r.parent_reply_id as parentReplyId,
        r.user_id as authorId,
        r.has_hidden_content as hasHiddenContent,
        r.created_at as createdAt,
        u.first_name as authorFirstName,
        u.last_name as authorLastName,
        u.role as authorRole,
        u.avatar_id as authorAvatarId,
        u.badge as authorBadge,
        (SELECT COUNT(*) FROM reactions WHERE reply_id = r.id AND reaction_type = 'like') as likeCount,
        (SELECT COUNT(*) FROM reactions WHERE reply_id = r.id AND reaction_type = 'love') as loveCount,
        (SELECT COUNT(*) FROM reactions WHERE reply_id = r.id AND reaction_type = 'haha') as hahaCount,
        (SELECT COUNT(*) FROM reactions WHERE reply_id = r.id AND reaction_type = 'wow') as wowCount,
        (SELECT COUNT(*) FROM reactions WHERE reply_id = r.id AND reaction_type = 'sad') as sadCount,
        (SELECT COUNT(*) FROM reactions WHERE reply_id = r.id AND reaction_type = 'angry') as angryCount,
        (SELECT reaction_type FROM reactions WHERE reply_id = r.id AND user_id = ?) as userReaction
      FROM replies r
      JOIN users u ON r.user_id = u.id
      WHERE r.post_id = ?
      ORDER BY r.created_at ASC
    `, [userId, postId]);
    
    res.json({ replies });
  } catch (error) {
    console.error('Error fetching replies:', error);
    res.status(500).json({ error: 'Failed to fetch replies' });
  }
});

// Get user's accessible forums
router.get('/access', authMiddleware, (req, res) => {
  console.log('🎓 Forum Access Check:', {
    email: req.user.email,
    status: req.user.status,
    role: req.user.role,
    yearLevel: req.user.yearLevel
  });
  
  const accessibleForums = []; // Start with empty array
  
  // Suspended and banned users have NO forum access
  if (req.user.status === 'suspended' || req.user.status === 'banned') {
    console.log('⚠️ User is suspended/banned. No forum access.');
  }
  // Active users get forum access
  else if (req.user.status === 'active') {
    accessibleForums.push('general'); // Active users can access general
    
    if (req.user.role === 'admin' || req.user.role === 'moderator') {
      accessibleForums.push('g11', 'g12');
      console.log('✅ Admin/Moderator: Added general, g11, g12');
    } else if (req.user.yearLevel === 'G11') {
      accessibleForums.push('g11');
      console.log('✅ G11 Student: Added general, g11');
    } else if (req.user.yearLevel === 'G12') {
      accessibleForums.push('g12');
      console.log('✅ G12 Student: Added general, g12');
    } else {
      console.log('⚠️ No grade match. yearLevel:', req.user.yearLevel);
    }
  }
  // Pending users only get general forum
  else if (req.user.status === 'pending') {
    accessibleForums.push('general');
    console.log('ℹ️ Pending user: Only general forum');
  } else {
    console.log('⚠️ Unknown status:', req.user.status);
  }
  
  console.log('📋 Accessible Forums:', accessibleForums);
  
  res.json({
    accessibleForums,
    userStatus: {
      verified: req.user.email_verified,
      approved: req.user.status === 'active',
      yearLevel: req.user.yearLevel,
      role: req.user.role
    }
  });
});

// Create new post
router.post('/posts', authMiddleware, async (req, res) => {
  try {
    const { forumType, prefix, title, content, hasHiddenContent } = req.body;
    const db = require('../config/database');
    
    console.log('📝 Creating post:', { 
      forumType, 
      prefix, 
      title, 
      userId: req.user.id,
      userStatus: req.user.status,
      userRole: req.user.role,
      emailVerified: req.user.emailVerified
    });
    
    // Validate required fields
    if (!forumType || !title || !content) {
      console.error('❌ Missing required fields:', { forumType, title: !!title, content: !!content });
      return res.status(400).json({ error: 'Missing required fields: forumType, title, and content are required' });
    }
    
    // Check email verification for non-general forums
    if (forumType !== 'general' && !req.user.emailVerified) {
      console.error('❌ Email not verified for user:', req.user.id);
      return res.status(403).json({ 
        error: 'Email verification required',
        message: 'Please verify your email to post in this forum. You can still post in General Discussion.'
      });
    }
    
    // Check daily post limit based on badge
    const postCheck = await canPostToday(req.user.id);
    if (!postCheck.canPost) {
      console.error('❌ Daily post limit reached for user:', req.user.id);
      return res.status(429).json({ 
        error: 'Daily post limit reached',
        message: postCheck.reason,
        postsToday: postCheck.postsToday,
        limit: postCheck.limit,
        badge: postCheck.badge
      });
    }
    
    // Validate forum access for grade-specific forums
    if (forumType === 'g11' && !canAccessForum(req.user, 'G11')) {
      console.error('❌ Access denied to G11 forum for user:', req.user.id, 'Status:', req.user.status, 'Year:', req.user.year_level);
      return res.status(403).json({ 
        error: 'Access denied to G11 forum',
        message: 'You need to be an approved G11 student to post here.'
      });
    }
    
    if (forumType === 'g12' && !canAccessForum(req.user, 'G12')) {
      console.error('❌ Access denied to G12 forum for user:', req.user.id, 'Status:', req.user.status, 'Year:', req.user.year_level);
      return res.status(403).json({ 
        error: 'Access denied to G12 forum',
        message: 'You need to be an approved G12 student to post here.'
      });
    }
    
    // Validate HIDEUSER tags - only contributors can use this feature
    const hideUserRegex = /\[HIDEUSER=@[^\]]+\]/i;
    if (hideUserRegex.test(content)) {
      const isContributor = ['contributor', 'moderator', 'admin'].includes(req.user.role);
      if (!isContributor) {
        console.error('❌ Non-contributor tried to use HIDEUSER feature:', req.user.id, 'Role:', req.user.role);
        return res.status(403).json({ 
          error: 'Feature restricted',
          message: 'The [HIDEUSER] feature is only available to contributors and above.'
        });
      }
    }
    
    // Insert post
    const [result] = await db.execute(`
      INSERT INTO posts (user_id, forum_type, prefix, title, content, has_hidden_content)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [req.user.id, forumType, prefix || 'none', title, content, hasHiddenContent || false]);
    
    const postId = result.insertId;
    console.log('✅ Post created successfully:', postId);
    
    // Award points for creating post
    try {
      await incrementPostCount(req.user.id);
      const pointsResult = await addPoints(
        req.user.id, 
        POINTS.CREATE_POST, 
        'create_post', 
        `Created post: "${title}"`
      );
      console.log(`🎯 Awarded ${POINTS.CREATE_POST} points. Total: ${pointsResult.points}, Badge: ${pointsResult.badge}`);
      if (pointsResult.badgeChanged) {
        console.log(`🎖️ Badge upgraded to: ${pointsResult.badge}`);
      }
    } catch (pointsError) {
      console.error('⚠️ Failed to award points:', pointsError);
      // Don't fail post creation if points fail
    }
    
    // Notification logic
    try {
      // If Announcement post in General forum, notify ALL users
      if (prefix === 'announcement' && forumType === 'general' && ['admin', 'moderator'].includes(req.user.role)) {
        // Get all active users except the poster
        const [allUsers] = await db.execute(
          'SELECT id FROM users WHERE status = "active" AND id != ?',
          [req.user.id]
        );
        
        const posterName = `${req.user.firstName} ${req.user.lastName}`;
        
        // Create notification for each user
        for (const user of allUsers) {
          await db.execute(
            `INSERT INTO notifications (user_id, type, message, related_id) 
             VALUES (?, 'announcement', ?, ?)`,
            [
              user.id, 
              `📢 New Announcement: "${title}"`,
              postId
            ]
          );
        }
        console.log(`📢 Notified ${allUsers.length} users about announcement`);
      }
      // For all other posts (including admin posts), notify followers with forum access check
      else {
        console.log(`📢 Checking followers for user ${req.user.id} (${req.user.role})...`);
        
        // Get all followers with their year level and role
        const [followers] = await db.execute(
          `SELECT u.id, u.email, u.year_level, u.role 
           FROM follows f
           JOIN users u ON f.follower_id = u.id
           WHERE f.following_id = ? AND u.status = 'active'`,
          [req.user.id]
        );
        
        console.log(`📢 Found ${followers.length} active followers`);
        
        const posterName = `${req.user.firstName} ${req.user.lastName}`;
        let notifiedCount = 0;
        
        // Filter followers based on forum access
        for (const follower of followers) {
          let canAccess = false;
          
          // Check if follower can access this forum
          if (forumType === 'general') {
            // Everyone can access general forum
            canAccess = true;
          } else if (forumType === 'g11' || forumType === 'g12') {
            // Admin and moderators can access all forums
            if (follower.role === 'admin' || follower.role === 'moderator') {
              canAccess = true;
            }
            // Students can only access their own grade forum
            else if (follower.year_level === forumType.toUpperCase()) {
              canAccess = true;
            }
          }
          
          console.log(`  - ${follower.email} (${follower.role}, ${follower.year_level}): ${canAccess ? '✅ CAN ACCESS' : '❌ NO ACCESS'} ${forumType}`);
          
          // Only send notification if follower can access the forum
          if (canAccess) {
            await db.execute(
              `INSERT INTO notifications (user_id, type, message, related_id) 
               VALUES (?, 'new_post', ?, ?)`,
              [
                follower.id, 
                `${posterName} posted: "${title}"`,
                postId
              ]
            );
            notifiedCount++;
            console.log(`    ✅ Notification sent to ${follower.email}`);
          }
        }
        
        console.log(`📢 Notified ${notifiedCount} out of ${followers.length} followers (filtered by forum access)`);
      }
    } catch (notifError) {
      console.error('⚠️ Failed to send notifications:', notifError);
      // Don't fail the post creation if notification fails
    }
    
    res.json({
      message: 'Post created successfully',
      postId: postId
    });
  } catch (error) {
    console.error('❌ Error creating post:', error.message);
    console.error('Stack:', error.stack);
    res.status(500).json({ 
      error: 'Failed to create post',
      details: error.message 
    });
  }
});

// Create reply
router.post('/posts/:postId/replies', authMiddleware, verifiedMiddleware, async (req, res) => {
  try {
    const { postId } = req.params;
    const { content, hasHiddenContent, parentReplyId } = req.body;
    const db = require('../config/database');
    
    // If parentReplyId is provided, verify it exists and belongs to this post
    if (parentReplyId) {
      const [parentReply] = await db.execute(
        'SELECT id FROM replies WHERE id = ? AND post_id = ?',
        [parentReplyId, postId]
      );
      
      if (parentReply.length === 0) {
        return res.status(400).json({ error: 'Parent reply not found or does not belong to this post' });
      }
    }
    
    // Validate HIDEUSER tags - only contributors can use this feature
    const hideUserRegex = /\[HIDEUSER=@[^\]]+\]/i;
    if (hideUserRegex.test(content)) {
      const isContributor = ['contributor', 'moderator', 'admin'].includes(req.user.role);
      if (!isContributor) {
        console.error('❌ Non-contributor tried to use HIDEUSER feature in reply:', req.user.id, 'Role:', req.user.role);
        return res.status(403).json({ 
          error: 'Feature restricted',
          message: 'The [HIDEUSER] feature is only available to contributors and above.'
        });
      }
    }
    
    const [result] = await db.execute(`
      INSERT INTO replies (post_id, parent_reply_id, user_id, content, has_hidden_content)
      VALUES (?, ?, ?, ?, ?)
    `, [postId, parentReplyId || null, req.user.id, content, hasHiddenContent || false]);
    
    const replyId = result.insertId;
    
    // Award points for creating reply
    try {
      const pointsResult = await addPoints(
        req.user.id, 
        POINTS.CREATE_REPLY, 
        'create_reply', 
        `Replied to post #${postId}`
      );
      console.log(`🎯 Awarded ${POINTS.CREATE_REPLY} points for reply. Total: ${pointsResult.points}, Badge: ${pointsResult.badge}`);
      if (pointsResult.badgeChanged) {
        console.log(`🎖️ Badge upgraded to: ${pointsResult.badge}`);
      }
    } catch (pointsError) {
      console.error('⚠️ Failed to award points:', pointsError);
      // Don't fail reply creation if points fail
    }
    
    res.json({
      message: 'Reply created successfully',
      replyId: replyId
    });
  } catch (error) {
    console.error('Error creating reply:', error);
    res.status(500).json({ error: 'Failed to create reply' });
  }
});

// Edit post
router.put('/posts/:postId', authMiddleware, async (req, res) => {
  try {
    const { postId } = req.params;
    const { title, content, prefix, isLocked, isPinned } = req.body;
    const db = require('../config/database');
    
    // Check if post exists and user is the author or admin/mod
    const [post] = await db.execute(
      'SELECT user_id FROM posts WHERE id = ?',
      [postId]
    );
    
    if (post.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    const isAuthor = post[0].user_id === req.user.id;
    const isAdminOrMod = req.user.role === 'admin' || req.user.role === 'moderator';
    
    if (!isAuthor && !isAdminOrMod) {
      return res.status(403).json({ error: 'You can only edit your own posts' });
    }
    
    // Build update query dynamically based on provided fields
    const updates = [];
    const values = [];
    
    if (title !== undefined) {
      updates.push('title = ?');
      values.push(title);
    }
    if (content !== undefined) {
      updates.push('content = ?');
      values.push(content);
    }
    if (prefix !== undefined && isAuthor) {
      updates.push('prefix = ?');
      values.push(prefix);
    }
    if (isLocked !== undefined && isAdminOrMod) {
      updates.push('is_locked = ?');
      values.push(isLocked ? 1 : 0);
    }
    if (isPinned !== undefined && isAdminOrMod) {
      updates.push('is_pinned = ?');
      values.push(isPinned ? 1 : 0);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }
    
    updates.push('updated_at = NOW()');
    values.push(postId);
    
    // Update post
    await db.execute(
      `UPDATE posts SET ${updates.join(', ')} WHERE id = ?`,
      values
    );
    
    res.json({ message: 'Post updated successfully' });
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ error: 'Failed to update post' });
  }
});

// Delete post
router.delete('/posts/:postId', authMiddleware, async (req, res) => {
  try {
    const { postId } = req.params;
    const db = require('../config/database');
    
    // Check if post exists and user is the author or admin/mod
    const [post] = await db.execute(
      'SELECT user_id FROM posts WHERE id = ?',
      [postId]
    );
    
    if (post.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    const isAuthor = post[0].user_id === req.user.id;
    const isAdminOrMod = req.user.role === 'admin' || req.user.role === 'moderator';
    
    if (!isAuthor && !isAdminOrMod) {
      return res.status(403).json({ error: 'You can only delete your own posts' });
    }
    
    // Delete post (cascade will delete replies, reactions, etc.)
    await db.execute('DELETE FROM posts WHERE id = ?', [postId]);
    
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

// Edit reply
router.put('/replies/:replyId', authMiddleware, async (req, res) => {
  try {
    const { replyId } = req.params;
    const { content } = req.body;
    const db = require('../config/database');
    
    // Check if reply exists and user is the author or admin/mod
    const [reply] = await db.execute(
      'SELECT user_id FROM replies WHERE id = ?',
      [replyId]
    );
    
    if (reply.length === 0) {
      return res.status(404).json({ error: 'Reply not found' });
    }
    
    const isAuthor = reply[0].user_id === req.user.id;
    const isAdminOrMod = req.user.role === 'admin' || req.user.role === 'moderator';
    
    if (!isAuthor && !isAdminOrMod) {
      return res.status(403).json({ error: 'You can only edit your own replies' });
    }
    
    // Update reply
    await db.execute(
      'UPDATE replies SET content = ?, updated_at = NOW() WHERE id = ?',
      [content, replyId]
    );
    
    res.json({ message: 'Reply updated successfully' });
  } catch (error) {
    console.error('Error updating reply:', error);
    res.status(500).json({ error: 'Failed to update reply' });
  }
});

// Delete reply
router.delete('/replies/:replyId', authMiddleware, async (req, res) => {
  try {
    const { replyId } = req.params;
    const db = require('../config/database');
    
    // Check if reply exists and user is the author or admin/mod
    const [reply] = await db.execute(
      'SELECT user_id FROM replies WHERE id = ?',
      [replyId]
    );
    
    if (reply.length === 0) {
      return res.status(404).json({ error: 'Reply not found' });
    }
    
    const isAuthor = reply[0].user_id === req.user.id;
    const isAdminOrMod = req.user.role === 'admin' || req.user.role === 'moderator';
    
    if (!isAuthor && !isAdminOrMod) {
      return res.status(403).json({ error: 'You can only delete your own replies' });
    }
    
    // Delete reply (cascade will delete nested replies)
    await db.execute('DELETE FROM replies WHERE id = ?', [replyId]);
    
    res.json({ message: 'Reply deleted successfully' });
  } catch (error) {
    console.error('Error deleting reply:', error);
    res.status(500).json({ error: 'Failed to delete reply' });
  }
});

// React to post
router.post('/posts/:postId/react', authMiddleware, async (req, res) => {
  try {
    const { postId } = req.params;
    const { reactionType } = req.body;
    const db = require('../config/database');
    
    if (!['like', 'love', 'haha', 'wow', 'sad', 'angry'].includes(reactionType)) {
      return res.status(400).json({ error: 'Invalid reaction type' });
    }
    
    // Check if user already reacted
    const [existing] = await db.execute(
      'SELECT id FROM reactions WHERE user_id = ? AND post_id = ?',
      [req.user.id, postId]
    );
    
    const isNewReaction = existing.length === 0;
    
    if (existing.length > 0) {
      // Update existing reaction
      await db.execute(
        'UPDATE reactions SET reaction_type = ? WHERE user_id = ? AND post_id = ?',
        [reactionType, req.user.id, postId]
      );
    } else {
      // Insert new reaction
      await db.execute(
        'INSERT INTO reactions (user_id, post_id, reaction_type) VALUES (?, ?, ?)',
        [req.user.id, postId, reactionType]
      );
      
      // Award points for new reaction
      try {
        const pointsResult = await addPoints(
          req.user.id, 
          POINTS.REACT, 
          'react', 
          `Reacted to post #${postId}`
        );
        console.log(`🎯 Awarded ${POINTS.REACT} points for reaction. Total: ${pointsResult.points}`);
      } catch (pointsError) {
        console.error('⚠️ Failed to award points:', pointsError);
      }
    }
    
    res.json({ message: 'Reaction added successfully' });
  } catch (error) {
    console.error('Error adding reaction:', error);
    res.status(500).json({ error: 'Failed to add reaction' });
  }
});

// Remove reaction from post
router.delete('/posts/:postId/react', authMiddleware, async (req, res) => {
  try {
    const { postId } = req.params;
    const db = require('../config/database');
    
    await db.execute(
      'DELETE FROM reactions WHERE user_id = ? AND post_id = ?',
      [req.user.id, postId]
    );
    
    res.json({ message: 'Reaction removed successfully' });
  } catch (error) {
    console.error('Error removing reaction:', error);
    res.status(500).json({ error: 'Failed to remove reaction' });
  }
});

// React to reply
router.post('/replies/:replyId/react', authMiddleware, async (req, res) => {
  try {
    const { replyId } = req.params;
    const { reactionType } = req.body;
    const db = require('../config/database');
    
    if (!['like', 'love', 'haha', 'wow', 'sad', 'angry'].includes(reactionType)) {
      return res.status(400).json({ error: 'Invalid reaction type' });
    }
    
    const [existing] = await db.execute(
      'SELECT id FROM reactions WHERE user_id = ? AND reply_id = ?',
      [req.user.id, replyId]
    );
    
    const isNewReaction = existing.length === 0;
    
    if (existing.length > 0) {
      await db.execute(
        'UPDATE reactions SET reaction_type = ? WHERE user_id = ? AND reply_id = ?',
        [reactionType, req.user.id, replyId]
      );
    } else {
      await db.execute(
        'INSERT INTO reactions (user_id, reply_id, reaction_type) VALUES (?, ?, ?)',
        [req.user.id, replyId, reactionType]
      );
      
      // Award points for new reaction
      try {
        const pointsResult = await addPoints(
          req.user.id, 
          POINTS.REACT, 
          'react', 
          `Reacted to reply #${replyId}`
        );
        console.log(`🎯 Awarded ${POINTS.REACT} points for reaction. Total: ${pointsResult.points}`);
      } catch (pointsError) {
        console.error('⚠️ Failed to award points:', pointsError);
      }
    }
    
    res.json({ message: 'Reaction added successfully' });
  } catch (error) {
    console.error('Error adding reaction:', error);
    res.status(500).json({ error: 'Failed to add reaction' });
  }
});

// Remove reaction from reply
router.delete('/replies/:replyId/react', authMiddleware, async (req, res) => {
  try {
    const { replyId } = req.params;
    const db = require('../config/database');
    
    await db.execute(
      'DELETE FROM reactions WHERE user_id = ? AND reply_id = ?',
      [req.user.id, replyId]
    );
    
    res.json({ message: 'Reaction removed successfully' });
  } catch (error) {
    console.error('Error removing reaction:', error);
    res.status(500).json({ error: 'Failed to remove reaction' });
  }
});

// Bookmark post
router.post('/bookmarks/:postId', authMiddleware, async (req, res) => {
  try {
    const { postId } = req.params;
    const db = require('../config/database');
    
    // Check if already bookmarked
    const [existing] = await db.execute(
      'SELECT id FROM bookmarks WHERE user_id = ? AND post_id = ?',
      [req.user.id, postId]
    );
    
    const isNewBookmark = existing.length === 0;
    
    await db.execute(
      'INSERT IGNORE INTO bookmarks (user_id, post_id) VALUES (?, ?)',
      [req.user.id, postId]
    );
    
    // Award points for new bookmark
    if (isNewBookmark) {
      try {
        const pointsResult = await addPoints(
          req.user.id, 
          POINTS.BOOKMARK, 
          'bookmark', 
          `Bookmarked post #${postId}`
        );
        console.log(`🎯 Awarded ${POINTS.BOOKMARK} points for bookmark. Total: ${pointsResult.points}`);
      } catch (pointsError) {
        console.error('⚠️ Failed to award points:', pointsError);
      }
    }
    
    res.json({ message: 'Post bookmarked successfully' });
  } catch (error) {
    console.error('Error bookmarking post:', error);
    res.status(500).json({ error: 'Failed to bookmark post' });
  }
});

// Remove bookmark
router.delete('/bookmarks/:postId', authMiddleware, async (req, res) => {
  try {
    const { postId } = req.params;
    const db = require('../config/database');
    
    await db.execute(
      'DELETE FROM bookmarks WHERE user_id = ? AND post_id = ?',
      [req.user.id, postId]
    );
    
    res.json({ message: 'Bookmark removed successfully' });
  } catch (error) {
    console.error('Error removing bookmark:', error);
    res.status(500).json({ error: 'Failed to remove bookmark' });
  }
});

// Get user's bookmarks
router.get('/bookmarks', authMiddleware, async (req, res) => {
  try {
    const db = require('../config/database');
    const userId = req.user.id;
    
    const [posts] = await db.execute(`
      SELECT 
        p.id, 
        p.title, 
        p.content,
        p.prefix,
        p.forum_type as forumType,
        p.created_at as createdAt,
        u.first_name as authorFirstName,
        u.last_name as authorLastName,
        b.created_at as bookmarkedAt,
        (SELECT COUNT(*) FROM replies WHERE post_id = p.id) as replyCount
      FROM bookmarks b
      JOIN posts p ON b.post_id = p.id
      JOIN users u ON p.user_id = u.id
      WHERE b.user_id = ?
      ORDER BY b.created_at DESC
    `, [userId]);
    
    res.json({ bookmarks: posts });
  } catch (error) {
    console.error('Error fetching bookmarks:', error);
    res.status(500).json({ error: 'Failed to fetch bookmarks' });
  }
});

// Unlock hidden content (requires reaction)
router.post('/posts/:postId/unlock', authMiddleware, async (req, res) => {
  try {
    const { postId } = req.params;
    const db = require('../config/database');
    
    // Check if user has reacted to the post
    const [reaction] = await db.execute(
      'SELECT id FROM reactions WHERE user_id = ? AND post_id = ?',
      [req.user.id, postId]
    );
    
    if (reaction.length === 0) {
      return res.status(403).json({ error: 'You must react to unlock hidden content' });
    }
    
    // Grant access
    await db.execute(
      'INSERT IGNORE INTO hidden_content_access (user_id, post_id) VALUES (?, ?)',
      [req.user.id, postId]
    );
    
    res.json({ message: 'Hidden content unlocked' });
  } catch (error) {
    console.error('Error unlocking content:', error);
    res.status(500).json({ error: 'Failed to unlock content' });
  }
});

function canAccessForum(user, requiredGrade) {
  console.log('🔍 Checking forum access:', {
    userId: user.id,
    status: user.status,
    role: user.role,
    yearLevel: user.year_level,
    requiredGrade
  });
  
  if (user.status !== 'active') {
    console.log('❌ User not active');
    return false;
  }
  
  if (user.role === 'admin' || user.role === 'moderator') {
    console.log('✅ Admin/Moderator access granted');
    return true;
  }
  
  const hasAccess = user.year_level === requiredGrade;
  console.log(hasAccess ? '✅ Grade level matches' : '❌ Grade level mismatch');
  return hasAccess;
}

// Get users who reacted to a post
router.get('/post/:postId/reactions/:reactionType', authMiddleware, async (req, res) => {
  try {
    const db = require('../config/database');
    const { postId, reactionType } = req.params;
    
    const [users] = await db.execute(`
      SELECT 
        u.id,
        u.first_name as firstName,
        u.last_name as lastName,
        u.avatar_id as avatarId
      FROM reactions r
      JOIN users u ON r.user_id = u.id
      WHERE r.post_id = ? AND r.reaction_type = ?
      ORDER BY r.created_at DESC
    `, [postId, reactionType]);
    
    res.json({ users });
  } catch (error) {
    console.error('Error fetching reaction users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get users who reacted to a reply
router.get('/reply/:replyId/reactions/:reactionType', authMiddleware, async (req, res) => {
  try {
    const db = require('../config/database');
    const { replyId, reactionType } = req.params;
    
    const [users] = await db.execute(`
      SELECT 
        u.id,
        u.first_name as firstName,
        u.last_name as lastName,
        u.avatar_id as avatarId
      FROM reactions r
      JOIN users u ON r.user_id = u.id
      WHERE r.reply_id = ? AND r.reaction_type = ?
      ORDER BY r.created_at DESC
    `, [replyId, reactionType]);
    
    res.json({ users });
  } catch (error) {
    console.error('Error fetching reaction users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

module.exports = router;
