# User Status Update Fix

## Problem
When an admin activates a user account (changes status from "pending" to "active"), the user who was already logged in couldn't login again. The user's session had cached data with the old "pending" status.

## Root Causes

1. **Cached User Data**: When a user logs in, their data is stored in localStorage and React state. When an admin changes their status, the frontend doesn't know about it.

2. **No Status Validation on Login**: The login endpoint wasn't checking if a user is suspended or banned.

3. **No Status Validation on API Requests**: Protected routes weren't checking if a user's status changed after they logged in.

## Solutions Implemented

### 1. Added Status Checks on Login
**File: `backend/src/routes/auth.js`**

Now blocks suspended and banned users from logging in:
```javascript
// Check if user is suspended or banned
if (user.status === 'suspended') {
  return res.status(403).json({
    error: 'Account suspended',
    message: 'Your account has been suspended. Please contact an administrator.'
  });
}

if (user.status === 'banned') {
  return res.status(403).json({
    error: 'Account banned',
    message: 'Your account has been banned. Please contact an administrator.'
  });
}
```

### 2. Added Status Checks in Auth Middleware
**File: `backend/src/middleware/auth.js`**

Now checks user status on every API request:
```javascript
// Check if user is suspended or banned
if (user.status === 'suspended') {
  return res.status(403).json({ 
    error: 'Account suspended',
    message: 'Your account has been suspended. Please contact an administrator.',
    requiresLogout: true
  });
}

if (user.status === 'banned') {
  return res.status(403).json({ 
    error: 'Account banned',
    message: 'Your account has been permanently banned.',
    requiresLogout: true
  });
}
```

### 3. Added User Status Refresh Function
**File: `frontend/src/contexts/AuthContext.js`**

Added `refreshUser()` function to fetch updated user data from the server:
```javascript
const refreshUser = async () => {
  try {
    const res = await authAPI.getProfile();
    const updatedUser = res.data.user;
    setUser(updatedUser);
    
    // Update localStorage with fresh data
    const token = localStorage.getItem('token');
    if (token) {
      saveAuthData(token, updatedUser);
    }
    
    return { success: true, user: updatedUser };
  } catch (err) {
    return { success: false, error: err.message };
  }
};
```

### 4. Added Automatic Logout for Suspended/Banned Users
**File: `frontend/src/services/api.js`**

Updated the response interceptor to handle 403 errors with `requiresLogout` flag:
```javascript
// Handle suspended/banned accounts
if (error.response?.status === 403 && error.response?.data?.requiresLogout) {
  // Clear auth data
  Cookies.remove('token');
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  
  // Show error message
  const message = error.response.data.message || 'Your account has been restricted.';
  alert(message);
  
  // Redirect to login
  window.location.href = '/login';
  return Promise.reject(error);
}
```

### 5. Added Real-Time Status Monitoring
**File: `frontend/src/components/Common/UserStatusMonitor.js`**

Created a component that checks user status every 30 seconds:
- Detects when status changes from "pending" to "active" → Shows success message and refreshes
- Detects when status changes to "suspended" or "banned" → Logs out user automatically
- Runs in the background for all authenticated users

**File: `frontend/src/App.js`**

Added the monitor to the app:
```javascript
<AuthProvider>
  <UserStatusMonitor />
  <Routes>
    ...
  </Routes>
</AuthProvider>
```

## How It Works Now

### Scenario 1: User Activated While Logged In
1. User logs in with "pending" status
2. Admin activates the account (changes to "active")
3. Within 30 seconds, UserStatusMonitor detects the change
4. Shows success message: "🎉 Your account has been activated!"
5. Page refreshes automatically with new permissions

### Scenario 2: User Suspended While Logged In
1. User is logged in and using the app
2. Admin suspends the account
3. Within 30 seconds, UserStatusMonitor detects the change
4. Shows alert: "Your account has been suspended"
5. User is logged out automatically
6. Redirected to login page

### Scenario 3: Suspended User Tries to Login
1. User tries to login
2. Backend checks status before issuing token
3. Returns 403 error: "Account suspended"
4. User cannot login

### Scenario 4: Suspended User Makes API Request
1. Suspended user somehow has a valid token
2. Makes an API request
3. Auth middleware checks status
4. Returns 403 with `requiresLogout: true`
5. Frontend intercepts, logs out user, redirects to login

## Testing

### Test 1: Activate Pending User
1. Create a new account (status: pending)
2. Login with that account
3. In another browser/tab, login as admin
4. Activate the pending user
5. Wait 30 seconds
6. The user should see a success message and get full access

### Test 2: Suspend Active User
1. Login as a regular user
2. In another browser/tab, login as admin
3. Suspend the user
4. Wait 30 seconds
5. The user should be logged out automatically

### Test 3: Banned User Cannot Login
1. Login as admin
2. Ban a user account
3. Try to login with that banned account
4. Should see error: "Account banned"

## Configuration

The status check interval can be adjusted in `UserStatusMonitor.js`:
```javascript
const interval = setInterval(async () => {
  // Check user status
}, 30000); // 30 seconds (30000ms)
```

Reduce for faster detection (uses more API calls) or increase to reduce server load.

## Benefits

1. ✅ Users get immediate feedback when activated
2. ✅ Suspended/banned users are automatically logged out
3. ✅ No manual logout required
4. ✅ Prevents suspended users from accessing the system
5. ✅ Works even if user has multiple tabs open
6. ✅ Minimal performance impact (one API call every 30 seconds)

## Notes

- The status monitor only runs when a user is logged in
- It automatically stops when the user logs out
- The 30-second interval is a good balance between responsiveness and server load
- Admin/moderator accounts cannot be suspended by other admins (protected in backend)
