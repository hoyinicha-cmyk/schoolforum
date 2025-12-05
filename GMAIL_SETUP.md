# Gmail SMTP Setup Guide

## Para makatanggap ng real email notifications, kailangan mo i-setup ang Gmail SMTP:

### Step 1: Enable 2-Factor Authentication sa Gmail
1. Go to Google Account settings: https://myaccount.google.com/
2. Security → 2-Step Verification → Turn on

### Step 2: Generate App Password
1. Sa Google Account settings → Security
2. 2-Step Verification → App passwords
3. Select app: "Mail" 
4. Select device: "Other" (custom name)
5. Enter name: "School Forum App"
6. Copy the 16-character password

### Step 3: Update .env File
Replace the demo email settings in `backend/.env` with:

```
# Real Gmail Configuration
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-16-character-app-password
EMAIL_FROM=School Forum <your-gmail@gmail.com>
```

### Alternative: Para sa testing lang (Temporary)
Pwede mo rin gamitin ang Ethereal Email (free testing):
1. Visit: https://ethereal.email/create
2. Use the generated SMTP credentials

### Step 4: Restart Backend
After updating .env, restart ang backend server para ma-load ang new settings.

## Current Status: Demo Mode
Hindi ka makatanggap ng emails kasi naka-demo mode pa. Check mo ang console output sa backend para makita ang "emails" na na-send.