# Role Management System

## ✅ Setup Complete!

Tapos na bro! May Role Management panel na sa admin where you can assign roles like "contributor" kahit hindi pa pasok sa requirements.

## What Was Added:

### 1. New "Contributor" Role
- Added to database enum
- Can be assigned by admins
- Special role for testing or special users

### 2. Role Management Panel
- New tab sa Admin Panel
- Search and filter users
- Easy role assignment
- Visual role badges

### 3. Backend Support
- New endpoint: `PUT /api/admin/users/:userId/role`
- Supports: student, contributor, moderator, admin
- Admin-only access

## Roles Available:

1. **Student** (Default)
   - Standard user access
   - Forum posting based on grade level

2. **Contributor** (NEW!)
   - Special posting privileges
   - Can be assigned for testing
   - Bypass some requirements

3. **Moderator**
   - Can moderate content
   - Access to all forums
   - Can manage users

4. **Admin**
   - Full system access
   - Can assign roles
   - Can manage everything

## How to Setup:

### Step 1: Run Migration
```bash
# Add contributor role to database
add-contributor-role.bat
```

Or manually:
```bash
cd backend
node -e "const migration = require('./src/migrations/005_add_contributor_role'); migration.up().then(() => { console.log('Done!'); process.exit(0); }).catch(err => { console.error(err); process.exit(1); });"
```

### Step 2: Restart Backend
```bash
cd backend
npm start
```

## How to Use:

### Access Role Management:
1. Login as Admin
2. Go to Admin Panel
3. Click "Role Management" tab

### Assign Roles:
1. Search for user (by name or email)
2. Filter by current role (optional)
3. Click "Change Role" button
4. Select new role
5. Done!

### Example Use Cases:

**Testing Contributor Features:**
- User doesn't meet requirements yet
- Assign "contributor" role temporarily
- Test features without waiting for approval

**Promote Active Users:**
- User is very helpful
- Assign "contributor" role
- Give them special privileges

**Assign Moderators:**
- Trusted user
- Assign "moderator" role
- They can help manage forum

## Features:

### Role Management Panel:
- ✅ Search users by name/email
- ✅ Filter by role
- ✅ View user info (avatar, grade, status)
- ✅ One-click role change
- ✅ Visual role badges
- ✅ Real-time updates

### Security:
- ✅ Admin-only access
- ✅ Only admins can create other admins
- ✅ Role validation
- ✅ Audit logging

## API Endpoint:

**Update User Role:**
```
PUT http://localhost:5000/api/admin/users/:userId/role
Headers: Authorization: Bearer {admin_token}
Body: { "role": "contributor" }
```

**Response:**
```json
{
  "message": "User role updated successfully",
  "user": {
    "id": 123,
    "email": "user@example.com",
    "name": "John Doe",
    "role": "contributor"
  }
}
```

## File Structure:

```
frontend/
  src/
    pages/
      AdminPanel.js          ← Updated with tabs
      RoleManagement.js      ← NEW! Role management UI

backend/
  src/
    routes/
      admin.js               ← Updated with role endpoint
    migrations/
      005_add_contributor_role.js  ← NEW! Migration
```

## Notes:

- Contributor role is flexible - you decide what it means
- Can be used for testing, special users, or beta features
- Admins can change roles anytime
- Changes take effect immediately
- User needs to refresh/re-login to see new permissions

Tapos na bro! Run migration then restart backend. 🚀
