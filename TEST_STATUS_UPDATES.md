# Testing User Status Updates

## Prerequisites
1. Backend server running: `cd backend && npm start`
2. Frontend server running: `cd frontend && npm start`
3. Two browser windows or incognito mode

## Test 1: Activate Pending User (Real-time Update)

### Steps:
1. **Create a new account**
   - Go to `/register`
   - Fill in the form and submit
   - Verify email (check console for verification link)
   - Login with the new account
   - You should see "Pending approval" status

2. **Activate the account (as admin)**
   - Open a new browser window/tab
   - Login as admin: `admin@school.edu` / `AdminPass123!`
   - Go to `/admin`
   - Find the pending user
   - Click "Activate"

3. **Check the user's browser**
   - Wait up to 30 seconds
   - You should see: "🎉 Your account has been activated! You now have full access."
   - Page will refresh automatically
   - User now has full access to grade-specific forums

### Expected Result:
✅ User sees activation message within 30 seconds
✅ Page refreshes with new permissions
✅ User can access grade-specific content

---

## Test 2: Suspend Active User (Real-time Logout)

### Steps:
1. **Login as regular user**
   - Use: `student@gmail.com` / `StudentPass123!`
   - Navigate around the app

2. **Suspend the user (as admin)**
   - In another browser, login as admin
   - Go to `/admin`
   - Find the student user
   - Click "Suspend"

3. **Check the user's browser**
   - Wait up to 30 seconds
   - You should see: "Your account has been suspended by an administrator."
   - User is automatically logged out
   - Redirected to login page

### Expected Result:
✅ User sees suspension message within 30 seconds
✅ User is logged out automatically
✅ User is redirected to login page

---

## Test 3: Suspended User Cannot Login

### Steps:
1. **Suspend a user (as admin)**
   - Login as admin
   - Go to `/admin`
   - Suspend any active user

2. **Try to login with suspended account**
   - Logout from admin
   - Try to login with the suspended user's credentials

### Expected Result:
✅ Login fails with error: "Account suspended"
✅ User cannot access the system
✅ Error message is clear and helpful

---

## Test 4: Ban User (Permanent Block)

### Steps:
1. **Ban a user (as admin)**
   - Login as admin
   - Go to `/admin`
   - Click "Ban" on any user

2. **Try to login with banned account**
   - Try to login with the banned user's credentials

### Expected Result:
✅ Login fails with error: "Account banned"
✅ User cannot access the system

---

## Test 5: Reactivate Suspended User

### Steps:
1. **Suspend a user first**
   - Login as admin
   - Suspend any active user

2. **Reactivate the user**
   - Click "Activate" on the suspended user

3. **Login with reactivated account**
   - User should be able to login successfully
   - Full access restored

### Expected Result:
✅ User can login after reactivation
✅ All permissions restored

---

## Test 6: Status Check on API Requests

### Steps:
1. **Login as regular user**
   - Login and keep the browser open

2. **Suspend the user (as admin)**
   - In another browser, suspend the user

3. **Make an API request (as suspended user)**
   - Try to navigate to a protected page
   - Or wait for the 30-second status check

### Expected Result:
✅ API returns 403 error
✅ User is logged out automatically
✅ Redirected to login page

---

## Test 7: Multiple Tabs (Same User)

### Steps:
1. **Login as regular user in multiple tabs**
   - Open 3-4 tabs with the same user logged in

2. **Suspend the user (as admin)**
   - In another browser, suspend the user

3. **Check all tabs**
   - Within 30 seconds, all tabs should detect the suspension
   - All tabs should logout and redirect to login

### Expected Result:
✅ All tabs detect the status change
✅ All tabs logout simultaneously
✅ All tabs redirect to login page

---

## Troubleshooting

### Status not updating?
- Check browser console for errors
- Verify backend server is running
- Check that UserStatusMonitor is mounted in App.js
- Verify the 30-second interval is working (check console logs)

### User not logged out?
- Check backend middleware is checking status
- Verify API interceptor is handling 403 errors
- Check that `requiresLogout: true` is in the response

### Login still works for suspended user?
- Restart backend server to load new code
- Check that status validation is in login route
- Verify database has correct status value

---

## Quick Verification Commands

### Check user status in database:
```bash
cd backend
node -e "const mysql = require('mysql2/promise'); require('dotenv').config(); (async () => { const conn = await mysql.createConnection({ host: process.env.DB_HOST || 'localhost', user: process.env.DB_USER || 'root', password: process.env.DB_PASSWORD || '', database: process.env.DB_NAME || 'school_forum' }); const [users] = await conn.query('SELECT id, email, first_name, last_name, status FROM users'); console.table(users); await conn.end(); })()"
```

### Test login endpoint:
```bash
node test-api.js
```

---

## Notes

- Status checks happen every 30 seconds (configurable in UserStatusMonitor.js)
- Admin accounts cannot be suspended by other admins
- Moderators can be suspended by admins
- Status changes are immediate on the backend
- Frontend updates within 30 seconds (or on next API request)
