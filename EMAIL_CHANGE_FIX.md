# Email Change Migration Fix

## Problema
Ang email change confirmation process ay matagal o hindi gumagana dahil kulang ang database table.

## Root Cause
- Ang code sa `backend/src/routes/auth.js` ay gumagamit ng `email_change_codes` table
- Pero wala pang migration para sa table na ito
- May `email_change_confirmations` table (migration 006) pero iba ang gamit nito
- Kaya nag-fail ang queries at nag-cause ng delays

## Solution
Ginawa ang migration `009_add_email_change_codes.js` na lumilikha ng:

### Table: `email_change_codes`
```sql
CREATE TABLE email_change_codes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  new_email VARCHAR(255) NOT NULL,
  verification_code VARCHAR(10) NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_code (verification_code),
  INDEX idx_expires (expires_at)
)
```

## Paano Gumagana ang Email Change (Two-Step Verification)

### Step 1: Request Email Change
1. User nag-edit ng email sa Profile settings
2. User nag-click ng "Send Confirmation Email"
3. System ay gumagawa ng JWT confirmation token
4. Token ay nase-save sa `email_change_confirmations` table
5. **Confirmation email ay nase-send sa OLD email address** with link

### Step 2: Confirm "Yes, That Was Me"
6. User nag-click ng confirmation link sa OLD email
7. System ay nag-verify ng token
8. System ay nag-mark ng confirmation as confirmed
9. System ay gumagawa ng 6-digit verification code
10. Code ay nase-save sa `email_change_codes` table
11. **Verification code ay nase-send sa NEW email address**

### Step 3: Verify New Email
12. User nag-enter ng 6-digit code sa Profile
13. System ay nag-verify ng code
14. System ay nag-update ng email address
15. Done! ✅

## Files Modified

### Backend
- ✅ `backend/src/migrations/009_add_email_change_codes.js` - New migration for codes table
- ✅ `backend/src/routes/auth.js` - Updated with two-step flow
  - `/request-email-change` - Sends confirmation to OLD email
  - `/confirm-email-change` - Confirms and sends code to NEW email
  - `/verify-email-change` - Verifies code and updates email
- ✅ `backend/src/utils/email.js` - Added `sendEmailChangeConfirmation()` function

### Frontend
- ✅ `frontend/src/pages/Profile.js` - Updated UI with two-step explanation
- ✅ `frontend/src/pages/ConfirmEmailChange.js` - New confirmation page
- ✅ `frontend/src/App.js` - Added `/confirm-email-change` route

### Helper Scripts
- ✅ `run-email-migration.bat` - Helper script to run migration
- ✅ `test-email-change.js` - Database test script

## Testing
1. Restart ang backend server (automatic migration)
2. O run manually: `.\run-email-migration.bat`
3. Test ang email change feature sa profile settings

## Security Features
- ✅ **Two-step verification** - Confirms with OLD email first
- ✅ **JWT tokens** - Secure confirmation links (15 min expiry)
- ✅ **6-digit codes** - Verification for NEW email (10 min expiry)
- ✅ **Email validation** - Checks if email is already taken
- ✅ **One-time use** - Codes are marked as used after verification

## Status
✅ Migration successfully created and executed
✅ Table `email_change_codes` now exists
✅ Table `email_change_confirmations` already exists
✅ Two-step email change flow implemented
✅ Confirmation emails to OLD email working
✅ Verification codes to NEW email working
✅ Frontend UI updated with clear instructions
