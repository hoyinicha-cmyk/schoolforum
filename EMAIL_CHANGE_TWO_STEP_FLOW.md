# Email Change - Two-Step Verification Flow

## Overview
Implemented a secure two-step email change process that confirms with the OLD email first before sending verification code to the NEW email.

## Flow Diagram

```
User wants to change email
         ↓
[Step 1: Request Change]
         ↓
System sends confirmation email to OLD EMAIL
"Was this you? Click to confirm"
         ↓
User clicks confirmation link in OLD email
         ↓
[Step 2: Confirm Request]
         ↓
System generates 6-digit code
         ↓
System sends code to NEW EMAIL
         ↓
User enters code in Profile
         ↓
[Step 3: Verify Code]
         ↓
Email changed successfully! ✅
```

## API Endpoints

### 1. POST `/api/auth/request-email-change`
**Purpose**: Initiate email change request

**Request**:
```json
{
  "newEmail": "newemail@example.com"
}
```

**Response**:
```json
{
  "message": "Confirmation email sent to your current email address",
  "oldEmail": "oldemail@example.com"
}
```

**What it does**:
- Validates new email
- Checks if email is already taken
- Generates JWT confirmation token (15 min expiry)
- Saves to `email_change_confirmations` table
- Sends confirmation email to **OLD email** with link

---

### 2. POST `/api/auth/confirm-email-change`
**Purpose**: Confirm email change request (user clicked link in OLD email)

**Request**:
```json
{
  "token": "jwt_token_from_email_link"
}
```

**Response**:
```json
{
  "message": "Verification code sent to new email",
  "newEmail": "newemail@example.com"
}
```

**What it does**:
- Verifies JWT token
- Checks if confirmation exists and not expired
- Marks confirmation as confirmed
- Generates 6-digit verification code (10 min expiry)
- Saves to `email_change_codes` table
- Sends verification code to **NEW email**

---

### 3. POST `/api/auth/verify-email-change`
**Purpose**: Verify code and complete email change

**Request**:
```json
{
  "code": "123456",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response**:
```json
{
  "message": "Email changed successfully",
  "newEmail": "newemail@example.com"
}
```

**What it does**:
- Verifies 6-digit code
- Checks if code is valid and not expired
- Updates user email in database
- Marks code as used
- Sets `email_verified = 1`

## Database Tables

### `email_change_confirmations`
```sql
CREATE TABLE email_change_confirmations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  old_email VARCHAR(255) NOT NULL,
  new_email VARCHAR(255) NOT NULL,
  confirmation_token VARCHAR(500) NOT NULL,
  confirmed BOOLEAN DEFAULT FALSE,
  reverted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
)
```

### `email_change_codes`
```sql
CREATE TABLE email_change_codes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  new_email VARCHAR(255) NOT NULL,
  verification_code VARCHAR(6) NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
)
```

## Email Templates

### 1. Confirmation Email (to OLD email)
**Subject**: ⚠️ Confirm Email Change Request

**Content**:
- Shows the new email address
- Big button: "✓ Yes, That Was Me - Proceed"
- Warning if user didn't request this
- Explains what happens next
- Link expires in 15 minutes

### 2. Verification Code Email (to NEW email)
**Subject**: Verify Your New Email Address

**Content**:
- Large 6-digit code display
- Code expires in 10 minutes
- Security tips
- Warning not to share code

## Frontend Components

### Profile.js
- Updated email change modal
- Shows two-step process explanation
- Displays both OLD and NEW email addresses
- Clear instructions for users

### ConfirmEmailChange.js (NEW)
- Handles confirmation link from email
- Shows loading state
- Success message with next steps
- Error handling
- Auto-redirects to profile

### App.js
- Added route: `/confirm-email-change`

## Security Features

1. **Two-step verification** - Prevents unauthorized email changes
2. **JWT tokens** - Secure, signed, time-limited tokens
3. **Expiration times**:
   - Confirmation token: 15 minutes
   - Verification code: 10 minutes
4. **One-time use** - Codes/tokens can't be reused
5. **Email validation** - Checks if email already exists
6. **User authentication** - All endpoints require valid JWT

## User Experience

### What the user sees:

1. **In Profile Settings**:
   ```
   🔐 Two-Step Verification Process:
   1. We'll send a confirmation link to your current email
   2. Click the link to confirm "Yes, that was me"
   3. We'll then send a 6-digit code to your new email
   4. Enter the code here to complete the change
   ```

2. **After requesting**:
   ```
   ✅ Confirmation email sent to oldemail@example.com
   
   Please check your current email and click the confirmation link.
   Then we'll send a verification code to your new email: newemail@example.com
   ```

3. **In OLD email**:
   ```
   🔐 Email Change Request
   
   We received a request to change your email address to:
   newemail@example.com
   
   Was this you?
   [✓ Yes, That Was Me - Proceed]
   ```

4. **After clicking link**:
   ```
   ✅ Confirmed!
   
   📧 Check your new email: newemail@example.com
   We've sent a 6-digit verification code.
   ```

5. **In NEW email**:
   ```
   📧 Email Change Verification
   
   [  1  2  3  4  5  6  ]
   
   This code will expire in 10 minutes.
   ```

6. **Back in Profile**:
   ```
   Enter the 6-digit code sent to newemail@example.com
   [______]
   [Verify & Change Email]
   ```

## Testing

Run the test script:
```bash
node test-email-change.js
```

This will verify:
- ✅ Tables exist
- ✅ Insert operations work
- ✅ Select operations work
- ✅ Update operations work
- ✅ Delete operations work

## Why Two-Step?

**Security Benefits**:
- Prevents account takeover if someone gains access to the account
- User can cancel if they didn't request the change
- Confirms ownership of BOTH old and new email addresses
- Similar to how banks and financial services handle email changes

**User Trust**:
- Users feel more secure knowing they'll be notified
- Clear communication about what's happening
- Ability to stop unauthorized changes

## Next Steps for Users

1. Start backend server
2. Start frontend server
3. Login to your account
4. Go to Profile → Edit Profile
5. Change email address
6. Click "Send Confirmation Email"
7. Check OLD email → Click confirmation link
8. Check NEW email → Get 6-digit code
9. Enter code in Profile
10. Done! ✅
