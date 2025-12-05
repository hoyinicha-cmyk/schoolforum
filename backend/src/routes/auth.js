const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');

// ⬇️ ADDITION #1 — completo import
const { 
  sendVerificationEmail, 
  sendResetPasswordEmail 
} = require('../utils/email');

const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const registerValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .custom(async (email) => {
      // Check if email already exists
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        throw new Error('Email already registered');
      }
      return true;
    }),

  body('password').isLength({ min: 8 }).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must be at least 8 characters with uppercase, lowercase, and number'),
  body('firstName').trim().isLength({ min: 2, max: 50 }).matches(/^[a-zA-Z\s]+$/)
    .withMessage('First name must be 2-50 characters, letters only'),
  body('lastName').trim().isLength({ min: 2, max: 50 }).matches(/^[a-zA-Z\s]+$/)
    .withMessage('Last name must be 2-50 characters, letters only'),
  body('yearLevel').isIn(['G11', 'G12']).withMessage('Year level must be G11 or G12'),
  body('gender').optional().isIn(['male', 'female', 'prefer_not_to_say']).withMessage('Gender must be male, female, or prefer_not_to_say')
];

const loginValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required')
];

// Register endpoint
router.post('/register', registerValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }
    
    const { email, password, firstName, lastName, yearLevel, gender } = req.body;
    
    const hashedPassword = await bcrypt.hash(password, parseInt(process.env.BCRYPT_ROUNDS) || 12);
    
    const userId = await User.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      yearLevel,
      schoolIdPath: null,
      gender: gender || 'prefer_not_to_say'
    });
    
    const verificationToken = jwt.sign(
      { userId, type: 'email_verification' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    await sendVerificationEmail(email, firstName, verificationToken);
    
    res.status(201).json({
      message: 'Registration successful',
      userId,
      instructions: [
        'Check your email for verification link',
        'Upload your school ID for account approval',
        'Wait for admin verification to access grade-specific content'
      ]
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: 'Registration failed',
      message: 'Please try again later'
    });
  }
});

// Login endpoint
router.post('/login', loginValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }
    
    const { email, password } = req.body;
    
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Email or password is incorrect'
      });
    }
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Email or password is incorrect'
      });
    }

    // Check if user is banned (suspended users can still login)
    if (user.status === 'banned') {
      return res.status(403).json({
        error: 'Account banned',
        message: 'Your account has been permanently banned. Please contact an administrator.'
      });
    }
    
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
    
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });
    
    // Determine user access level
let accessLevel = 'general';

// Admin access
if (user.role === 'admin') {
  accessLevel = 'admin';
}

// Moderator access
else if (user.role === 'moderator') {
  accessLevel = 'moderator';
}

// Active students based on year level
else if (user.status === 'active') {
  accessLevel = user.year_level.toLowerCase();  // "g11" or "g12"
}




    
    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        yearLevel: user.year_level,
        status: user.status,
        role: user.role,
        emailVerified: user.email_verified,
        avatarId: user.avatar_id,
        profilePhoto: user.profile_photo,
        badge: user.badge,
        accessLevel
      },
      token
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Login failed',
      message: 'Please try again later'
    });
  }
});

// Forgot Password
router.post('/forgot-password', [
  body('email').isEmail().withMessage('Valid email required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Invalid email' });
    }

    const { email } = req.body;
    const user = await User.findByEmail(email);

    if (!user) {
      return res.status(404).json({ error: 'Email not found' });
    }

    // ⬇️ ADD THIS SECURITY CHECK
    if (!user.email_verified) {
      return res.status(403).json({
        error: 'Email not verified',
        message: 'Please verify your email before resetting your password.'
      });
    }

    const resetToken = jwt.sign(
      { userId: user.id, type: 'password_reset' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    await sendResetPasswordEmail(email, user.first_name, resetUrl);

    res.json({ message: 'Password reset email sent' });

  } catch (error) {
    console.error('Forgot Password Error:', error);
    res.status(500).json({ error: 'Failed to send reset email' });
  }
});


