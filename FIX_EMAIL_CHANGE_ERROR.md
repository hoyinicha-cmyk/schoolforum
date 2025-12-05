# Fix: "Failed to send confirmation email"

## Error
Nakita sa screenshot: **"Failed to send confirmation email"**

## Possible Causes

### 1. Backend Server Not Restarted ⚠️ (MOST LIKELY)
Ang backend server ay gumagamit pa ng OLD CODE.

**Solution:**
```bash
# Stop the backend (Ctrl+C in backend terminal)
# Then restart:
cd backend
npm start
```

**How to verify:**
Pag nag-request ka ng email change, dapat makita mo sa backend terminal:
```
📝 Email change request received
   User ID: 1
   Old email: cautious376@comfythings.com
   New email: cdu2dbfpia@cross.edu.pl
   Checking if email is already taken...
   ✅ Email is available
   Generating JWT token...
   ✅ Token generated
   Deleting old confirmations...
   Saving new confirmation...
   ✅ Confirmation saved to database
   Sending confirmation email to OLD email: cautious376@comfythings.com
   ✅ Confirmation email sent!
```

If you see these logs = ✅ NEW CODE is working
If you DON'T see these logs = ❌ OLD CODE still running - RESTART BACKEND

---

### 2. Email Configuration Missing
Walang EMAIL_USER at EMAIL_PASS sa `.env` file.

**Check `.env` file:**
```env
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-app-password
```

**If missing, add them:**
1. Get Gmail App Password: https://myaccount.google.com/apppasswords
2. Add to `backend/.env`:
```env
EMAIL_USER=songwooji68@gmail.com
EMAIL_PASS=your-16-digit-app-password
```

**If in DEMO MODE:**
Emails won't actually send, but the code should still work. Check backend logs for:
```
📧 [DEMO MODE] Email would be sent:
To: cautious376@comfythings.com
Subject: ⚠️ Confirm Email Change Request
```

---

### 3. Database Table Missing
Ang `email_change_confirmations` table ay wala pa.

**Check if table exists:**
```bash
node check-email-tables.js
```

**If missing, run migration:**
```bash
# The table should already exist from migration 006
# But if not, check:
node backend/src/migrations/006_add_email_change_confirmation.js
```

---

### 4. JWT_SECRET Missing
Walang JWT_SECRET sa `.env` file.

**Check `.env` file:**
```env
JWT_SECRET=your-secret-key-here
```

**If missing, add it:**
```env
JWT_SECRET=your-super-secret-key-change-this-in-production
```

---

## Quick Fix Steps

### Step 1: Restart Backend (Most Important!)
```bash
# In backend terminal:
# Press Ctrl+C to stop
# Then:
npm start
```

### Step 2: Try Again
1. Go to Profile
2. Edit email
3. Click "Send Confirmation Email"
4. Watch the backend terminal for logs

### Step 3: Check Backend Logs
You should see:
```
📝 Email change request received
✅ Token generated
✅ Confirmation saved to database
✅ Confirmation email sent!
```

### Step 4: Check Email
- **OLD email** (cautious376@comfythings.com) should receive confirmation email
- Subject: "⚠️ Confirm Email Change Request"
- Button: "✓ Yes, That Was Me - Proceed"

---

## Still Not Working?

### Check Backend Terminal for Errors
Look for:
```
❌ Error requesting email change: [error message]
Error details: { message: '...', stack: '...' }
```

### Common Errors:

**"Cannot find module 'jsonwebtoken'"**
```bash
cd backend
npm install jsonwebtoken
```

**"Table 'email_change_confirmations' doesn't exist"**
```bash
node backend/src/migrations/006_add_email_change_confirmation.js
```

**"process.env.JWT_SECRET is undefined"**
Add to `backend/.env`:
```env
JWT_SECRET=your-secret-key
```

---

## Test the Full Flow

### 1. Request Email Change
- Go to Profile → Edit email
- Enter new email
- Click "Send Confirmation Email"
- Should see: "Confirmation email sent to your current email address"

### 2. Check OLD Email
- Open cautious376@comfythings.com
- Should receive: "⚠️ Confirm Email Change Request"
- Click: "✓ Yes, That Was Me - Proceed"

### 3. Redirected to App
- Should see: "Confirmed! Check your new email"
- Message: "We've sent a 6-digit code to cdu2dbfpia@cross.edu.pl"

### 4. Check NEW Email
- Open cdu2dbfpia@cross.edu.pl
- Should receive: "Verify Your New Email Address"
- See: 6-digit code

### 5. Enter Code
- Go back to Profile
- Enter the 6-digit code
- Click "Verify & Change Email"
- Done! ✅

---

## Summary

**Most likely fix:** Just restart the backend server!

The code is correct, but the server needs to reload the new code.
