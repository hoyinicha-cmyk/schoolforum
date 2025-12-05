# Netflix-Style Email Change Implementation

## ✅ Completed:
1. Database table `email_change_codes` created

## 🔧 Next Steps (implement these):

### Backend Changes:

1. **Add to `backend/src/utils/email.js`:**
```javascript
const sendEmailChangeCode = async (email, firstName, code) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM || `School Forum <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Verify Your New Email Address",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Hi ${firstName},</h2>
        <p>You requested to change your email address. Please enter this code:</p>
        <div style="background: #f0f0f0; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
          ${code}
        </div>
        <p>This code will expire in 10 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
      </div>
    `
  };
  await transporter.sendMail(mailOptions);
};

// Export it
module.exports = {
  sendVerificationEmail,
  sendEmailChangeCode, // ADD THIS
  // ... other exports
};
```

2. **Add routes to `backend/src/routes/auth.js`:**
```javascript
// Request email change code
router.post('/request-email-change', authMiddleware, async (req, res) => {
  const { newEmail } = req.body;
  const userId = req.user.id;
  
  // Generate 6-digit code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  
  // Save to database
  await db.execute(
    'INSERT INTO email_change_codes (user_id, new_email, verification_code, expires_at) VALUES (?, ?, ?, ?)',
    [userId, newEmail, code, expiresAt]
  );
  
  // Send email
  await sendEmailChangeCode(newEmail, req.user.firstName, code);
  
  res.json({ message: 'Verification code sent to new email' });
});

// Verify code and change email
router.post('/verify-email-change', authMiddleware, async (req, res) => {
  const { code } = req.body;
  const userId = req.user.id;
  
  // Check code
  const [rows] = await db.execute(
    'SELECT * FROM email_change_codes WHERE user_id = ? AND verification_code = ? AND used = FALSE AND expires_at > NOW()',
    [userId, code]
  );
  
  if (rows.length === 0) {
    return res.status(400).json({ error: 'Invalid or expired code' });
  }
  
  const newEmail = rows[0].new_email;
  
  // Update email
  await db.execute('UPDATE users SET email = ? WHERE id = ?', [newEmail, userId]);
  
  // Mark code as used
  await db.execute('UPDATE email_change_codes SET used = TRUE WHERE id = ?', [rows[0].id]);
  
  res.json({ message: 'Email changed successfully', newEmail });
});
```

### Frontend Changes (Profile.js):

Add email change flow with code verification similar to password change modal.

## Testing:
1. Go to Profile
2. Click Edit Profile
3. Change email
4. Enter verification code from email
5. Email updated!
