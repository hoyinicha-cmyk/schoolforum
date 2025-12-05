# Profile Photo Setup Guide

## ✅ Setup Complete!

Tapos na bro! Ang uploaded photo na ay magiging profile picture mo na mismo.

## What Was Done:

### 1. Database Migration
- Added `profile_photo` column sa users table
- Stores the filename ng uploaded photo

### 2. Backend Updates
- Updated User model to handle profile photos
- Photo upload endpoint now saves to user profile
- Added static file serving for `/uploads` folder

### 3. Frontend Updates
- Avatar component now shows profile photo if available
- Falls back to avatar ID if no photo uploaded
- Auto-refresh after upload to show new photo

## How to Setup:

### Step 1: Run Migration
```bash
# Run this bat file to add profile_photo column
add-profile-photo.bat
```

Or manually:
```bash
cd backend
node -e "const migration = require('./src/migrations/004_add_profile_photo'); migration.up().then(() => { console.log('Done!'); process.exit(0); }).catch(err => { console.error(err); process.exit(1); });"
```

### Step 2: Restart Backend
```bash
cd backend
npm start
```

## How It Works:

1. **Upload Photo**:
   - Go to Profile → Edit Profile
   - Scroll to "Upload Custom Photo"
   - Select photo (max 500KB)
   - Click "Upload Photo"

2. **Photo is Saved**:
   - File saved to `htdocs/upload-photo/photo_{userId}_{timestamp}.jpg`
   - Filename saved to database `users.profile_photo`

3. **Photo is Displayed**:
   - Avatar component checks if `profilePhoto` exists
   - If yes: Shows uploaded photo
   - If no: Shows avatar based on `avatarId`

## Where Photos Appear:

- ✅ Profile page (your own)
- ✅ User profile pages (other users viewing you)
- ✅ Forum posts (your avatar in posts/replies)
- ✅ Header (top right corner)
- ✅ Anywhere Avatar component is used

## File Structure:

```
htdocs/
  upload-photo/                 ← Profile photos saved here
    photo_1_1701234567890.jpg
    photo_2_1701234567891.png
  your-project/
    backend/
      uploads/                  ← School IDs saved here
      src/
        migrations/
          004_add_profile_photo.js  ← Migration file
        models/
          User.js               ← Updated with profilePhoto
        routes/
          upload.js             ← Photo upload endpoint
        server.js               ← Serves /upload-photo folder
    frontend/
      src/
        components/
          Profile/
            Avatar.js           ← Shows profile photo
        pages/
          Profile.js            ← Upload interface
```

## API Endpoint:

**Upload Photo:**
```
POST http://localhost:5000/api/upload/photo
Headers: Authorization: Bearer {token}
Body: FormData with 'photo' field (max 500KB)
```

**Response:**
```json
{
  "message": "Photo uploaded successfully",
  "filename": "photo_123_1701234567890.jpg",
  "size": 450000,
  "path": "/uploads/photo_123_1701234567890.jpg"
}
```

**Access Photo:**
```
GET http://localhost:5000/upload-photo/photo_123_1701234567890.jpg
```

## Notes:

- Profile photo overrides avatar selection
- If you want to use avatar again, just don't upload a photo
- Photos are 500KB max (JPG/PNG only)
- Old photos are NOT automatically deleted (manual cleanup needed)
- Photos are saved sa `htdocs/upload-photo/` folder (separate from backend)
- Photos are served via `/upload-photo` static route
- School IDs remain in `backend/uploads/` folder

## Important:

Make sure `htdocs/upload-photo/` folder exists! The backend will create it automatically on first upload.

Tapos na bro! Run lang yung migration then restart backend. 🚀