// Email verification
router.get('/verify/:token', async (req, res) => {
  try {
    const { token } = req.params;
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.type !== 'email_verification') {
      return res.status(400).json({
        error: 'Invalid verification token'
      });
    }
    
    await User.updateEmailVerification(decoded.userId, true);
    
    res.json({
      message: 'Email verified successfully',
      instructions: [
        'Your email has been verified',
        'Upload your school ID for account approval',
        'Wait for admin verification to access grade-specific content'
      ]
    });
    
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(400).json({
        error: 'Verification link expired',
        message: 'Please request a new verification email'
      });
    }
    
    console.error('Verification error:', error);
    res.status(500).json({
      error: 'Verification failed',
      message: 'Please try again later'
    });
  }
});

// Resend verification email
router.post('/resend-verification', [
  body('email').isEmail().withMessage('Valid email required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Invalid email address'
      });
    }

    const { email } = req.body;
    
    const user = await User.findByEmail(email);
    
    if (!user) {
      // Don't reveal if email exists or not for security
      return res.json({
        message: 'If an account exists with this email, a verification link has been sent.'
      });
    }
    
    if (user.email_verified) {
      return res.status(400).json({
        error: 'Email already verified',
        message: 'Your email is already verified. You can log in now.'
      });
    }
    
    // Generate new verification token
    const verificationToken = jwt.sign(
      { userId: user.id, type: 'email_verification' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    await sendVerificationEmail(email, user.first_name, verificationToken);
    
    res.json({
      message: 'Verification email sent successfully',
      instructions: [
        'Check your email inbox',
        'Click the verification link',
        'Return to login after verification'
      ]
    });
    
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({
      error: 'Failed to send verification email',
      message: 'Please try again later'
    });
  }
});

// Profile
// Get current user data with badge
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const db = require('../config/database');
    
    // Fetch user with badge, points, and school ID
    const [users] = await db.execute(`
      SELECT id, email, first_name, last_name, year_level, status, role, 
             email_verified, badge, points, avatar_id, school_id_number
      FROM users 
      WHERE id = ?
    `, [req.user.id]);
    
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = users[0];
    let accessLevel = 'general';
    if (user.status === 'active') {
      if (user.role === 'admin' || user.role === 'moderator') {
        accessLevel = 'full';
      } else {
        accessLevel = user.year_level.toLowerCase();
      }
    }
    
    res.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        yearLevel: user.year_level,
        status: user.status,
        role: user.role,
        emailVerified: user.email_verified,
        badge: user.badge,
        points: user.points,
        avatarId: user.avatar_id,
        schoolIdNumber: user.school_id_number,
        accessLevel
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      error: 'Failed to fetch user data',
      message: 'Please try again later'
    });
  }
});

router.get('/profile', authMiddleware, async (req, res) => {
  try {
    let accessLevel = 'general';
    if (req.user.status === 'active') {
      if (req.user.role === 'admin' || req.user.role === 'moderator') {
        accessLevel = 'full';
      } else {
        accessLevel = req.user.year_level.toLowerCase();
      }
    }
    
    res.json({
      user: {
        id: req.user.id,
        email: req.user.email,
        firstName: req.user.first_name,
        lastName: req.user.last_name,
        yearLevel: req.user.year_level,
        status: req.user.status,
        role: req.user.role,
        emailVerified: req.user.email_verified,
        badge: req.user.badge,
        accessLevel
      }
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({
      error: 'Failed to fetch profile',
      message: 'Please try again later'
    });
  }
});

// Logout
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
});

