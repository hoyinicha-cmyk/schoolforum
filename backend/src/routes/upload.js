const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const User = require('../models/User');
const { authMiddleware, verifiedMiddleware } = require('../middleware/auth');

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads');
fs.mkdir(uploadsDir, { recursive: true }).catch(console.error);

// Photo uploads directory (htdocs/upload-photo)
const photoUploadsDir = path.join(__dirname, '../../../../upload-photo');
fs.mkdir(photoUploadsDir, { recursive: true }).catch(console.error);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${req.user.id}_${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  // Allowed file types for school IDs
  const allowedTypes = ['.jpg', '.jpeg', '.png', '.pdf'];
  const fileExtension = path.extname(file.originalname).toLowerCase();
  
  if (allowedTypes.includes(fileExtension)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Please upload JPG, PNG, or PDF files only.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 // 5MB default
  }
});

// Configure multer for photo uploads (500KB limit)
const photoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, photoUploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `photo_${req.user.id}_${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const photoFilter = (req, file, cb) => {
  const allowedTypes = ['.jpg', '.jpeg', '.png'];
  const fileExtension = path.extname(file.originalname).toLowerCase();
  
  if (allowedTypes.includes(fileExtension)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPG and PNG images are allowed.'), false);
  }
};

const photoUpload = multer({
  storage: photoStorage,
  fileFilter: photoFilter,
  limits: {
    fileSize: 500 * 1024 // 500KB limit
  }
});

// Save school ID number
router.post('/school-id-number', authMiddleware, async (req, res) => {
  try {
    const { schoolIdNumber } = req.body;
    
    if (!schoolIdNumber) {
      return res.status(400).json({
        error: 'School ID number is required'
      });
    }
    
    // Check if user already has a school ID number
    const user = await User.findById(req.user.id);
    if (user && user.school_id_number) {
      return res.status(400).json({
        error: 'School ID number already submitted',
        message: 'You can only submit your school ID number once'
      });
    }
    
    // Validate format (YYYY-YYYY-NN)
    const schoolIdPattern = /^\d{4}-\d{4}-\d{2}$/;
    if (!schoolIdPattern.test(schoolIdNumber)) {
      return res.status(400).json({
        error: 'Invalid format. Please use format: YYYY-YYYY-NN (e.g., 2023-2009-53)'
      });
    }
    
    // Update user record with school ID number
    await User.updateSchoolIdNumber(req.user.id, schoolIdNumber);
    
    res.json({
      message: 'School ID number saved successfully',
      schoolIdNumber
    });
    
  } catch (error) {
    console.error('School ID number save error:', error);
    res.status(500).json({
      error: 'Failed to save School ID number',
      message: error.message || 'Please try again later'
    });
  }
});

// Upload school ID
router.post('/school-id', authMiddleware, verifiedMiddleware, upload.single('schoolId'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No file uploaded',
        message: 'Please select a school ID file to upload'
      });
    }
    
    // Update user record with file path
    const filePath = req.file.filename;
    await User.updateSchoolId(req.user.id, filePath);
    
    res.json({
      message: 'School ID uploaded successfully',
      filename: req.file.filename,
      instructions: [
        'Your school ID has been uploaded',
        'Admin will review your document for verification',
        'You will be notified once your account is approved'
      ]
    });
    
  } catch (error) {
    // Clean up uploaded file if database update fails
    if (req.file) {
      fs.unlink(req.file.path).catch(console.error);
    }
    
    console.error('Upload error:', error);
    res.status(500).json({
      error: 'Upload failed',
      message: error.message || 'Please try again later'
    });
  }
});

// Get uploaded file (admin only)
router.get('/school-id/:userId', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Only allow access to own files or admin access
    if (req.user.id !== parseInt(userId) && req.user.role !== 'admin' && req.user.role !== 'moderator') {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only access your own files'
      });
    }
    
    const user = await User.findById(userId);
    if (!user || !user.school_id_path) {
      return res.status(404).json({
        error: 'File not found',
        message: 'No school ID found for this user'
      });
    }
    
    const filePath = path.join(uploadsDir, user.school_id_path);
    
    try {
      await fs.access(filePath);
      res.sendFile(filePath);
    } catch (err) {
      return res.status(404).json({
        error: 'File not found',
        message: 'The uploaded file could not be found'
      });
    }
    
  } catch (error) {
    console.error('File access error:', error);
    res.status(500).json({
      error: 'Failed to access file',
      message: 'Please try again later'
    });
  }
});

// Delete uploaded file (cleanup after verification)
router.delete('/school-id/:userId', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Only admins can delete files after verification
    if (req.user.role !== 'admin' && req.user.role !== 'moderator') {
      return res.status(403).json({
        error: 'Access denied',
        message: 'Only administrators can delete files'
      });
    }
    
    const user = await User.findById(userId);
    if (!user || !user.school_id_path) {
      return res.status(404).json({
        error: 'File not found',
        message: 'No school ID found for this user'
      });
    }
    
    const filePath = path.join(uploadsDir, user.school_id_path);
    
    try {
      await fs.unlink(filePath);
      await User.deleteSchoolId(userId);
      
      res.json({
        message: 'File deleted successfully',
        note: 'School ID removed after verification'
      });
    } catch (err) {
      console.error('File deletion error:', err);
      // Still update database even if file deletion fails
      await User.deleteSchoolId(userId);
      
      res.json({
        message: 'File record cleared',
        note: 'File may have been already deleted'
      });
    }
    
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({
      error: 'Failed to delete file',
      message: 'Please try again later'
    });
  }
});

// Get upload status
router.get('/status', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    res.json({
      status: user.status,
      emailVerified: user.email_verified,
      schoolIdUploaded: !!user.school_id_path,
      canUpload: user.email_verified && user.status === 'pending',
      nextSteps: getNextSteps(user)
    });
    
  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({
      error: 'Failed to check status',
      message: 'Please try again later'
    });
  }
});

function getNextSteps(user) {
  const steps = [];
  
  if (!user.email_verified) {
    steps.push('Verify your email address');
  } else if (!user.school_id_path) {
    steps.push('Upload your school ID for verification');
  } else if (user.status === 'pending') {
    steps.push('Wait for admin approval');
  } else if (user.status === 'active') {
    steps.push('Account active - enjoy full access!');
  }
  
  return steps;
}

// Upload photo (500KB limit)
router.post('/photo', authMiddleware, photoUpload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No photo uploaded',
        message: 'Please select a photo to upload'
      });
    }
    
    // Update user's profile photo in database
    const photoPath = req.file.filename;
    await User.updateProfilePhoto(req.user.id, photoPath);
    
    console.log(`✅ Profile photo updated for user ${req.user.id}: ${photoPath}`);
    
    res.json({
      message: 'Photo uploaded successfully',
      filename: req.file.filename,
      size: req.file.size,
      path: `/upload-photo/${req.file.filename}`
    });
    
  } catch (error) {
    // Clean up uploaded file if error occurs
    if (req.file) {
      fs.unlink(req.file.path).catch(console.error);
    }
    
    console.error('Photo upload error:', error);
    
    // Check if error is due to file size
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'File too large',
        message: 'Photo must be 500KB or smaller'
      });
    }
    
    res.status(500).json({
      error: 'Upload failed',
      message: error.message || 'Please try again later'
    });
  }
});

module.exports = router;