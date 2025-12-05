# Email Change - Netflix Style ✅

## Simple Flow (Like Netflix)

1. **User enters new email + password**
2. **System sends 6-digit code to NEW email**
3. **User enters code**
4. **Email changed!** ✅

## What Changed

### Backend (`backend/src/routes/auth.js`)
- **Removed**: Complex 2-step confirmation (old email → new email)
- **Added**: Simple password verification + code to new email
- **Endpoint**: `POST /api/auth/request-email-change`
  - Requires: `newEmail`, `password`
  - Verifies password first
  - Sends 6-digit code to NEW email directly

### Frontend (`frontend/src/pages/Profile.js`)
- **Removed**: Confusing 2-step modal
- **Added**: Simple password field in modal
- **Flow**: 
  1. Enter new email + password
  2. Get code in new email
  3. Enter code
  4. Done!

### Database
- **Dropped**: `email_change_confirmations` table (not needed)
- **Kept**: `email_change_codes` table (for verification codes)

### Files Removed
- ❌ `frontend/src/pages/ConfirmEmailChange.js`
- ❌ `backend/src/migrations/006_add_email_change_confirmation.js`
- ❌ `sendEmailChangeConfirmation()` function from `email.js`
- ❌ Route `/confirm-email-change` from App.js

## How It Works Now

```
User clicks "Edit Profile" → Changes email
  ↓
Modal appears: "Enter your password"
  ↓
User enters password → Click "Send Code"
  ↓
Backend verifies password ✓
  ↓
6-digit code sent to NEW email 📧
  ↓
User enters code in modal
  ↓
Email changed! ✅
```

## Security
- Password verification required
- 6-digit code expires in 10 minutes
- Code can only be used once
- Email must not be already taken

## Testing
1. Go to Profile
2. Click "Edit Profile"
3. Change email
4. Enter your password
5. Check new email for code
6. Enter code
7. Done!

Much simpler! 🎉
