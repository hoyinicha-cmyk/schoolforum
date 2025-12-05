# Follow System Implementation

## Overview
The follow system allows users to follow each other and build their network within the school forum. When users follow someone, they can see their activity and get notified when they create new posts.

## Features

### 1. Follow/Unfollow Users
- Users can follow other users from their profile pages
- Follow button changes to "Unfollow" when already following
- Cannot follow yourself
- Duplicate follows are prevented

### 2. Followers & Following Lists
- View list of users who follow you (Followers)
- View list of users you are following (Following)
- Shows when each follow relationship was created
- Displays user information (username, grade level)

### 3. Follow Statistics
- Followers count - number of users following you
- Following count - number of users you follow
- Displayed on profile pages

### 4. Notifications
- Users receive notifications when someone follows them
- Notification includes the follower's username
- Accessible from the notifications panel

## Database Schema

### follows table
```sql
CREATE TABLE follows (
  id INT PRIMARY KEY AUTO_INCREMENT,
  follower_id INT NOT NULL,           -- User who is following
  following_id INT NOT NULL,          -- User being followed
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (following_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_follow (follower_id, following_id)
);
```

## API Endpoints

### POST /api/follows/follow/:userId
Follow a user
- **Auth Required**: Yes
- **Body**: None
- **Response**: Success message
- **Creates**: Follow relationship + notification

### DELETE /api/follows/unfollow/:userId
Unfollow a user
- **Auth Required**: Yes
- **Body**: None
- **Response**: Success message

### GET /api/follows/followers/:userId
Get list of followers for a user
- **Auth Required**: Yes
- **Response**: Array of follower objects with user details

### GET /api/follows/following/:userId
Get list of users that a user is following
- **Auth Required**: Yes
- **Response**: Array of user objects being followed

### GET /api/follows/is-following/:userId
Check if current user is following another user
- **Auth Required**: Yes
- **Response**: `{ isFollowing: boolean }`

### GET /api/follows/stats/:userId
Get follow statistics for a user
- **Auth Required**: Yes
- **Response**: `{ followers: number, following: number }`

## Frontend Components

### Profile Page (Own Profile)
- Displays your followers and following counts
- Click on counts to view lists
- Shows network statistics

### UserProfile Page (Other Users)
- View other users' profiles
- Follow/Unfollow button
- View their followers and following counts
- View their activity statistics

### Follow Modals
- **Followers Modal**: Shows list of users following you
- **Following Modal**: Shows list of users you follow
- Displays user avatars, usernames, and grade levels

## Setup Instructions

1. **Run the setup script**:
   ```bash
   setup-follows.bat
   ```

2. **Or manually**:
   ```bash
   cd backend
   node create-follows-table.js
   ```

3. **Restart the backend server** to load the new routes

## Usage

### Following a User
1. Navigate to a user's profile at `/user/:userId`
2. Click the "Follow" button
3. The user will receive a notification
4. Your following count increases

### Viewing Followers/Following
1. Go to your profile page
2. Click on the "Followers" or "Following" count
3. A modal will show the list of users

### Unfollowing a User
1. Go to the user's profile or your following list
2. Click "Unfollow"
3. The follow relationship is removed

## Future Enhancements

Potential features to add:
- Follow feed showing posts from followed users
- Mutual follow indicators
- Follow suggestions based on grade level or interests
- Private accounts requiring follow approval
- Block users functionality
- Follow activity in notifications
- Export followers/following list

## Security

- All endpoints require authentication
- Users cannot follow themselves
- Duplicate follows are prevented at database level
- Follow relationships are deleted when users are deleted (CASCADE)
- Input validation on all endpoints

## Testing

Test the follow system:
1. Create multiple test accounts
2. Follow users from different accounts
3. Check notifications are created
4. Verify follower/following counts update
5. Test unfollow functionality
6. Check that you cannot follow yourself
