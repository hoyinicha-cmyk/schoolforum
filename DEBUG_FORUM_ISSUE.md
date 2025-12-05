# Debug Forum Issue - Step by Step

## Let's find out what's wrong

### Step 1: Check if migration was run
```bash
cd backend
node test-forum-tables.js
```

**Expected:** All ✅ checkmarks
**If you see ❌:** Run `node run-phc-migration.js`

### Step 2: Check your account status
```bash
cd backend
node check-my-user.js
```

Enter your email. Look for:
- Status: Should be "active" ✅
- Email Verified: Should be "Yes" ✅
- Can Create Posts in General: Should be "Yes" ✅

**If status is "pending":** Run `node activate-my-account.js`

### Step 3: Check backend logs
When you try to create a thread, look at your backend terminal.

You should see:
```
📝 Creating post: { forumType: 'general', userId: X, userStatus: 'active', ... }
```

**What error do you see?**
- "Missing required fields" → Fill in title AND content
- "Email verification required" → Run activate-my-account.js
- "Access denied to G11 forum" → Check your year_level
- "Column 'prefix' doesn't exist" → Run migration
- Something else → Tell me the exact error

### Step 4: Check browser console (F12)
Open browser console and look for:
```
Creating post with data: { ... }
Error creating thread: { ... }
```

**What error message do you see in the browser?**

### Step 5: Test database connection
```bash
cd backend
node -e "require('./src/config/database').then(db => { console.log('✅ DB Connected'); process.exit(0); }).catch(err => { console.error('❌ DB Error:', err.message); process.exit(1); })"
```

## Common Issues and Fixes

### Issue 1: "Column 'prefix' doesn't exist"
**Fix:**
```bash
cd backend
node run-phc-migration.js
npm start
```

### Issue 2: "Access denied" or "Email verification required"
**Fix:**
```bash
cd backend
node activate-my-account.js
# Enter your email
npm start
```

### Issue 3: Can't see G11 forum at all
**Reason:** Your year_level might not be G11, or status is not active

**Check:**
```bash
cd backend
node check-my-user.js
```

**Fix:** Update your year_level in database:
```sql
UPDATE users SET year_level = 'G11', status = 'active' WHERE email = 'your-email@example.com';
```

### Issue 4: Backend not running
**Fix:**
```bash
cd backend
npm start
```

### Issue 5: Frontend not connecting to backend
**Check:** Is backend running on http://localhost:5000?
**Fix:** Make sure backend is running first

## Tell Me:

1. What error message do you see when creating thread?
2. What does `node check-my-user.js` show?
3. What does `node test-forum-tables.js` show?
4. What do you see in backend terminal when you try to create thread?
5. What do you see in browser console (F12)?

With this info, I can fix the exact problem!
