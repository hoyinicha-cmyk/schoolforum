# Guest Dashboard - Interactive Preview Guide

## Overview
Enhanced guest dashboard na nagpapakita ng actual data from database pero nag-redirect sa sign up pag mag-interact ang guest.

## New Features

### 1. Recent Posts Section (10 Latest from General Forum)
Makikita ng guests:
- **Post Title** - Full title ng discussion
- **Post Preview** - First 150 characters ng content
- **Author Info** - Name with avatar
- **Post Stats**:
  - Time posted (e.g., "2 hours ago")
  - Reply count
  - View count
- **Read More Button** - Redirects to sign up

### 2. Newest Members Section (10 Latest Active Users)
Makikita ng guests:
- **Profile Picture** - Avatar ng user
- **Full Name** - First and last name
- **Year Level** - G11 or G12 badge
- **Badge** - Kung meron (e.g., "Forum Active")
- **Points** - Total points earned
- **Join Date** - Time ago format
- **Action Buttons**:
  - "View" button - Redirects to sign up
  - "Follow" button - Redirects to sign up

### 3. Interactive Elements
Lahat ng interactive elements nag-redirect sa `/register`:
- Read More buttons sa posts
- View Profile buttons
- Follow buttons
- "Sign up to see all discussions" button
- "Sign up to connect with members" button

## Backend Changes

### Updated API Endpoint: `/api/auth/dashboard-stats`
Now returns:
```json
{
  "weeklyPosts": {
    "general": 15,
    "g11": 8,
    "g12": 12
  },
  "recentPosts": [
    {
      "id": 123,
      "title": "Post title",
      "content": "Post content...",
      "forumType": "general",
      "createdAt": "2025-01-15T10:30:00Z",
      "viewCount": 45,
      "authorId": 5,
      "authorFirstName": "Juan",
      "authorLastName": "Dela Cruz",
      "authorAvatar": "avatar_123",
      "authorYearLevel": "G11",
      "replyCount": 8
    }
    // ... 9 more posts
  ],
  "newestUsers": [
    {
      "id": 10,
      "firstName": "Maria",
      "lastName": "Santos",
      "yearLevel": "G12",
      "avatarId": "avatar_456",
      "badge": "Forum Active",
      "points": 125,
      "createdAt": "2025-01-14T15:20:00Z",
      "status": "active"
    }
    // ... 9 more users
  ],
  "userStats": {
    "totalUsers": 150,
    "activeUsers": 120,
    "pendingUsers": 15,
    "suspendedUsers": 10,
    "bannedUsers": 5
  }
}
```

## Frontend Changes

### New Components Added
1. **Recent Posts List**
   - Card layout with post preview
   - Author avatar and info
   - Stats (replies, views, time)
   - Read More button

2. **Newest Members Grid**
   - 5 columns on desktop
   - 2 columns on tablet
   - 1 column on mobile
   - Profile cards with avatar
   - View and Follow buttons

### Helper Functions
- `handleGuestAction()` - Redirects to `/register`
- `formatTimeAgo()` - Converts timestamp to "X hours ago" format
- `getAvatarUrl()` - Gets avatar image URL

## User Experience Flow

### Guest Visitor Journey:
1. **Lands on `/`** → Sees guest dashboard
2. **Views Statistics** → Total users, active users, posts this week
3. **Browses Recent Posts** → Sees 10 latest discussions with previews
4. **Checks New Members** → Sees 10 newest users with profiles
5. **Clicks Any Action** → Redirected to sign up page
6. **Signs Up** → Can now fully interact with content

### What Guests Can See:
✅ Post titles and previews
✅ Author names and avatars
✅ Reply counts and view counts
✅ User profiles (name, year level, badge, points)
✅ Join dates and post times
✅ Community statistics

### What Guests Cannot Do:
❌ Read full posts
❌ View full profiles
❌ Follow users
❌ Send messages
❌ Reply to posts
❌ Create posts

## Benefits

1. **Transparency** - Guests see real, active community
2. **Social Proof** - Shows actual users and discussions
3. **FOMO Effect** - Guests want to join to interact
4. **Trust Building** - Real data builds credibility
5. **Better Conversion** - More likely to sign up after seeing content

## Design Features

### Visual Elements:
- **Color-coded badges** - Year level (emerald), badges (purple)
- **Hover effects** - Cards lift on hover
- **Responsive grid** - Adapts to screen size
- **Time formatting** - Human-readable timestamps
- **Avatar display** - Profile pictures for personalization

### Call-to-Actions:
- Primary: "Get Started" button (CTA section)
- Secondary: "Read More" buttons (posts)
- Tertiary: "View" and "Follow" buttons (users)
- Informational: "Sign up to..." buttons (sections)

## Testing Checklist

### Backend Testing:
- [ ] API returns 10 recent posts
- [ ] API returns 10 newest users
- [ ] Posts include all required fields
- [ ] Users include avatar and badge info
- [ ] Statistics are accurate

### Frontend Testing:
- [ ] Posts display correctly with previews
- [ ] User cards show all profile info
- [ ] Avatars load properly
- [ ] Time ago format works
- [ ] All buttons redirect to /register
- [ ] Responsive on mobile/tablet/desktop
- [ ] Loading states work
- [ ] Empty states handled

### User Flow Testing:
- [ ] Guest can view all content
- [ ] Clicking any action redirects to sign up
- [ ] Sign up page loads correctly
- [ ] After registration, can access full features

## Future Enhancements

Possible additions:
1. **Search Preview** - Let guests search but require login to view results
2. **Trending Topics** - Show most popular discussions
3. **Member Spotlight** - Feature top contributors
4. **Activity Feed** - Real-time updates of new posts/members
5. **Category Filters** - Filter posts by topic
6. **Pagination** - Load more posts/users

## Notes

- Only shows data from **General Forum** (public)
- Only shows **active users** (not pending/suspended)
- All interactions require authentication
- Clean, professional design
- Mobile-first responsive layout