// Refresh token
router.post('/refresh', authMiddleware, (req, res) => {
  const token = jwt.sign(
    { userId: req.user.id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
  
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
  
  res.json({ message: 'Token refreshed successfully', token });
});

router.post('/reset-password/:token', [
  body('password')
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must be at least 8 characters with uppercase, lowercase, and number')
], async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.type !== 'password_reset') {
      return res.status(400).json({ error: 'Invalid or malformed token' });
    }

    // 🔥 FIX #1 — enforce correct bcrypt rounds everywhere
    const ROUNDS = parseInt(process.env.BCRYPT_ROUNDS) || 12;

    // 🔥 FIX #2 — ALWAYS HASH CORRECTLY
    const hashedPassword = await bcrypt.hash(password, ROUNDS);

    // 🔥 FIX #3 — safe update wrapper
    if (!User.updatePassword) {
      return res.status(500).json({ error: 'Password update function missing' });
    }

    await User.updatePassword(decoded.userId, hashedPassword);

    res.json({ message: 'Password has been successfully reset' });

  } catch (error) {
    console.error('Reset Password Error:', error);

    if (error.name === 'TokenExpiredError') {
      return res.status(400).json({ error: 'Reset link expired' });
    }

    res.status(500).json({ error: 'Password reset failed' });
  }
});


// Netflix-style email change: Request code to NEW email
router.post('/request-email-change', authMiddleware, async (req, res) => {
  try {
    const { newEmail, password } = req.body;
    const userId = req.user.id;
    const db = require('../config/database');
    const bcrypt = require('bcryptjs');
    
    if (!newEmail || !newEmail.includes('@')) {
      return res.status(400).json({ error: 'Valid email required' });
    }
    
    if (!password) {
      return res.status(400).json({ error: 'Password required' });
    }
    
    // Verify password
    const [users] = await db.execute('SELECT password FROM users WHERE id = ?', [userId]);
    const isValidPassword = await bcrypt.compare(password, users[0].password);
    
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Incorrect password' });
    }
    
    // Check if email is already taken
    const [existing] = await db.execute('SELECT id FROM users WHERE email = ? AND id != ?', [newEmail, userId]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Email already in use' });
    }
    
    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const codeExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    
    // Delete old codes
    await db.execute('DELETE FROM email_change_codes WHERE user_id = ?', [userId]);
    
    // Save new code
    await db.execute(
      'INSERT INTO email_change_codes (user_id, new_email, verification_code, expires_at) VALUES (?, ?, ?, ?)',
      [userId, newEmail, code, codeExpiresAt]
    );
    
    // Send code to NEW email
    const { sendEmailChangeCode } = require('../utils/email');
    await sendEmailChangeCode(newEmail, req.user.firstName, code);
    
    res.json({ 
      message: 'Verification code sent to new email',
      newEmail: newEmail
    });
  } catch (error) {
    console.error('Error requesting email change:', error);
    res.status(500).json({ error: 'Failed to send verification code' });
  }
});

// Verify code and change email
router.post('/verify-email-change', authMiddleware, async (req, res) => {
  try {
    const { code, firstName, lastName } = req.body;
    const userId = req.user.id;
    const db = require('../config/database');
    
    if (!code) {
      return res.status(400).json({ error: 'Verification code required' });
    }
    
    // Check code
    const [rows] = await db.execute(
      'SELECT * FROM email_change_codes WHERE user_id = ? AND verification_code = ? AND used = FALSE AND expires_at > NOW()',
      [userId, code]
    );
    
    if (rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired code' });
    }
    
    const newEmail = rows[0].new_email;
    
    // Update email and name
    await db.execute(
      'UPDATE users SET email = ?, first_name = ?, last_name = ?, email_verified = 1 WHERE id = ?',
      [newEmail, firstName, lastName, userId]
    );
    
    // Mark code as used
    await db.execute('UPDATE email_change_codes SET used = TRUE WHERE id = ?', [rows[0].id]);
    
    res.json({ 
      message: 'Email changed successfully',
      newEmail: newEmail
    });
  } catch (error) {
    console.error('Error verifying email change:', error);
    res.status(500).json({ error: 'Failed to change email' });
  }
});

