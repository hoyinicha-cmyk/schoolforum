# Quick Fix - Role Management Issue

## Problem:
- Changed your own role to contributor
- Lost admin access
- Can't see users in Role Management

## Solution:

### Option 1: Restore Admin Role via Database

Run this command to restore your admin role:

```bash
node -e "const db = require('./backend/src/config/database'); db.execute('UPDATE users SET role = \"admin\" WHERE email = \"admin@school.edu\"').then(() => { console.log('Admin role restored!'); process.exit(0); }).catch(err => { console.error(err); process.exit(1); });"
```

### Option 2: Logout and Login

1. Logout from your account
2. Login again
3. Your role will be refreshed from database

### Option 3: Clear LocalStorage

1. Open Browser Console (F12)
2. Run: `localStorage.clear()`
3. Refresh page
4. Login again

## Why This Happened:

When you changed your own role to "contributor":
- Database updated ✅
- But localStorage still has old "admin" role ❌
- Need to refresh the session

## To See Your Current Role:

1. Go to Profile page
2. Look at the badge under your name
3. Should show your current role

## Important:

**DON'T change your own admin role!**
- Always test with other users
- Keep at least one admin account
- Use a test account for role changes

## Test Role Management:

1. Create a test user (or use existing student)
2. Change THEIR role to contributor
3. They logout/login to see changes
4. Your admin role stays safe!
