# PHCorner-Style Forum Features Implementation Plan

## Overview
Implementing PHCorner-inspired features for the school forum system.

## Features to Implement

### 1. ✅ Database Schema (COMPLETED)
- [x] Reactions table (like, love, haha, wow, sad, angry)
- [x] Bookmarks table
- [x] Hidden content access table
- [x] Post prefix field (question, tutorial, discussion, news, announcement, help)
- [x] has_hidden_content flag for posts and replies
- [x] view_count for posts

### 2. 🔄 Backend API Endpoints (TODO)

#### Reactions API (`/api/forum/reactions`)
```javascript
POST   /api/forum/posts/:postId/react          // Add/update reaction to post
POST   /api/forum/replies/:replyId/react       // Add/update reaction to reply
DELETE /api/forum/posts/:postId/react          // Remove reaction from post
DELETE /api/forum/replies/:replyId/react       // Remove reaction from reply
GET    /api/forum/posts/:postId/reactions      // Get all reactions for post
GET    /api/forum/replies/:replyId/reactions   // Get all reactions for reply
```

#### Bookmarks API (`/api/forum/bookmarks`)
```javascript
POST   /api/forum/bookmarks/:postId            // Bookmark a post
DELETE /api/forum/bookmarks/:postId            // Remove bookmark
GET    /api/forum/bookmarks                    // Get user's bookmarked posts
```

#### Hidden Content API (`/api/forum/hidden`)
```javascript
POST   /api/forum/posts/:postId/unlock         // Unlock hidden content (requires reaction)
POST   /api/forum/replies/:replyId/unlock      // Unlock hidden reply content
GET    /api/forum/posts/:postId/can-view       // Check if user can view hidden content
```

#### Create Thread API (Update existing)
```javascript
POST   /api/forum/posts                        // Create new post with prefix
// Body: { forum_type, prefix, title, content, has_hidden_content }
```

### 3. 🔄 Frontend Components (TODO)

#### ReactionButton Component
- Display reaction icons (like, love, haha, wow, sad, angry)
- Show reaction counts
- Highlight user's current reaction
- Click to add/change/remove reaction

#### BookmarkButton Component
- Bookmark icon (outline/filled)
- Toggle bookmark on/off
- Show bookmarked state

#### HiddenContent Component
- Display "React to view hidden content" message
- Show unlock button
- Reveal content after unlocking

#### CreateThreadModal Component
- Prefix selector dropdown
- Title input
- Rich text editor for content
- Hidden content toggle/section
- Submit button

#### PrefixBadge Component
- Color-coded badges for different prefixes
- Question (blue), Tutorial (green), Discussion (gray), etc.

### 4. 🔄 Frontend Pages Updates (TODO)

#### Forum Pages (General, G11, G12)
- Add reaction buttons to posts
- Add bookmark button to posts
- Display prefix badges
- Show view count
- Handle hidden content display
- Add "Create Thread" button

#### Bookmarks Page (NEW)
- List all bookmarked posts
- Filter by forum type
- Remove bookmark option

### 5. 🎨 UI/UX Enhancements

#### Reaction Icons
```
👍 Like
❤️ Love
😂 Haha
😮 Wow
😢 Sad
😠 Angry
```

#### Prefix Colors
```
Question    - Blue (#3B82F6)
Tutorial    - Green (#10B981)
Discussion  - Gray (#6B7280)
News        - Purple (#8B5CF6)
Announcement- Red (#EF4444)
Help        - Orange (#F59E0B)
```

#### Hidden Content Style
```
[HIDDEN CONTENT]
React to this post to view hidden content
[Unlock Button]
```

## Implementation Order

### Phase 1: Backend (Day 1 Morning)
1. Run migration: `database/phc_features_migration.sql`
2. Create reaction routes and controllers
3. Create bookmark routes and controllers
4. Create hidden content unlock logic
5. Update post creation to support prefix and hidden content

### Phase 2: Frontend Components (Day 1 Afternoon)
1. Create ReactionButton component
2. Create BookmarkButton component
3. Create HiddenContent component
4. Create PrefixBadge component

### Phase 3: Integration (Day 2 Morning)
1. Update forum pages to show reactions and bookmarks
2. Add create thread functionality with prefix
3. Implement hidden content display/unlock
4. Add bookmarks page

### Phase 4: Testing & Polish (Day 2 Afternoon)
1. Test all reaction types
2. Test bookmark functionality
3. Test hidden content unlock
4. Test thread creation with prefixes
5. UI/UX improvements

## Database Migration Command
```bash
# Run this in MySQL
mysql -u root -p school_forum < database/phc_features_migration.sql
```

## API Testing Examples

### React to Post
```bash
curl -X POST http://localhost:5000/api/forum/posts/1/react \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"reaction_type": "like"}'
```

### Bookmark Post
```bash
curl -X POST http://localhost:5000/api/forum/bookmarks/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Create Thread with Prefix
```bash
curl -X POST http://localhost:5000/api/forum/posts \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "forum_type": "general",
    "prefix": "question",
    "title": "How to solve this problem?",
    "content": "I need help with...\n\n[HIDDEN]Answer key here[/HIDDEN]",
    "has_hidden_content": true
  }'
```

## Notes
- Hidden content uses `[HIDDEN]content[/HIDDEN]` tags in the content
- Users must react to unlock hidden content
- Admins and moderators can always see hidden content
- Post author can always see their own hidden content
- Reactions are mutually exclusive (one reaction per user per post/reply)
- Bookmarks are unlimited

## Next Steps
Tomorrow you'll continue with:
1. Backend API implementation
2. Frontend components
3. Integration and testing
