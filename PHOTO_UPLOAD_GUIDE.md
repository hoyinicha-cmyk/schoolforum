# Photo Upload Feature - 500KB Limit

## Setup Complete! ✅

Natapos na bro! May photo upload feature na with 500KB limit, integrated na sa Profile page!

## What Was Added:

### Backend (backend/src/routes/upload.js)
- Added new `/api/upload/photo` endpoint
- 500KB file size limit
- Only accepts JPG and PNG images
- Auto-generates unique filenames
- Saves to `backend/uploads/` folder

### Frontend (frontend/src/pages/Profile.js)
- Photo upload integrated sa Profile page
- Located sa edit profile section
- File size validation (500KB max)
- Image preview before upload
- Upload button
- Success/error messages
- Kasama ng Avatar selector

## How to Use:

1. **Start the servers** (if not running):
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm start

   # Terminal 2 - Frontend
   cd frontend
   npm start
   ```

2. **Access the photo upload**:
   - Login to your account
   - Go to Profile page: `http://localhost:3000/profile`
   - Click "Edit Profile" button
   - Scroll down to "Upload Custom Photo" section

3. **Upload a photo**:
   - Click the upload area
   - Select a JPG or PNG image (max 500KB)
   - Preview will show
   - Click "Upload Photo"
   - Done!

## File Storage:

Photos are saved in: `backend/uploads/`
- Format: `photo_{userId}_{timestamp}.jpg`
- Example: `photo_123_1701234567890.jpg`

## API Endpoint:

```
POST http://localhost:5000/api/upload/photo
Headers: Authorization: Bearer {token}
Body: FormData with 'photo' field
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

## Error Handling:

- File too large (>500KB): Returns 400 error
- Invalid file type: Returns 400 error
- No file selected: Returns 400 error
- Server error: Returns 500 error

## Notes:

- Uploads folder is created automatically
- Old upload system (5MB for school IDs) still works
- Photo upload is separate from school ID upload
- All uploads require authentication
- Photo upload is integrated sa Profile page, hindi separate page
- Nasa edit mode ng profile, kasama ng avatar selector

## Folder Structure:

```
backend/
  uploads/           ← Photos saved here
    photo_*.jpg
    photo_*.png
  src/
    routes/
      upload.js      ← Updated with photo upload

frontend/
  src/
    pages/
      Profile.js     ← Photo upload integrated here
```

## Location sa UI:

Profile Page → Edit Profile → Upload Custom Photo (Optional)

Tapos na bro! Test mo na lang. 🚀
