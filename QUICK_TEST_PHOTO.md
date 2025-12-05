# Quick Test - Profile Photo

## Steps to Test:

### 1. Restart Backend
```bash
# Stop backend (Ctrl+C)
cd backend
npm start
```

### 2. Login Again
- Go to http://localhost:3000/login
- Login with your account
- This will refresh your user data with profilePhoto field

### 3. Go to Profile
- Click Profile in sidebar
- Click "Edit Profile"
- Scroll down to "Upload Custom Photo"

### 4. Upload Photo
- Click upload area
- Select a photo (max 500KB)
- Click "Upload Photo"
- Page will refresh automatically

### 5. Check Result
- Your profile picture should now show the uploaded photo
- Check these places:
  - Profile page (main avatar)
  - Header (top right corner)
  - Forum posts (if you have any)

## Troubleshooting:

### Photo not showing?

1. **Check if photo was uploaded:**
   - Look in `backend/uploads/` folder
   - Should see file like `photo_1_1701234567890.jpg`

2. **Check database:**
   ```bash
   node test-profile-photo.js
   ```

3. **Check browser console:**
   - Open DevTools (F12)
   - Look for errors
   - Check Network tab for failed image requests

4. **Check if backend serves uploads:**
   - Try accessing: http://localhost:5000/uploads/photo_1_1701234567890.jpg
   - (Replace with your actual filename)

5. **Clear localStorage and login again:**
   - Open DevTools Console
   - Run: `localStorage.clear()`
   - Login again

### Still not working?

Check these files were updated:
- ✅ backend/src/models/User.js (has profilePhoto)
- ✅ backend/src/routes/auth.js (returns profilePhoto in login)
- ✅ backend/src/routes/upload.js (saves to database)
- ✅ backend/src/server.js (serves /uploads folder)
- ✅ frontend/src/components/Profile/Avatar.js (shows profilePhoto)

## Debug Commands:

```bash
# Check if column exists
node test-profile-photo.js

# Check uploads folder
dir backend\uploads

# Check if backend is serving files
# Open browser: http://localhost:5000/uploads/
```
