# Database Migration Guide

## Status Field Migration: 'verified' → 'active'

This migration updates the user status field to use more intuitive values that match the admin panel interface.

### Changes:
- `verified` → `active`
- `rejected` → `banned`
- Status ENUM now: `'pending', 'active', 'suspended', 'banned'`

### How to Run the Migration:

#### Option 1: Using Node.js Script (Recommended)
```bash
cd backend
node migrate.js
```

#### Option 2: Using SQL File
```bash
mysql -u root -p school_forum < database/migrate_status.sql
```

### What Gets Updated:

1. **Database Schema**: The `status` ENUM field in the `users` table
2. **Existing Data**: All users with status 'verified' → 'active', 'rejected' → 'banned'
3. **Backend Code**: All references to 'verified' status updated to 'active'
4. **Frontend Code**: Admin panel and auth context updated

### Files Modified:

**Backend:**
- `backend/src/models/User.js`
- `backend/src/routes/admin.js`
- `backend/src/routes/auth.js`
- `backend/src/routes/forum.js`
- `backend/src/routes/upload.js`
- `backend/src/middleware/auth.js`
- `backend/src/utils/setupDatabase.js`

**Frontend:**
- `frontend/src/contexts/AuthContext.js`
- `frontend/src/pages/AdminPanel.js` (already using correct values)

**Database:**
- `database/schema.sql`
- `database/migrate_status.sql` (new migration file)

### Verification:

After running the migration, verify the changes:

```sql
-- Check status distribution
SELECT status, COUNT(*) as count FROM users GROUP BY status;

-- Check specific users
SELECT id, email, first_name, last_name, status, role FROM users;
```

### Rollback (if needed):

If you need to rollback, you can reverse the process:

```sql
ALTER TABLE users MODIFY COLUMN status ENUM('pending', 'verified', 'rejected', 'suspended', 'active', 'banned') DEFAULT 'pending';
UPDATE users SET status = 'verified' WHERE status = 'active';
UPDATE users SET status = 'rejected' WHERE status = 'banned';
ALTER TABLE users MODIFY COLUMN status ENUM('pending', 'verified', 'rejected', 'suspended') DEFAULT 'pending';
```

### Notes:

- The migration is safe and can be run multiple times
- Existing sessions will continue to work
- Users may need to refresh their browser to see updated status labels
- The admin panel will now correctly display all users with their current status
