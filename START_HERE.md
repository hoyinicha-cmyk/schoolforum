# Quick Start Guide - School Forum (Supabase Version)

## Fixed Issues ✅

1. ✅ MySQL replaced with Supabase
2. ✅ All database tables migrated
3. ✅ Backend dependencies installed
4. ✅ Frontend dependencies installed
5. ✅ Environment variables configured
6. ✅ Server starts successfully

## How to Start the Application

### Terminal 1 - Start Backend

```bash
cd backend
npm start
```

Dapat makita mo:
```
🚀 Server running on port 5000
📄 Supabase connected successfully
```

### Terminal 2 - Start Frontend

```bash
cd frontend
npm start
```

Automatic mag-open ng browser sa http://localhost:3000

## Creating Your First User

Since RLS (Row Level Security) is enabled, hindi tayo makaka-insert ng users directly from the server. Kaya kailangan mo mag-register manually:

1. Go to http://localhost:3000
2. Click "Register" or "Sign Up"
3. Fill in your details
4. Your account will be created!

## Para sa Admin Account

Para magkaroon ng admin access, after registration:

1. Go to Supabase Dashboard: https://supabase.com/dashboard
2. Select your project (paggmnfvbjnxbqexjqxf)
3. Go to Table Editor → users
4. Find your user
5. Edit the `role` column to `admin`
6. Edit the `status` column to `active`
7. Edit the `email_verified` column to `true`

## Database Information

- **Type**: Supabase (PostgreSQL)
- **Tables**: 14 tables created with RLS policies
- **Connection**: Automatic via environment variables

## Features Available

✅ User Registration & Login
✅ Forum Posts & Replies
✅ Reactions & Bookmarks
✅ Points & Badge System
✅ Avatar System
✅ Profile Photos
✅ Private Messaging
✅ Notifications
✅ Follow System
✅ Nested Replies
✅ Hidden Content
✅ And more...

## Troubleshooting

### Backend won't start?
- Check if .env file exists in backend folder
- Check if port 5000 is available

### Frontend won't start?
- Check if .env file exists in frontend folder
- Check if port 3000 is available

### Can't login?
- Make sure you registered first
- Check if email_verified is true in database
- Check if status is 'active' in database

## Notes

- Ang database ay naka-host na sa Supabase cloud
- Hindi na kailangan ng local MySQL
- All data is secured with Row Level Security (RLS)
- JWT authentication pa rin ang ginagamit

Enjoy your Supabase-powered School Forum! 🎉
