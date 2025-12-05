# Email Verification Fix

## Problem
When users clicked the email verification link, they got a 404 error. The email was not being verified in the database (email_verified remained 0).

## Root Cause
The verification email was sending the wrong URL:
- **Sent**: `http://localhost:3000/verify/[token]` ❌
- **Expected**: `http://localhost:3000/verify-email/[token]` ✅

The frontend route is `/verify-email/:token` but the email was using `/verify/:token`.

## Solution

### Fixed Email URL
**File: `backend/src/utils/email.js`**

Changed line 50 from:
```javascript
const url = `${process.env.FRONTEND_URL}/verify/${token}`;
```

To:
```javascript
const url = `${process.env.FRONTEND_URL}/verify-email/${token}`;
```

## How It Works Now

### Registration Flow:
1. User registers with email and password
2. Backend creates user with `email_verified = 0` and `status = 'pending'`
3. Backend generates JWT token with `type: 'email_verification'`
4. Backend sends email with link: `http://localhost:3000/verify-email/[token]`
5. User clicks link in email
6. Frontend route `/verify-email/:token` loads VerifyEmail component
7. Component calls backend API: `GET /api/auth/verify/:token`
8. Backend verifies token and updates `email_verified = 1`
9. User sees success message

### Verification Endpoints:
- **Frontend Route**: `/verify-email/:token` (VerifyEmail.js)
- **Backend API**: `GET /api/auth/verify/:token` (auth.js)
- **Email Link**: `http://localhost:3000/verify-email/[token]`

## Testing

### Test 1: Backend API
```bash
cd backend
node test-email-verification.js
```

Expected output:
```
✅ EMAIL VERIFICATION SUCCESSFUL!
Response Status: 200
```

### Test 2: Full Flow
1. **Restart backend server** (to load the fix):
   ```bash
   cd backend
   # Press Ctrl+C
   npm start
   ```

2. **Register a new account**:
   - Go to `http://localhost:3000/register`
   - Fill in the form
   - Submit

3. **Check your email**:
   - Look for "Verify Your School Forum Account"
   - The link should be: `http://localhost:3000/verify-email/[long-token]`

4. **Click the verification link**:
   - Should open the VerifyEmail page
   - Should show: "Your email has been verified! You can now login."
   - Should NOT show 404 error

5. **Check database**:
   ```bash
   cd backend
   node -e "const mysql = require('mysql2/promise'); require('dotenv').config(); (async () => { const conn = await mysql.createConnection({ host: process.env.DB_HOST || 'localhost', user: process.env.DB_USER || 'root', password: process.env.DB_PASSWORD || '', database: process.env.DB_NAME || 'school_forum' }); const [users] = await conn.query('SELECT id, email, email_verified FROM users ORDER BY id DESC LIMIT 1'); console.table(users); await conn.end(); })()"
   ```
   
   The `email_verified` should be `1` for the new user.

## What Changed

### Before (Broken):
```
Email sends: http://localhost:3000/verify/abc123
Frontend route: /verify-email/:token
Result: 404 Not Found ❌
```

### After (Fixed):
```
Email sends: http://localhost:3000/verify-email/abc123
Frontend route: /verify-email/:token
Result: Email verified successfully ✅
```

## Files Modified

1. **backend/src/utils/email.js**
   - Line 50: Changed `/verify/` to `/verify-email/`

2. **backend/test-email-verification.js** (new)
   - Test script to verify the fix works

## Important Notes

1. **Restart Required**: You must restart the backend server for the email URL fix to take effect.

2. **Old Emails Won't Work**: Verification emails sent before this fix will still have the old broken URL. Users will need to request a new verification email (if that feature exists) or admin can manually verify them.

3. **Manual Verification**: If a user can't verify their email, admin can activate their account which automatically verifies the email (this was fixed earlier).

4. **Token Expiration**: Verification tokens expire after 24 hours. After that, users need a new verification email.

## Troubleshooting

### Issue 1: Still getting 404
**Solution**: Make sure you restarted the backend server after the fix.

### Issue 2: "Token expired"
**Solution**: The verification link is older than 24 hours. User needs to register again or request a new verification email.

### Issue 3: Email not received
**Solution**: 
- Check spam folder
- Verify EMAIL_USER and EMAIL_PASS in .env
- Check backend console for email sending logs

### Issue 4: "Invalid verification token"
**Solution**: The token might be corrupted or tampered with. User needs to register again.

## Email Configuration

Make sure your `.env` file has:
```env
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-app-password
FRONTEND_URL=http://localhost:3000
JWT_SECRET=your-secret-key
```

## Summary

✅ Email verification URL fixed
✅ Backend API tested and working
✅ Frontend route matches email URL
✅ Users can now verify their email successfully

**Next step**: Restart your backend server and test with a new registration!
