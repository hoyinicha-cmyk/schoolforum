# Password Reset Guide

## Quick Fix for tulingtuling@example.com

The password has been reset! You can now login with:

- **Email**: `tulingtuling@example.com`
- **Password**: `Tuling123!`

⚠️ **Important**: Change this password after logging in by going to Profile > Change Password

---

## The Issue

The user couldn't login because they didn't remember the password used during registration. The account was properly activated (status: active, email_verified: 1), but the password was incorrect.

---

## Password Requirements

All passwords must meet these requirements:
- Minimum 8 characters
- At least one uppercase letter (A-Z)
- At least one lowercase letter (a-z)
- At least one number (0-9)

Examples of valid passwords:
- `Password123`
- `MyPass2024!`
- `Tuling123!`

---

## How to Reset Any User's Password

### Method 1: Using the Interactive Script

```bash
cd backend
node reset-user-password.js
```

Then follow the prompts:
1. Enter the user's email
2. Enter the new password
3. Confirm the reset

### Method 2: Using the Quick Reset Script

Edit `backend/reset-tuling-password.js` and change:
```javascript
const email = 'user@example.com';  // Change this
const newPassword = 'NewPass123!';  // Change this
```

Then run:
```bash
cd backend
node reset-tuling-password.js
```

### Method 3: Direct Database Update

```bash
cd backend
node -e "const bcrypt = require('bcryptjs'); const mysql = require('mysql2/promise'); require('dotenv').config(); (async () => { const conn = await mysql.createConnection({ host: process.env.DB_HOST || 'localhost', user: process.env.DB_USER || 'root', password: process.env.DB_PASSWORD || '', database: process.env.DB_NAME || 'school_forum' }); const hash = await bcrypt.hash('NewPassword123!', 12); await conn.query('UPDATE users SET password = ? WHERE email = ?', [hash, 'user@example.com']); console.log('Password reset!'); await conn.end(); })()"
```

---

## Testing the Login

### Test 1: Backend API Test
```bash
node test-tuling-login.js
```

Enter the password when prompted to test if it works.

### Test 2: Frontend Login
1. Go to `http://localhost:3000/login`
2. Enter email: `tulingtuling@example.com`
3. Enter password: `Tuling123!`
4. Click "Sign in"

Should redirect to dashboard successfully.

### Test 3: Check Browser Console
If login still fails:
1. Open browser DevTools (F12)
2. Go to Console tab
3. Try to login
4. Check for any error messages
5. Go to Network tab
6. Look for the `/api/auth/login` request
7. Check the response

---

## Common Login Issues

### Issue 1: Wrong Password
**Symptom**: "Invalid credentials" error
**Solution**: Reset the password using one of the methods above

### Issue 2: Account Not Activated
**Symptom**: Can login but limited access
**Solution**: Admin needs to activate the account in admin panel

### Issue 3: Email Not Verified
**Symptom**: Can't access certain features
**Solution**: This is now automatic when admin activates the account

### Issue 4: Account Suspended/Banned
**Symptom**: "Account suspended" or "Account banned" error
**Solution**: Admin needs to reactivate the account

### Issue 5: Frontend Not Connecting to Backend
**Symptom**: Network error, CORS error
**Solution**: 
- Make sure backend is running on port 5000
- Make sure frontend is running on port 3000
- Check CORS settings in backend

---

## Default Account Passwords

For reference, here are the default demo accounts:

| Email | Password | Role | Status |
|-------|----------|------|--------|
| admin@school.edu | AdminPass123! | admin | active |
| moderator@school.edu | ModPass123! | moderator | active |
| student@gmail.com | StudentPass123! | student | active |
| tulingtuling@example.com | Tuling123! | student | active |

---

## Implementing Forgot Password Feature

If you want users to reset their own passwords, you need to implement:

1. **Forgot Password Page** (`/forgot-password`)
   - User enters email
   - Backend sends reset link to email

2. **Reset Password Endpoint**
   - Generates a reset token
   - Sends email with reset link
   - Token expires after 1 hour

3. **Reset Password Page** (`/reset-password/:token`)
   - User enters new password
   - Backend validates token
   - Updates password

This is already partially implemented in your codebase:
- Frontend: `frontend/src/pages/ForgotPassword.js`
- Frontend: `frontend/src/pages/ResetPassword.js`
- Backend: Check `backend/src/routes/auth.js` for reset endpoints

---

## Security Notes

1. **Never share passwords in plain text** - The scripts above are for development/testing only
2. **Always use HTTPS in production** - Passwords should never be sent over HTTP
3. **Implement rate limiting** - Prevent brute force attacks
4. **Use strong password requirements** - Current requirements are good
5. **Consider 2FA** - For additional security
6. **Log password changes** - For audit trail

---

## Summary

✅ Password reset for tulingtuling@example.com
✅ New password: `Tuling123!`
✅ User can now login successfully
✅ Scripts available for future password resets

The login issue was simply a forgotten password. The account activation and email verification are working correctly.
