# Quick Update Guide for Forum Pages

The ForumGeneral.js has been fully updated with all PHC features. To update ForumG11.js and ForumG12.js:

## Changes needed in ForumG11.js and ForumG12.js:

1. **Add missing import:**
```javascript
import { forumAPI } from '../services/api';
```

2. **Update fetchPosts to use forumAPI:**
```javascript
const fetchPosts = async () => {
  try {
    const response = await forumAPI.getPosts('g11'); // or 'g12'
    setPosts(response.data.posts || []);
  } catch (error) {
    console.error('Error fetching posts:', error);
  } finally {
    setLoading(false);
  }
};
```

3. **Update fetchReplies to use forumAPI:**
```javascript
const fetchReplies = async (postId) => {
  if (replies[postId]) {
    setExpandedPost(expandedPost === postId ? null : postId);
    return;
  }

  setLoadingReplies(prev => ({ ...prev, [postId]: true }));
  try {
    const response = await forumAPI.getReplies(postId);
    setReplies(prev => ({ ...prev, [postId]: response.data.replies || [] }));
    setExpandedPost(postId);
  } catch (error) {
    console.error('Error fetching replies:', error);
  } finally {
    setLoadingReplies(prev => ({ ...prev, [postId]: false }));
  }
};
```

4. **Add handler functions:**
```javascript
const handleReactionChange = () => {
  fetchPosts();
};

const handleThreadCreated = () => {
  fetchPosts();
};
```

5. **Update the header section to include Create Thread button**

6. **Update post display to include:**
   - PrefixBadge
   - HiddenContent component
   - ReactionButton
   - BookmarkButton
   - View count

7. **Add CreateThreadModal at the end**

All these changes are already implemented in ForumGeneral.js - you can use it as a reference!
