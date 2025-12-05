# Complete PHC Forum Setup Guide

## 🚀 Quick Start (3 Steps)

### Step 1: Run Migration
```bash
cd backend
node run-phc-migration.js
```

### Step 2: Restart Backend
```bash
npm start
```

### Step 3: Test
- Open your forum
- Click "Create Thread"
- Fill in the form
- Submit!

---

## 📋 Detailed Setup

### 1. Check Current Status

First, check if you need the migration:

```bash
cd backend
node test-forum-tables.js
```

**If you see ❌ MISSING**, continue to step 2.
**If you see all ✅**, skip to step 3.

### 2. Run Migration

**Option A - Automatic (Easiest):**
```bash
cd backend
node run-phc-migration.js
```

**Option B - Manual:**
```bash
mysql -u root -p school_forum < database/phc_features_migration.sql
```

### 3. Verify Migration

```bash
cd backend
node test-forum-tables.js
```

Should show all ✅

### 4. Restart Services

**Backend:**
```bash
cd backend
npm start
```

**Frontend (in new terminal):**
```bash
cd frontend
npm start
```

---

## ✅ What's Included

### Features
- ✅ **6 Reactions**: 👍 Like, ❤️ Love, 😂 Haha, 😮 Wow, 😢 Sad, 😠 Angry
- ✅ **Bookmarks**: Save favorite threads
- ✅ **Thread Prefixes**: Question, Tutorial, Discussion, News, Announcement, Help
- ✅ **Hidden Content**: React-to-unlock feature
- ✅ **View Counter**: Track post views
- ✅ **Create Thread**: Modal with all options
- ✅ **Reply System**: With reactions

### Database Tables
- `reactions` - Stores all reactions
- `bookmarks` - Stores bookmarked posts
- `hidden_content_access` - Tracks unlocked content
- `posts` - Updated with prefix, has_hidden_content, view_count
- `replies` - Updated with has_hidden_content

### Components
- `ReactionButton.js` - Reaction picker and display
- `BookmarkButton.js` - Bookmark toggle
- `PrefixBadge.js` - Colored prefix badges
- `HiddenContent.js` - Hidden content display/unlock
- `CreateThreadModal.js` - Thread creation form

### Pages
- `ForumGeneral.js` - Updated with all features
- `ForumG11.js` - Can be updated (see ForumG11Complete.js)
- `ForumG12.js` - Can be updated (see ForumG11Complete.js)

---

## 🧪 Testing

### Test 1: Create Thread
1. Go to forum page
2. Click "Create Thread"
3. Select prefix: "Question"
4. Title: "Test Thread"
5. Content: "This is a test"
6. Click "Create Thread"
7. Should see success message

### Test 2: React to Post
1. Find any post
2. Click "React" button
3. Select 👍 Like
4. Should see reaction count increase

### Test 3: Bookmark Post
1. Find any post
2. Click bookmark icon
3. Icon should turn yellow/filled
4. Click again to remove

### Test 4: Hidden Content
1. Create thread with content:
   ```
   This is visible
   [HIDDEN]This is hidden[/HIDDEN]
   ```
2. Post should show "React to unlock"
3. React to the post
4. Click "Unlock Content"
5. Hidden content revealed

---

## 🐛 Troubleshooting

### Error: "Please try again"

**Cause:** Database tables missing

**Fix:**
```bash
cd backend
node run-phc-migration.js
```

### Error: "Column 'prefix' doesn't exist"

**Cause:** Migration not run

**Fix:**
```bash
cd backend
node run-phc-migration.js
```

### Error: "Access denied to G11 forum"

**Cause:** You're not a G11 student

**Fix:** Use General forum instead, or change your year_level in database

### Error: "Failed to fetch posts"

**Cause:** Backend not running or database connection issue

**Fix:**
1. Check backend is running: `cd backend && npm start`
2. Check .env file has correct database credentials
3. Check MySQL is running

### Posts not showing

**Cause:** No posts in database yet

**Fix:** Create a new thread using "Create Thread" button

---

## 📝 How to Use Features

### Creating Thread with Prefix
1. Click "Create Thread"
2. Select prefix from dropdown
3. Enter title and content
4. Submit

### Adding Hidden Content
1. In thread creation modal
2. Click "+ Add Hidden Content"
3. Or manually type: `[HIDDEN]secret content[/HIDDEN]`
4. Users must react to unlock

### Reacting to Posts
1. Click "React" button
2. Choose emoji
3. Click same emoji to remove
4. Click different emoji to change

### Bookmarking
1. Click bookmark icon (outline)
2. Icon fills and turns yellow
3. Click again to remove

---

## 🔧 Configuration

### Prefix Colors (in PrefixBadge.js)
```javascript
question: Blue (#3B82F6)
tutorial: Green (#10B981)
discussion: Gray (#6B7280)
news: Purple (#8B5CF6)
announcement: Red (#EF4444)
help: Orange (#F59E0B)
```

### Reaction Types (in ReactionButton.js)
```javascript
like: 👍
love: ❤️
haha: 😂
wow: 😮
sad: 😢
angry: 😠
```

---

## 📚 File Structure

```
backend/
  src/
    routes/
      forum.js ✅ All API endpoints
  test-forum-tables.js ✅ Check migration status
  run-phc-migration.js ✅ Run migration automatically

frontend/
  src/
    components/
      Forum/
        ReactionButton.js ✅
        BookmarkButton.js ✅
        PrefixBadge.js ✅
        HiddenContent.js ✅
        CreateThreadModal.js ✅
    pages/
      ForumGeneral.js ✅ Updated
      ForumG11.js (update using ForumG11Complete.js)
      ForumG12.js (update using ForumG11Complete.js)
    services/
      api.js ✅ All API methods

database/
  schema.sql ✅ Complete schema
  phc_features_migration.sql ✅ Migration script
```

---

## 🎯 Next Steps

After setup is complete, you can:

1. **Test all features** - Create threads, react, bookmark
2. **Update G11/G12 pages** - Copy from ForumG11Complete.js
3. **Create Bookmarks page** - Show all bookmarked posts
4. **Add reply creation** - Form to add replies
5. **Add moderation tools** - Pin/lock/delete for admins

---

## ✨ Summary

You now have a fully functional PHCorner-style forum with:
- Reactions (6 types)
- Bookmarks
- Thread prefixes
- Hidden content (react-to-unlock)
- View counters
- Complete UI

**Everything is ready to use!** 🎉

Just run the migration and restart your services.
