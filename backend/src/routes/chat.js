const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');

// Get recent messages (last 10 only)
router.get('/messages', authMiddleware, async (req, res) => {
  try {
    const db = require('../config/database');
    
    const [messages] = await db.execute(`
      SELECT 
        cm.id,
        cm.message,
        cm.created_at as createdAt,
        cm.user_id as userId,
        u.first_name as firstName,
        u.last_name as lastName,
        u.role,
        u.avatar_id as avatarId
      FROM chat_messages cm
      JOIN users u ON cm.user_id = u.id
      ORDER BY cm.created_at DESC
      LIMIT 10
    `);
    
    // Reverse to show oldest first
    res.json({ messages: messages.reverse() });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Send a message
router.post('/messages', authMiddleware, async (req, res) => {
  try {
    const db = require('../config/database');
    const { message } = req.body;
    const userId = req.user.id;
    
    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message cannot be empty' });
    }
    
    if (message.length > 500) {
      return res.status(400).json({ error: 'Message too long (max 500 characters)' });
    }
    
    // Insert message
    const [result] = await db.execute(
      'INSERT INTO chat_messages (user_id, message) VALUES (?, ?)',
      [userId, message.trim()]
    );
    
    // Check for @mentions
    const mentionRegex = /@(\w+)/g;
    const mentions = message.match(mentionRegex);
    
    if (mentions) {
      // Get sender's name
      const [sender] = await db.execute(
        'SELECT first_name, last_name FROM users WHERE id = ?',
        [userId]
      );
      const senderName = `${sender[0].first_name} ${sender[0].last_name}`;
      
      // Process each mention
      for (const mention of mentions) {
        const username = mention.substring(1); // Remove @
        
        // Find user by first name (case insensitive)
        const [users] = await db.execute(
          'SELECT id FROM users WHERE LOWER(first_name) = LOWER(?)',
          [username]
        );
        
        if (users.length > 0 && users[0].id !== userId) {
          // Create notification
          await db.execute(
            'INSERT INTO notifications (user_id, type, message, related_id) VALUES (?, ?, ?, ?)',
            [
              users[0].id,
              'mention',
              `${senderName} mentioned you in chat`,
              result.insertId
            ]
          );
        }
      }
    }
    
    res.json({ 
      success: true,
      messageId: result.insertId
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Clear all chat messages (Admin/Moderator only)
router.delete('/clear', authMiddleware, async (req, res) => {
  try {
    const db = require('../config/database');
    
    // Check if user is admin or moderator
    if (req.user.role !== 'admin' && req.user.role !== 'moderator') {
      return res.status(403).json({ error: 'Only admins and moderators can clear chat' });
    }
    
    // Delete all messages
    await db.execute('DELETE FROM chat_messages');
    
    // Post system message
    const systemMessage = `Chat box has been cleared by ${req.user.firstName} ${req.user.lastName}`;
    await db.execute(
      'INSERT INTO chat_messages (user_id, message) VALUES (?, ?)',
      [req.user.id, systemMessage]
    );
    
    res.json({ 
      success: true,
      message: 'Chat cleared successfully'
    });
  } catch (error) {
    console.error('Error clearing chat:', error);
    res.status(500).json({ error: 'Failed to clear chat' });
  }
});

// Get mention count for current user
router.get('/mention-count', authMiddleware, async (req, res) => {
  try {
    const db = require('../config/database');
    const userName = req.user.firstName.toLowerCase();
    
    // Get user's last chat view time
    const [userResult] = await db.execute(
      'SELECT last_chat_view FROM users WHERE id = ?',
      [req.user.id]
    );
    
    const lastView = userResult[0]?.last_chat_view || new Date(0);
    
    // Count messages that mention the user (case insensitive)
    // Only count messages after last view time
    const [result] = await db.execute(`
      SELECT COUNT(*) as mentionCount
      FROM chat_messages cm
      WHERE cm.user_id != ?
        AND LOWER(cm.message) LIKE ?
        AND cm.created_at > ?
    `, [req.user.id, `%@${userName}%`, lastView]);
    
    res.json({ mentionCount: result[0].mentionCount });
  } catch (error) {
    console.error('Error counting mentions:', error);
    res.status(500).json({ error: 'Failed to count mentions' });
  }
});

// Mark chat as viewed (clears mention count)
router.post('/mark-viewed', authMiddleware, async (req, res) => {
  try {
    const db = require('../config/database');
    
    await db.execute(
      'UPDATE users SET last_chat_view = NOW() WHERE id = ?',
      [req.user.id]
    );
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error marking chat as viewed:', error);
    res.status(500).json({ error: 'Failed to mark as viewed' });
  }
});

module.exports = router;