// Update profile
router.put('/update-profile', authMiddleware, async (req, res) => {
  console.log('📝 Update profile request:', req.body);
  console.log('👤 User ID:', req.user.id);

  try {
    const db = require('../config/database');
    const { email, firstName, lastName, avatarId } = req.body;
    const userId = req.user.id;
    
    // Validate input
    if (!email || !firstName || !lastName) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    // Validate avatarId if provided
    if (avatarId !== undefined && (avatarId < 1 || avatarId > 20)) {
      return res.status(400).json({ error: 'Invalid avatar ID' });
    }
    
    console.log('🔍 Getting current user data...');
    // Get current user data
    const [currentUser] = await db.execute('SELECT email, email_verified FROM users WHERE id = ?', [userId]);
    
    if (!currentUser || currentUser.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    console.log('📧 Current email:', currentUser[0].email);
    console.log('📧 New email:', email);
    
    const emailChanged = currentUser[0].email !== email;
    console.log('🔄 Email changed:', emailChanged);
    
    // Check if new email is already taken by another user
    if (emailChanged) {
      const [existingUser] = await db.execute('SELECT id FROM users WHERE email = ? AND id != ?', [email, userId]);
      if (existingUser.length > 0) {
        return res.status(400).json({ error: 'Email already in use' });
      }
    }
    
    // Update profile
    if (emailChanged) {
      console.log('✉️ Email changed - generating verification token...');
      // If email changed, set emailVerified to false and generate new JWT token
      const verificationToken = jwt.sign(
        { userId, type: 'email_verification' },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );
      
      console.log('💾 Updating database...');
      if (avatarId !== undefined) {
        await db.execute(
          'UPDATE users SET email = ?, first_name = ?, last_name = ?, avatar_id = ?, email_verified = 0 WHERE id = ?',
          [email, firstName, lastName, avatarId, userId]
        );
      } else {
        await db.execute(
          'UPDATE users SET email = ?, first_name = ?, last_name = ?, email_verified = 0 WHERE id = ?',
          [email, firstName, lastName, userId]
        );
      }
      
      console.log('📨 Sending verification email...');
      // Send verification email
      try {
        const { sendVerificationEmail } = require('../utils/email');
        await sendVerificationEmail(email, firstName, verificationToken);
        console.log('✅ Verification email sent');
      } catch (emailError) {
        console.error('⚠️ Failed to send verification email:', emailError.message);
        // Continue anyway - user can resend later
      }
      
      console.log('✅ Profile updated with email change');
      res.json({ 
        message: 'Profile updated. Please verify your new email.',
        emailChanged: true,
        emailVerified: false
      });
    } else {
      console.log('📝 Just updating name...');
      // Just update name and avatar
      if (avatarId !== undefined) {
        await db.execute(
          'UPDATE users SET first_name = ?, last_name = ?, avatar_id = ? WHERE id = ?',
          [firstName, lastName, avatarId, userId]
        );
      } else {
        await db.execute(
          'UPDATE users SET first_name = ?, last_name = ? WHERE id = ?',
          [firstName, lastName, userId]
        );
      }
      
      console.log('✅ Profile updated (name only)');
      res.json({ 
        message: 'Profile updated successfully',
        emailChanged: false,
        emailVerified: currentUser[0].email_verified === 1
      });
    }
  } catch (error) {
    console.error('❌ Error updating profile:', error);
    console.error('Stack:', error.stack);
    res.status(500).json({ error: 'Failed to update profile', details: error.message });
  }
});

// Get profile stats
router.get('/profile-stats', authMiddleware, async (req, res) => {
  try {
    const db = require('../config/database');
    const userId = req.user.id;
    
    // Get posts count
    const [postsCount] = await db.execute(
      'SELECT COUNT(*) as count FROM posts WHERE user_id = ?',
      [userId]
    );
    
    // Get replies count
    const [repliesCount] = await db.execute(
      'SELECT COUNT(*) as count FROM replies WHERE user_id = ?',
      [userId]
    );
    
    // Get reactions received on posts
    const [postReactions] = await db.execute(
      'SELECT COUNT(*) as count FROM reactions r JOIN posts p ON r.post_id = p.id WHERE p.user_id = ?',
      [userId]
    );
    
    // Get reactions received on replies
    const [replyReactions] = await db.execute(
      'SELECT COUNT(*) as count FROM reactions r JOIN replies rp ON r.reply_id = rp.id WHERE rp.user_id = ?',
      [userId]
    );
    
    // Get bookmarks count
    const [bookmarksCount] = await db.execute(
      'SELECT COUNT(*) as count FROM bookmarks WHERE user_id = ?',
      [userId]
    );
    
    // Get points and badge
    const [userPoints] = await db.execute(
      'SELECT points, badge FROM users WHERE id = ?',
      [userId]
    );
    
    res.json({
      stats: {
        postsCount: postsCount[0].count,
        repliesCount: repliesCount[0].count,
        reactionsReceived: postReactions[0].count + replyReactions[0].count,
        bookmarksCount: bookmarksCount[0].count,
        points: userPoints[0]?.points || 0,
        badge: userPoints[0]?.badge || 'Forum Newbie'
      }
    });
  } catch (error) {
    console.error('Error fetching profile stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Get user profile by ID
router.get('/user/:userId', authMiddleware, async (req, res) => {
  try {
    const db = require('../config/database');
    const userId = req.params.userId;
    
    const [users] = await db.execute(`
      SELECT 
        id,
        first_name as firstName,
        last_name as lastName,
        year_level,
        role,
        status,
        avatar_id as avatarId,
        created_at
      FROM users
      WHERE id = ?
    `, [userId]);
    
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ user: users[0] });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Get user stats by ID
router.get('/user-stats/:userId', authMiddleware, async (req, res) => {
  try {
    const db = require('../config/database');
    const userId = req.params.userId;
    
    // Get posts count
    const [postsCount] = await db.execute(
      'SELECT COUNT(*) as count FROM posts WHERE user_id = ?',
      [userId]
    );
    
    // Get replies count
    const [repliesCount] = await db.execute(
      'SELECT COUNT(*) as count FROM replies WHERE user_id = ?',
      [userId]
    );
    
    // Get reactions received on posts
    const [postReactions] = await db.execute(
      'SELECT COUNT(*) as count FROM reactions r JOIN posts p ON r.post_id = p.id WHERE p.user_id = ?',
      [userId]
    );
    
    // Get reactions received on replies
    const [replyReactions] = await db.execute(
      'SELECT COUNT(*) as count FROM reactions r JOIN replies rp ON r.reply_id = rp.id WHERE rp.user_id = ?',
      [userId]
    );
    
    res.json({
      stats: {
        postsCount: postsCount[0].count,
        repliesCount: repliesCount[0].count,
        reactionsReceived: postReactions[0].count + replyReactions[0].count
      }
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Get users list for mentions
router.get('/users-list', authMiddleware, async (req, res) => {
  try {
    const db = require('../config/database');
    
    // Only return users who can access ChatBox:
    // 1. Users with special roles (admin, moderator, contributor)
    // 2. Users with Active badge or higher (Forum Active, Forum Expert, Forum Contributor)
    const [users] = await db.execute(`
      SELECT 
        id,
        first_name as firstName,
        last_name as lastName,
        role,
        badge
      FROM users
      WHERE status = 'active'
        AND (
          role IN ('admin', 'moderator', 'contributor')
          OR badge IN ('Forum Active', 'Forum Expert', 'Forum Contributor')
        )
      ORDER BY first_name ASC
    `);
    
    res.json({ users });
  } catch (error) {
    console.error('Error fetching users list:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get user's posts
router.get('/my-posts', authMiddleware, async (req, res) => {
  try {
    const db = require('../config/database');
    const userId = req.user.id;
    
    const [posts] = await db.execute(`
      SELECT 
        p.id,
        p.title,
        p.forum_type as forumType,
        p.created_at as createdAt,
        (SELECT COUNT(*) FROM replies WHERE post_id = p.id) as replyCount,
        p.view_count as viewCount
      FROM posts p
      WHERE p.user_id = ?
      ORDER BY p.created_at DESC
    `, [userId]);
    
    res.json({ posts });
  } catch (error) {
    console.error('Error fetching user posts:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// Get user's activity (replies and reactions)
router.get('/my-activity', authMiddleware, async (req, res) => {
  try {
    const db = require('../config/database');
    const userId = req.user.id;
    
    // Get replies
    const [replies] = await db.execute(`
      SELECT 
        'reply' as type,
        r.created_at as createdAt,
        p.id as postId,
        p.title as postTitle,
        p.forum_type as forumType,
        u.first_name as authorFirstName,
        u.last_name as authorLastName
      FROM replies r
      JOIN posts p ON r.post_id = p.id
      JOIN users u ON p.user_id = u.id
      WHERE r.user_id = ?
      ORDER BY r.created_at DESC
      LIMIT 50
    `, [userId]);
    
    // Get reactions
    const [reactions] = await db.execute(`
      SELECT 
        'reaction' as type,
        r.reaction_type as reactionType,
        r.created_at as createdAt,
        p.id as postId,
        p.title as postTitle,
        p.forum_type as forumType,
        u.first_name as authorFirstName,
        u.last_name as authorLastName
      FROM reactions r
      JOIN posts p ON r.post_id = p.id
      JOIN users u ON p.user_id = u.id
      WHERE r.user_id = ?
      ORDER BY r.created_at DESC
      LIMIT 50
    `, [userId]);
    
    // Combine and sort by date
    const activity = [...replies, ...reactions]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 50);
    
    res.json({ activity });
  } catch (error) {
    console.error('Error fetching user activity:', error);
    res.status(500).json({ error: 'Failed to fetch activity' });
  }
});

// Request password change code (for logged-in users)
router.post('/request-password-change-code', authMiddleware, async (req, res) => {
  try {
    const db = require('../config/database');
    const userId = req.user.id;
    
    // Generate 4-digit code
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    
    // Store code in database
    await db.execute(
      'INSERT INTO password_change_codes (user_id, code, expires_at) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE code = ?, expires_at = ?',
      [userId, code, expiresAt, code, expiresAt]
    );
    
    // Get user email
    const [users] = await db.execute('SELECT email, first_name FROM users WHERE id = ?', [userId]);
    const user = users[0];
    
    // Send email with code
    const { sendPasswordChangeCode } = require('../utils/email');
    await sendPasswordChangeCode(user.email, user.first_name, code);
    
    res.json({ 
      message: 'Verification code sent to your email',
      code // Remove this in production!
    });
  } catch (error) {
    console.error('Error sending password change code:', error);
    res.status(500).json({ error: 'Failed to send verification code' });
  }
});

// Change password with verification code
router.post('/change-password', authMiddleware, [
  body('verificationCode').notEmpty().withMessage('Verification code is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const db = require('../config/database');
    const { verificationCode, newPassword } = req.body;
    const userId = req.user.id;
    
    // Verify code
    const [codes] = await db.execute(
      'SELECT * FROM password_change_codes WHERE user_id = ? AND code = ? AND expires_at > NOW()',
      [userId, verificationCode]
    );
    
    if (codes.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired verification code' });
    }
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update password
    await db.execute('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, userId]);
    
    // Delete used code
    await db.execute('DELETE FROM password_change_codes WHERE user_id = ?', [userId]);
    
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

// Get dashboard statistics (PUBLIC - no auth required)
router.get('/dashboard-stats', async (req, res) => {
  console.log('🎯 Dashboard stats endpoint hit!');
  try {
    const db = require('../config/database');
    console.log('📊 Fetching dashboard statistics...');
    
    // Get posts this week by forum type
    const [weeklyPosts] = await db.execute(`
      SELECT 
        forum_type,
        COUNT(*) as count
      FROM posts
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      GROUP BY forum_type
    `);
    
    // Get latest 10 posts from general forum (public)
    const [recentPosts] = await db.execute(`
      SELECT 
        p.id,
        p.title,
        p.content,
        p.forum_type as forumType,
        p.created_at as createdAt,
        p.view_count as viewCount,
        u.id as authorId,
        u.first_name as authorFirstName,
        u.last_name as authorLastName,
        u.avatar_id as authorAvatar,
        u.year_level as authorYearLevel,
        (SELECT COUNT(*) FROM replies r WHERE r.post_id = p.id) as replyCount
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.forum_type = 'general'
      ORDER BY p.created_at DESC
      LIMIT 10
    `);
    
    // Get newest 10 users with profile info
    const [newestUsers] = await db.execute(`
      SELECT 
        id,
        first_name as firstName,
        last_name as lastName,
        year_level as yearLevel,
        avatar_id as avatarId,
        badge,
        points,
        created_at as createdAt,
        status,
        role
      FROM users
      WHERE status = 'active'
      ORDER BY created_at DESC
      LIMIT 10
    `);

    // Get moderators and admins
    const [moderators] = await db.execute(`
      SELECT 
        id,
        first_name as firstName,
        last_name as lastName,
        year_level as yearLevel,
        avatar_id as avatarId,
        badge,
        points,
        created_at as createdAt,
        status,
        role
      FROM users
      WHERE role IN ('admin', 'moderator') AND status = 'active'
      ORDER BY 
        CASE role 
          WHEN 'admin' THEN 1 
          WHEN 'moderator' THEN 2 
          ELSE 3 
        END,
        created_at ASC
    `);
    
    // Get user counts with DISTINCT to avoid duplicates
    const [userStats] = await db.execute(`
      SELECT 
        COUNT(DISTINCT id) as totalUsers,
        COUNT(DISTINCT CASE WHEN status = 'active' THEN id END) as activeUsers,
        COUNT(DISTINCT CASE WHEN status = 'pending' THEN id END) as pendingUsers,
        COUNT(DISTINCT CASE WHEN status = 'suspended' THEN id END) as suspendedUsers,
        COUNT(DISTINCT CASE WHEN status = 'banned' THEN id END) as bannedUsers
      FROM users
    `);
    
    console.log('📊 User stats:', userStats[0]);
    
    // Format weekly posts data
    const weeklyPostsData = {
      general: 0,
      g11: 0,
      g12: 0
    };
    
    weeklyPosts.forEach(post => {
      weeklyPostsData[post.forum_type] = post.count;
    });
    
    res.json({
      weeklyPosts: weeklyPostsData,
      recentPosts: recentPosts || [],
      newestUsers: newestUsers || [],
      moderators: moderators || [],
      userStats: userStats[0]
    });
  } catch (error) {
    console.error('❌ Error fetching dashboard stats:', error.message);
    console.error('Stack:', error.stack);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics', details: error.message });
  }
});

// Get users by status
router.get('/users-by-status/:status', authMiddleware, async (req, res) => {
  try {
    const { status } = req.params;
    const db = require('../config/database');
    
    // Validate status
    const validStatuses = ['active', 'pending', 'suspended', 'banned'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    let query;
    let params;
    
    if (status === 'suspended' || status === 'banned') {
      // Get both suspended and banned users
      query = `
        SELECT 
          id,
          first_name as firstName,
          last_name as lastName,
          email,
          year_level as yearLevel,
          role,
          status,
          avatar_id as avatarId,
          created_at as createdAt
        FROM users
        WHERE status IN ('suspended', 'banned')
        ORDER BY created_at DESC
      `;
      params = [];
    } else {
      query = `
        SELECT 
          id,
          first_name as firstName,
          last_name as lastName,
          email,
          year_level as yearLevel,
          role,
          status,
          avatar_id as avatarId,
          created_at as createdAt
        FROM users
        WHERE status = ?
        ORDER BY created_at DESC
      `;
      params = [status];
    }
    
    const [users] = await db.execute(query, params);
    
    res.json({ users });
  } catch (error) {
    console.error('Error fetching users by status:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

module.exports = router;
