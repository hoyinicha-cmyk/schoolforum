-- Create Welcome Post in General Discussion by Admin
-- This script adds a welcome post to help new users get started

-- Insert welcome post (assuming admin user has id = 1)
INSERT INTO posts (user_id, forum_type, prefix, title, content, has_hidden_content, is_pinned, created_at)
VALUES (
  1, -- Admin user ID
  'general', -- Forum type
  'announcement', -- Prefix
  '🎉 Welcome to the School Forum!', -- Title
  'Hello everyone! 👋

Welcome to our school forum community! We''re excited to have you here.

**What is this forum?**
This is a space for students to connect, share ideas, ask questions, and support each other. Whether you need help with homework, want to discuss school events, or just chat with fellow students, this is the place!

**Forum Sections:**
• **General Discussion** - Open to all verified students
• **Grade 11 Forum** - Exclusive space for G11 students
• **Grade 12 Forum** - Exclusive space for G12 students

**How to Get Started:**
1. ✅ Verify your email to unlock all features
2. 📝 Create your first post or reply to existing ones
3. 💬 React to posts you like
4. 🔖 Bookmark important posts for later
5. 👥 Follow other students to stay updated

**Points & Badges System:**
Earn points for being active in the forum:
• Create a post: +10 points
• Follow someone: +8 points
• Reply to a post: +5 points
• React to content: +1 point
• Bookmark a post: +1 point

As you earn points, you''ll unlock badges and higher daily post limits!

**Community Guidelines:**
• Be respectful and kind to everyone
• No spam or inappropriate content
• Help each other learn and grow
• Report any issues to moderators or admins

**Need Help?**
If you have any questions or concerns, feel free to reach out to the moderators or admin team. We''re here to help!

Let''s make this a positive and supportive community together! 🌟

Happy posting!
- Admin Team', -- Content
  0, -- No hidden content
  1, -- Pinned post
  NOW() -- Current timestamp
);

-- Get the post ID we just created
SET @post_id = LAST_INSERT_ID();

-- Add some initial reactions to make it welcoming (optional)
-- You can uncomment these if you want some initial engagement
-- INSERT INTO reactions (user_id, post_id, reaction_type, created_at)
-- VALUES 
--   (2, @post_id, 'love', NOW()),
--   (3, @post_id, 'like', NOW());

SELECT CONCAT('✅ Welcome post created successfully! Post ID: ', @post_id) as result;
