# Fix "Access Denied" Error When Creating Thread

## Problem
You get "Access denied" error when trying to create a thread.

## Common Causes

### 1. Account Not Active
Your account status might be "pending" instead of "active"

### 2. Email Not Verified
Your email might not be verified (required for G11/G12 forums)

### 3. Wrong Grade Level
Trying to post in G11 forum but you're a G12 student (or vice versa)

## Quick Fix - Check Your Account

Run this command:
```bash
cd backend
node check-my-user.js
```

Enter your email when prompted. You'll see:
- Your account status
- Email verification status
- Which forums you can access
- Why you can't post (if applicable)

## Quick Fix - Activate Your Account

If your status is "pending", run:
```bash
cd backend
node activate-my-account.js
```

Enter your email when prompted. This will:
- Set your status to "active"
- Verify your email
- Give you full forum access

## Manual Fix (Using MySQL)

### Option 1: Activate Specific User
```sql
UPDATE users 
SET status = 'active', email_verified = 1 
WHERE email = 'your-email@example.com';
```

### Option 2: Activate All Pending Users
```sql
UPDATE users 
SET status = 'active', email_verified = 1 
WHERE status = 'pending';
```

## Understanding Forum Access

### General Forum
- ✅ Anyone can post (even pending users)
- ✅ No email verification required
- ✅ No approval required

### G11 Forum
- ❌ Requires: status = 'active'
- ❌ Requires: year_level = 'G11' (or admin/moderator)
- ⚠️  Email verification recommended

### G12 Forum
- ❌ Requires: status = 'active'
- ❌ Requires: year_level = 'G12' (or admin/moderator)
- ⚠️  Email verification recommended

## Check Backend Logs

When you try to create a post, check your backend terminal for:

```
📝 Creating post: { forumType, userId, userStatus, userRole, emailVerified }
```

This will show:
- Which forum you're trying to post in
- Your user status
- Your role
- Email verification status

If access is denied, you'll see:
```
❌ Access denied to G11 forum for user: X Status: pending Year: G11
```

This tells you exactly why access was denied.

## Solutions by Error Message

### "Email verification required"
**Solution:**
```bash
cd backend
node activate-my-account.js
```
Or manually:
```sql
UPDATE users SET email_verified = 1 WHERE email = 'your-email@example.com';
```

### "You need to be an approved G11 student"
**Solution:**
```bash
cd backend
node activate-my-account.js
```
Or manually:
```sql
UPDATE users SET status = 'active' WHERE email = 'your-email@example.com';
```

### "Access denied to G11 forum"
**Possible reasons:**
1. Your status is not 'active'
2. Your year_level is not 'G11'
3. You're not an admin/moderator

**Solution:** Check your account:
```bash
cd backend
node check-my-user.js
```

## Test After Fix

1. **Restart Backend:**
```bash
cd backend
npm start
```

2. **Try Creating Thread:**
   - Go to General forum first (always works)
   - Click "Create Thread"
   - Fill form and submit
   - Should work!

3. **Try Grade Forum:**
   - Go to your grade forum (G11 or G12)
   - Click "Create Thread"
   - Should work if you're active and correct grade

## Still Not Working?

### Check Browser Console (F12)
Look for:
```
Creating post with data: { forumType: "general", ... }
Error creating thread: { error: "...", message: "..." }
```

### Check Backend Terminal
Look for:
```
📝 Creating post: { ... }
🔍 Checking forum access: { ... }
❌ Access denied ...
```

### Common Issues

**Issue 1: "Missing required fields"**
- Make sure you filled in title AND content

**Issue 2: "Access denied to G11 forum"**
- Check your year_level matches (G11 for G11 forum)
- Check your status is 'active'
- Run: `node check-my-user.js`

**Issue 3: "Email verification required"**
- Run: `node activate-my-account.js`

**Issue 4: Still getting errors**
- Check backend logs for detailed error
- Make sure migration was run: `node test-forum-tables.js`
- Make sure database connection works

## Quick Commands Reference

```bash
# Check your account status
cd backend
node check-my-user.js

# Activate your account
node activate-my-account.js

# Check if migration was run
node test-forum-tables.js

# Run migration if needed
node run-phc-migration.js

# Restart backend
npm start
```

## Summary

Most "Access denied" errors are because:
1. ❌ Account status is "pending" → Need "active"
2. ❌ Email not verified → Need verification
3. ❌ Wrong grade level → Post in correct forum

**Quick fix:** Run `node activate-my-account.js` and restart backend!
