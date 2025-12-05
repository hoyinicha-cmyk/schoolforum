const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '') || req.cookies.token;
    
    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }
    
    console.log('🔐 Token received:', token.substring(0, 20) + '...');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('🔓 Decoded token:', decoded);
    
    const user = await User.findById(decoded.userId);
    console.log('👤 User found:', user ? { id: user.id, email: user.email, role: user.role, status: user.status, badge: user.badge } : 'No user found');
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid token. User not found.' });
    }

    // Check if user is banned (suspended users can still access basic pages)
    if (user.status === 'banned') {
      return res.status(403).json({ 
        error: 'Account banned',
        message: 'Your account has been permanently banned.',
        requiresLogout: true
      });
    }
    
    // Note: Suspended users can login but have limited access (Home, Dashboard only)
    
    req.user = user;
    console.log('✅ User attached to request:', { id: req.user.id, role: req.user.role, status: req.user.status, badge: req.user.badge });
    next();
  } catch (error) {
    console.error('❌ Auth middleware error:', error);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired. Please login again.' });
    }
    
    return res.status(401).json({ error: 'Invalid token.' });
  }
};

const adminMiddleware = (req, res, next) => {
  if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'moderator')) {
    return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
  }
  next();
};

const verifiedMiddleware = (req, res, next) => {
  if (!req.user || !req.user.emailVerified) {
    return res.status(403).json({ 
      error: 'Email verification required.',
      message: 'Please verify your email address before accessing this resource.'
    });
  }
  next();
};

const approvedMiddleware = (req, res, next) => {
  if (!req.user || req.user.status !== 'active') {
    return res.status(403).json({ 
      error: 'Account approval required.',
      message: 'Your account is pending admin approval. You can only access General Discussion.'
    });
  }
  next();
};

const gradeMiddleware = (requiredGrade) => (req, res, next) => {
  if (!req.user || req.user.status !== 'active') {
    return res.status(403).json({ 
      error: 'Account approval required.',
      message: 'Your account must be approved to access grade-specific content.'
    });
  }
  
  if (req.user.role === 'admin' || req.user.role === 'moderator') {
    return next(); // Admins and moderators have full access
  }
  
  if (req.user.year_level !== requiredGrade) {
    return res.status(403).json({ 
      error: 'Grade level access denied.',
      message: `This content is only available for ${requiredGrade} students.`
    });
  }
  
  next();
};

module.exports = {
  authMiddleware,
  adminMiddleware,
  verifiedMiddleware,
  approvedMiddleware,
  gradeMiddleware
};