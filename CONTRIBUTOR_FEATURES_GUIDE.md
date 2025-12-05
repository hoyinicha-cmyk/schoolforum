# Contributor Features Guide

## ✅ Features Implemented!

Tapos na bro! May dalawang bagong features para sa contributors:

### 1. **Profile Notes** (24-hour expiration)
- Post notes on your profile
- Auto-delete after 24 hours
- Max 500 characters
- Only contributors can post

### 2. **Lock/Unlock Own Threads**
- Contributors can lock their own threads
- Locked threads = no more replies
- Useful for marking threads as "Solved" or "Closed"

---

## Setup Instructions:

### Step 1: Run Migration
```bash
add-profile-notes.bat
```

Or manually:
```bash
cd backend
node -e "const migration = require('./src/migrations/006_add_profile_notes'); migration.up().then(() => { console.log('Done!'); process.exit(0); }).catch(err => { console.error(err); process.exit(1); });"
```

### Step 2: Restart Backend
```bash
cd backend
npm start
```

### Step 3: Test Features
1. Login as contributor
2. Go to Profile page
3. See "Profile Note" section
4. Post a note (expires in 24 hours)
5. Create a thread
6. Lock/unlock your thread

---

## Feature Details:

### Profile Notes:

**What it does:**
- Contributors can post a note on their profile
- Note is visible to everyone
- Auto-expires after 24 hours
- Only one active note at a time

**How to use:**
1. Go to your Profile page
2. Click "Add Profile Note"
3. Write your note (max 500 chars)
4. Click "Post Note"
5. Note will show with countdown timer

**Use cases:**
- "Currently working on tutorial series"
- "Available for study group this week"
- "Taking a break, back next Monday"
- "Check out my latest guide in G11 forum"

**Features:**
- ✅ 500 character limit
- ✅ 24-hour expiration
- ✅ Countdown timer
- ✅ Edit/delete anytime
- ✅ Purple gradient design
- ✅ Visible to all users

---

### Lock/Unlock Threads:

**What it does:**
- Contributors can lock their own threads
- Locked threads cannot receive new replies
- Useful for marking threads as solved/closed

**How to use:**
1. Create a thread (as contributor)
2. Click the "..." menu on your thread
3. Click "Lock Thread"
4. Thread is now locked (no more replies)
5. Click "Unlock Thread" to reopen

**Who can lock threads:**
- ✅ Contributors (own threads only)
- ✅ Moderators (any thread)
- ✅ Admins (any thread)

**Use cases:**
- Question answered → Lock thread
- Discussion concluded → Lock thread
- Outdated information → Lock thread
- Want to reopen → Unlock thread

**Visual indicators:**
- 🔒 "Locked" badge on thread
- Reply form hidden when locked
- Lock icon in thread menu

---

## API Endpoints:

### Profile Notes:

**Get Note:**
```
GET /api/contributor/profile-note/:userId
Headers: Authorization: Bearer {token}
```

**Post Note:**
```
POST /api/contributor/profile-note
Headers: Authorization: Bearer {token}
Body: { "content": "Your note here" }
```

**Delete Note:**
```
DELETE /api/contributor/profile-note
Headers: Authorization: Bearer {token}
```

### Thread Locking:

**Toggle Lock:**
```
POST /api/contributor/thread/:postId/lock
Headers: Authorization: Bearer {token}
```

---

## Database Schema:

### profile_notes table:
```sql
CREATE TABLE profile_notes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### posts table (already exists):
- `is_locked` column already present ✅

---

## File Structure:

```
backend/
  src/
    routes/
      contributor.js         ← NEW! Contributor features
    migrations/
      006_add_profile_notes.js  ← NEW! Migration

frontend/
  src/
    components/
      Profile/
        ProfileNotes.js      ← NEW! Profile notes component
    pages/
      Profile.js             ← Updated with notes
      ThreadDetail.js        ← Updated lock permissions
```

---

## Notes:

### Profile Notes:
- Auto-cleanup of expired notes (manual trigger available)
- Only one active note per user
- Posting new note deletes old one
- 24-hour countdown timer
- Contributor-only feature

### Thread Locking:
- Contributors can only lock their own threads
- Moderators/admins can lock any thread
- Locked threads show 🔒 badge
- Reply form hidden when locked
- Can be unlocked anytime

---

## Future Enhancements (Suggestions):

1. **Auto-cleanup cron job** for expired notes
2. **Note history** (view past notes)
3. **Pinned notes** (sticky note on profile)
4. **Rich text formatting** for notes
5. **Lock reason** (why thread was locked)
6. **Lock notifications** (notify followers)

---

Tapos na bro! Run migration then restart backend. Test mo na! 🚀
