# Database Reset Guide

## ⚠️ WARNING
This will **DELETE ALL DATA** from your database and reset AUTO_INCREMENT counters to start from 1.

## What Gets Deleted
- ❌ All users (except default accounts that will be recreated)
- ❌ All forum posts and replies
- ❌ All chat messages
- ❌ All reactions and bookmarks
- ❌ All notifications
- ❌ All follows

## What Gets Reset
- 🔢 All AUTO_INCREMENT counters start from 1
- 🔢 User IDs will be sequential (1, 2, 3, 4...)
- 🔢 Post IDs will be sequential
- 🔢 All other IDs will be sequential

## How to Reset

### Option 1: Using Batch File (Easiest)
```bash
# Just double-click this file:
reset-database.bat
```

### Option 2: Manual Command
```bash
cd backend
node reset-database.js
```

## After Reset

1. **Restart your backend server:**
   ```bash
   cd backend
   npm start
   ```

2. **Default accounts will be recreated:**
   - Admin: admin@school.edu / AdminPass123!
   - Moderator: moderator@school.edu / ModPass123!
   - Student: student@gmail.com / StudentPass123!

3. **All IDs start from 1:**
   - First user created will have ID = 1
   - First post created will have ID = 1
   - etc.

## When to Use This

✅ **Good times to reset:**
- During development/testing
- When you want clean sequential IDs
- After lots of test data accumulation
- Before showing to others

❌ **DO NOT use in production:**
- Never reset a live database
- You will lose all real user data
- Cannot be undone

## Troubleshooting

**Error: "Cannot delete or update a parent row"**
- The script disables foreign key checks, but if this happens:
- Make sure no other connections are using the database
- Restart MySQL server

**Error: "Access denied"**
- Check your .env file has correct database credentials
- Make sure MySQL is running

**Tables not found**
- This is normal if some tables don't exist yet
- The script will skip them and continue

## Technical Details

The script does:
1. Connects to MySQL database
2. Disables foreign key checks
3. Deletes all data from all tables
4. Resets AUTO_INCREMENT to 1 for each table
5. Re-enables foreign key checks
6. Closes connection

Tables reset (in order):
- hidden_content_access
- bookmarks
- reactions
- replies
- posts
- post_views
- follows
- notifications
- chat_messages
- password_reset_codes
- users

## Need Help?

If you encounter issues:
1. Check that MySQL is running
2. Verify .env database credentials
3. Make sure backend server is stopped before resetting
4. Check console output for specific errors
