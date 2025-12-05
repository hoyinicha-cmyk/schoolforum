# Forum Access Criteria

## Access Rules

### General Forum (`/forum/general`)
**Who can access:**
- ✅ All authenticated users (pending, active, admin, moderator)
- ✅ Any grade level (G11 or G12)

**Requirements:**
- Must be logged in

### G11 Forum (`/forum/g11`)
**Who can access:**
- ✅ G11 students with **active** status
- ✅ Admin (any grade level)
- ✅ Moderator (any grade level)

**Requirements:**
- Must be logged in
- Must have **active** status (not pending)
- Must be G11 student OR admin/moderator

**Blocked:**
- ❌ G12 students
- ❌ Pending users (not yet activated by admin)
- ❌ Suspended users
- ❌ Banned users

### G12 Forum (`/forum/g12`)
**Who can access:**
- ✅ G12 students with **active** status
- ✅ Admin (any grade level)
- ✅ Moderator (any grade level)

**Requirements:**
- Must be logged in
- Must have **active** status (not pending)
- Must be G12 student OR admin/moderator

**Blocked:**
- ❌ G11 students
- ❌ Pending users (not yet activated by admin)
- ❌ Suspended users
- ❌ Banned users

## User Status Meanings

| Status | Can Login? | General Forum | G11/G12 Forum | Admin Panel |
|--------|-----------|---------------|---------------|-------------|
| **pending** | ✅ Yes | ✅ Yes | ❌ No | ❌ No |
| **active** | ✅ Yes | ✅ Yes | ✅ Yes (if correct grade) | ❌ No |
| **suspended** | ❌ No | ❌ No | ❌ No | ❌ No |
| **banned** | ❌ No | ❌ No | ❌ No | ❌ No |

## User Role Meanings

| Role | Access Level |
|------|-------------|
| **student** | General forum + their grade forum (if active) |
| **moderator** | All forums (General, G11, G12) + Admin panel |
| **admin** | All forums (General, G11, G12) + Admin panel |

## Example Scenarios

### Scenario 1: New G11 Student (Pending)
- Status: `pending`
- Grade: `G11`
- Can access:
  - ✅ General Forum
- Cannot access:
  - ❌ G11 Forum (needs activation)
  - ❌ G12 Forum (wrong grade)

### Scenario 2: Activated G11 Student
- Status: `active`
- Grade: `G11`
- Can access:
  - ✅ General Forum
  - ✅ G11 Forum
- Cannot access:
  - ❌ G12 Forum (wrong grade)

### Scenario 3: Activated G12 Student
- Status: `active`
- Grade: `G12`
- Can access:
  - ✅ General Forum
  - ✅ G12 Forum
- Cannot access:
  - ❌ G11 Forum (wrong grade)

### Scenario 4: Admin (Any Grade)
- Status: `active`
- Role: `admin`
- Grade: `G12` (or any)
- Can access:
  - ✅ General Forum
  - ✅ G11 Forum
  - ✅ G12 Forum
  - ✅ Admin Panel

### Scenario 5: Moderator (Any Grade)
- Status: `active`
- Role: `moderator`
- Grade: `G12` (or any)
- Can access:
  - ✅ General Forum
  - ✅ G11 Forum
  - ✅ G12 Forum
  - ✅ Admin Panel

## What Happens When Access is Denied

### If user tries to access wrong grade forum:
**Example**: G12 student tries to access `/forum/g11`

**Result**: Shows error page:
```
Access Denied
You don't have access to the G11 forum. 
This content is only available for G11 students.
```

Then redirects to `/dashboard`

### If pending user tries to access grade forum:
**Example**: Pending G11 student tries to access `/forum/g11`

**Result**: Shows error page:
```
Account Approval Required
Your account is pending admin approval. 
You can only access General Discussion.
```

Then redirects to `/forum/general`

## How to Test

### Test 1: G11 Student Access
1. Login as G11 student: `1sore@comfythings.com` / `Student123!`
2. Should access:
   - ✅ `/forum/general` - Works
   - ✅ `/forum/g11` - Works
   - ❌ `/forum/g12` - Blocked (shows error)

### Test 2: G12 Student Access
1. Login as G12 student (need to create one or use admin)
2. Should access:
   - ✅ `/forum/general` - Works
   - ❌ `/forum/g11` - Blocked (shows error)
   - ✅ `/forum/g12` - Works

### Test 3: Admin Access
1. Login as admin: `admin@school.edu` / `AdminPass123!`
2. Should access:
   - ✅ `/forum/general` - Works
   - ✅ `/forum/g11` - Works
   - ✅ `/forum/g12` - Works
   - ✅ `/admin` - Works

### Test 4: Pending User Access
1. Create new account (don't activate)
2. Login
3. Should access:
   - ✅ `/forum/general` - Works
   - ❌ `/forum/g11` - Blocked (pending)
   - ❌ `/forum/g12` - Blocked (pending)

## Implementation Details

### Frontend Protection
**File**: `frontend/src/App.js`

```javascript
// G11 Forum - Only G11 students (active) or admin/moderator
<Route path="forum/g11" element={
  <ProtectedRoute requiresApproval={true} requiredGrade="G11">
    <ForumG11 />
  </ProtectedRoute>
} />

// G12 Forum - Only G12 students (active) or admin/moderator
<Route path="forum/g12" element={
  <ProtectedRoute requiresApproval={true} requiredGrade="G12">
    <ForumG12 />
  </ProtectedRoute>
} />
```

### Backend Protection
**File**: `backend/src/routes/forum.js`

The backend also checks access using middleware:
- `authMiddleware` - Checks if user is logged in
- `approvedMiddleware` - Checks if status is 'active'
- `gradeMiddleware('G11')` - Checks if user is G11 or admin/moderator

## Summary

✅ **General Forum**: Everyone (logged in)
✅ **G11 Forum**: G11 students (active) + Admin/Moderator
✅ **G12 Forum**: G12 students (active) + Admin/Moderator
✅ **Admin Panel**: Admin + Moderator only

Students must be **activated by admin** to access their grade-specific forum!
