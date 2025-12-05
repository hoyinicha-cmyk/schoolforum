# Student Login Test Guide

## Test Accounts

### Working Account (Confirmed)
- **Email**: `student@gmail.com`
- **Password**: `StudentPass123!`
- **Status**: active
- **Role**: student
- **Result**: ✅ Can login successfully

### Accounts That Need Password Reset
- `xaliga2059@chaineor.com` - Password unknown
- `lala@example.com` - Password unknown

## Step-by-Step Test

### 1. Test with Demo Student Account

1. Open browser to `http://localhost:3000/login`
2. Enter:
   - Email: `student@gmail.com`
   - Password: `StudentPass123!`
3. Click "Sign in"
4. **Expected**: Should redirect to `/dashboard`
5. **If it fails**: Check browser console (F12) for errors

### 2. Test with Other Student Accounts

First, reset the password:

```bash
cd backend
node reset-user-password.js
```

Enter:
- Email: `xaliga2059@chaineor.com`
- Password: `Student123!` (or any valid password)

Then try to login with that account.

### 3. Check What's Happening

If login fails, check:

#### A. Browser Console (F12)
Look for:
- JavaScript errors
- Network errors
- API response errors

#### B. Network Tab (F12 > Network)
1. Try to login
2. Find the `/api/auth/login` request
3. Check:
   - Request payload (email/password)
   - Response status (should be 200)
   - Response body (should have user and token)

#### C. Backend Console
Look for:
- Login request logs
- Any error messages
- User authentication logs

## Common Issues

### Issue 1: "Invalid credentials"
**Cause**: Wrong password
**Solution**: Reset password using `reset-user-password.js`

### Issue 2: "Account suspended"
**Cause**: User status is "suspended"
**Solution**: Admin needs to activate the account

### Issue 3: Page doesn't redirect after login
**Cause**: Frontend routing issue
**Solution**: Check browser console for errors

### Issue 4: "Email verification required"
**Cause**: email_verified = 0
**Solution**: Run `fix-email-verification.js` or admin activates the account

### Issue 5: Stuck on loading
**Cause**: Missing `finally` block in login handler
**Solution**: Already fixed in Login.js

## Debugging Steps

### Step 1: Test Backend API Directly
```bash
node test-student-login.js
```

This tests if the backend accepts student logins.

### Step 2: Check Database
```bash
cd backend
node -e "const mysql = require('mysql2/promise'); require('dotenv').config(); (async () => { const conn = await mysql.createConnection({ host: process.env.DB_HOST || 'localhost', user: process.env.DB_USER || 'root', password: process.env.DB_PASSWORD || '', database: process.env.DB_NAME || 'school_forum' }); const [users] = await conn.query('SELECT id, email, first_name, status, role, email_verified FROM users WHERE role = \"student\" AND status = \"active\"'); console.table(users); await conn.end(); })()"
```

This shows all active students.

### Step 3: Test Frontend Login Flow
1. Open browser DevTools (F12)
2. Go to Console tab
3. Try to login
4. Watch for:
   - "🔍 Fetching users with token" (if redirected to admin panel)
   - Any error messages
   - Network requests

### Step 4: Check localStorage
After login attempt:
1. Open DevTools (F12)
2. Go to Application tab
3. Check localStorage:
   - `token` - Should exist
   - `user` - Should have user data
4. If missing, login failed

## What Should Happen (Correct Flow)

### For Students:
1. Enter email/password
2. Click "Sign in"
3. Backend validates credentials
4. Backend checks status (must be active, suspended, or banned)
5. Backend checks email_verified (should be 1)
6. Backend returns token + user data
7. Frontend saves to localStorage
8. Frontend redirects to `/dashboard`
9. Dashboard loads successfully

### For Admin:
1-7. Same as students
8. Frontend redirects to `/home`

### For Moderator:
1-7. Same as students
8. Frontend redirects to `/forum/general`

## Current Status

✅ Backend login works for students (tested with `student@gmail.com`)
✅ Login.js fixed (added finally block and error handling)
✅ AuthContext login function works correctly
✅ Dashboard route protection is correct (only requires auth)

## If Students Still Can't Login

Please provide:
1. **Exact error message** you see
2. **Browser console output** (F12 > Console)
3. **Network request details** (F12 > Network > /api/auth/login)
4. **Which student account** you're testing with
5. **What happens** after clicking "Sign in" (nothing? error? redirect?)

This will help identify the exact issue.

## Quick Fix Commands

### Reset a student password:
```bash
cd backend
node reset-user-password.js
# Enter email and new password
```

### Verify all active students have verified emails:
```bash
cd backend
node fix-email-verification.js
```

### Test if backend accepts student login:
```bash
node test-student-login.js
```

### Check all active students in database:
```bash
cd backend
node test-admin-api.js
```
