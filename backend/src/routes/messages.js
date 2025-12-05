const express = require('express');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Get all conversations (list of users you've chatted with)
router.get('/conversations', authMiddleware, async (req, res) => {
  try {
    const db = require('../config/database');
    const userId = req.user.id;

    const [conversations] = await db.execute(`
      SELECT DISTINCT
        CASE 
          WHEN pm.sender_id = ? THEN pm.receiver_id
          ELSE pm.sender_id
        END as user_id,
        u.first_name as firstName,
        u.last_name as lastName,
        u.avatar_id as avatarId,
        u.role,
        (SELECT message FROM private_messages 
         WHERE (sender_id = ? AND receiver_id = user_id) 
            OR (sender_id = user_id AND receiver_id = ?)
         ORDER BY created_at DESC LIMIT 1) as lastMessage,
        (SELECT created_at FROM private_messages 
         WHERE (sender_id = ? AND receiver_id = user_id) 
            OR (sender_id = user_id AND receiver_id = ?)
         ORDER BY created_at DESC LIMIT 1) as lastMessageTime,
        (SELECT COUNT(*) FROM private_messages 
         WHERE sender_id = user_id AND receiver_id = ? AND is_read = FALSE) as unreadCount
      FROM private_messages pm
      JOIN users u ON u.id = CASE 
        WHEN pm.sender_id = ? THEN pm.receiver_id
        ELSE pm.sender_id
      END
      WHERE pm.sender_id = ? OR pm.receiver_id = ?
      ORDER BY lastMessageTime DESC
    `, [userId, userId, userId, userId, userId, userId, userId, userId, userId]);

    res.json({ conversations });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// Get messages with a specific user
router.get('/conversation/:userId', authMiddleware, async (req, res) => {
  try {
    const db = require('../config/database');
    const currentUserId = req.user.id;
    const otherUserId = req.params.userId;

    // Get messages
    const [messages] = await db.execute(`
      SELECT 
        pm.id,
        pm.sender_id as senderId,
        pm.receiver_id as receiverId,
        pm.message,
        pm.is_read as isRead,
        pm.created_at as createdAt,
        u.first_name as senderFirstName,
        u.last_name as senderLastName,
        u.avatar_id as senderAvatarId
      FROM private_messages pm
      JOIN users u ON pm.sender_id = u.id
      WHERE (pm.sender_id = ? AND pm.receiver_id = ?)
         OR (pm.sender_id = ? AND pm.receiver_id = ?)
      ORDER BY pm.created_at ASC
    `, [currentUserId, otherUserId, otherUserId, currentUserId]);

    // Mark messages as read
    await db.execute(`
      UPDATE private_messages 
      SET is_read = TRUE 
      WHERE sender_id = ? AND receiver_id = ? AND is_read = FALSE
    `, [otherUserId, currentUserId]);

    // Get other user info
    const [users] = await db.execute(`
      SELECT id, first_name as firstName, last_name as lastName, avatar_id as avatarId, role
      FROM users WHERE id = ?
    `, [otherUserId]);

    res.json({ 
      messages,
      otherUser: users[0] || null
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Send a message
router.post('/send', authMiddleware, async (req, res) => {
  try {
    const db = require('../config/database');
    const senderId = req.user.id;
    const { receiverId, message } = req.body;

    if (!receiverId || !message || !message.trim()) {
      return res.status(400).json({ error: 'Receiver and message are required' });
    }

    // Check if receiver exists
    const [users] = await db.execute('SELECT id FROM users WHERE id = ?', [receiverId]);
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Insert message
    const [result] = await db.execute(`
      INSERT INTO private_messages (sender_id, receiver_id, message)
      VALUES (?, ?, ?)
    `, [senderId, receiverId, message.trim()]);

    // Get the created message
    const [newMessage] = await db.execute(`
      SELECT 
        pm.id,
        pm.sender_id as senderId,
        pm.receiver_id as receiverId,
        pm.message,
        pm.is_read as isRead,
        pm.created_at as createdAt,
        u.first_name as senderFirstName,
        u.last_name as senderLastName,
        u.avatar_id as senderAvatarId
      FROM private_messages pm
      JOIN users u ON pm.sender_id = u.id
      WHERE pm.id = ?
    `, [result.insertId]);

    res.json({ message: newMessage[0] });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Get unread message count
router.get('/unread-count', authMiddleware, async (req, res) => {
  try {
    const db = require('../config/database');
    const userId = req.user.id;

    const [result] = await db.execute(`
      SELECT COUNT(*) as count
      FROM private_messages
      WHERE receiver_id = ? AND is_read = FALSE
    `, [userId]);

    res.json({ unreadCount: result[0].count });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ error: 'Failed to fetch unread count' });
  }
});

module.exports = router;
