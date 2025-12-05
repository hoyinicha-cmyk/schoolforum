# Add Welcome Post Guide

## Quick Setup

### Option 1: Using Batch File (Easiest)
1. Double-click `add-welcome-post.bat`
2. Enter your MySQL root password when prompted
3. Done! ✅

### Option 2: Manual SQL Execution
1. Open MySQL command line or phpMyAdmin
2. Select the `school_network` database
3. Run the SQL file: `database/seed-welcome-post.sql`

### Option 3: Command Line
```bash
mysql -u root -p school_network < database/seed-welcome-post.sql
```

## What Gets Created

A pinned welcome post in the **General Discussion** forum with:

- **Title:** 🎉 Welcome to the School Forum!
- **Prefix:** Announcement
- **Author:** Admin (user_id = 1)
- **Status:** Pinned (appears at top)
- **Content:** Comprehensive welcome message including:
  - Forum introduction
  - Available sections
  - Getting started guide
  - Points & badges system explanation
  - Community guidelines
  - Help information

## Post Features

✅ **Pinned** - Always appears at the top of General Discussion
✅ **Announcement prefix** - Clearly marked as official
✅ **Comprehensive guide** - Helps new users understand the forum
✅ **Points system info** - Explains gamification features
✅ **Community guidelines** - Sets expectations

## Verification

After running the script:
1. Start/restart your backend server
2. Login to the forum
3. Go to General Discussion
4. You should see the welcome post pinned at the top!

## Notes

- The post is created by user_id = 1 (admin account)
- Make sure your admin account exists before running
- The post is automatically pinned
- You can edit the content in `database/seed-welcome-post.sql` before running

## Troubleshooting

**Error: User ID 1 doesn't exist**
- Make sure you have an admin account created
- Update the user_id in the SQL file to match your admin's ID

**Error: Database not found**
- Make sure your database is named `school_network`
- Or update the database name in the batch file

**Post not showing**
- Restart your backend server
- Clear browser cache
- Check if the post was created: `SELECT * FROM posts WHERE title LIKE '%Welcome%';`
