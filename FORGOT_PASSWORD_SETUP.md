# Forgot Password - Setup Complete! ✅

## What Was Added

Added a "Forgot your password?" link to the Login page that connects to the existing forgot password functionality.

## User Flow

### 1. Login Page
- User clicks **"Forgot your password?"** link
- Redirects to `/forgot-password`

### 2. Forgot Password Page (`/forgot-password`)
- User enters their email address
- Clicks "Send Reset Link"
- Backend sends password reset email with token
- User sees: "Reset link sent! Please check your email."

### 3. Email
- User receives email with reset link
- Link format: `http://localhost:3000/reset-password/[token]`
- Token expires after 1 hour

### 4. Reset Password Page (`/reset-password/:token`)
- User clicks link in email
- Opens reset password page
- User enters new password
- Password is updated
- User can login with new password

## Routes

All routes are already configured in `frontend/src/App.js`:

```javascript
<Route path="/login" element={<Login />} />
<Route path="/forgot-password" element={<ForgotPassword />} />
<Route path="/reset-password/:token" element={<ResetPassword />} />
```

## Backend Endpoints

The backend already has the necessary endpoints in `backend/src/routes/auth.js`:

1. **POST `/api/auth/forgot-password`**
   - Accepts: `{ email }`
   - Generates reset token
   - Sends email with reset link

2. **POST `/api/auth/reset-password`**
   - Accepts: `{ token, newPassword }`
   - Validates token
   - Updates password

## Testing

### Test the Flow:

1. **Go to Login Page**
   - `http://localhost:3000/login`
   - You should see "Forgot your password?" link

2. **Click the Link**
   - Should redirect to `/forgot-password`

3. **Enter Email**
   - Enter a registered email (e.g., `1sore@comfythings.com`)
   - Click "Send Reset Link"

4. **Check Email**
   - Look for password reset email
   - Click the reset link

5. **Reset Password**
   - Enter new password
   - Confirm password
   - Submit

6. **Login with New Password**
   - Go back to login
   - Use new password

## Email Configuration

Make sure your `.env` file has email settings:

```env
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-app-password
FRONTEND_URL=http://localhost:3000
```

## Password Requirements

New password must meet these requirements:
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number

## Security Features

- ✅ Reset tokens expire after 1 hour
- ✅ Tokens are single-use (can't be reused)
- ✅ Passwords are hashed with bcrypt
- ✅ Email validation before sending reset link

## UI Changes

**Login Page (`frontend/src/pages/Login.js`):**
- Added "Forgot your password?" link
- Positioned above the "Sign in" button
- Styled in emerald green to match theme

## Files Involved

### Frontend:
- `frontend/src/pages/Login.js` - Added forgot password link
- `frontend/src/pages/ForgotPassword.js` - Request reset link
- `frontend/src/pages/ResetPassword.js` - Reset password form
- `frontend/src/App.js` - Routes configuration

### Backend:
- `backend/src/routes/auth.js` - Forgot/reset endpoints
- `backend/src/utils/email.js` - Send reset email
- `backend/src/models/User.js` - Update password method

## Troubleshooting

### Issue 1: Email not received
**Solution**: 
- Check spam folder
- Verify EMAIL_USER and EMAIL_PASS in .env
- Check backend console for email sending logs

### Issue 2: "Invalid or expired token"
**Solution**: 
- Token expires after 1 hour
- Request a new reset link
- Make sure you're using the latest email

### Issue 3: "Password does not meet requirements"
**Solution**: 
- Use at least 8 characters
- Include uppercase, lowercase, and number
- Example: `NewPass123!`

## Summary

✅ "Forgot your password?" link added to Login page
✅ Links to `/forgot-password` page
✅ User can request password reset
✅ Email sent with reset link
✅ User can reset password via `/reset-password/:token`
✅ All routes properly configured

The forgot password flow is now complete and accessible from the login page!
