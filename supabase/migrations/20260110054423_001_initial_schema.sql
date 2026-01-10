/*
  # Initial School Forum Database Schema

  1. New Tables
    - `users` - User accounts with profile information
      - id (uuid, primary key)
      - email (text, unique)
      - password (text, hashed)
      - first_name (text)
      - last_name (text)
      - year_level (text, G11 or G12)
      - gender (text, male/female/prefer_not_to_say)
      - status (text, pending/active/suspended/banned)
      - status_reason (text, nullable)
      - role (text, student/contributor/moderator/admin)
      - email_verified (boolean)
      - school_id_path (text, nullable)
      - school_id_number (text, nullable)
      - avatar_id (integer, default 1)
      - profile_photo (text, nullable)
      - points (integer, default 0)
      - badge (text, default 'Forum Newbie')
      - posts_today (integer, default 0)
      - last_post_date (date, nullable)
      - last_chat_view (timestamptz, nullable)
      - created_at (timestamptz)
      - updated_at (timestamptz)
    
    - `posts` - Forum posts/threads
      - id (uuid, primary key)
      - user_id (uuid, foreign key)
      - forum_type (text, general/g11/g12)
      - prefix (text, none/question/tutorial/discussion/news/announcement/help)
      - title (text, max 200 chars)
      - content (text)
      - has_hidden_content (boolean)
      - is_pinned (boolean)
      - is_locked (boolean)
      - view_count (integer)
      - created_at (timestamptz)
      - updated_at (timestamptz)
    
    - `replies` - Post replies with nested support
      - id (uuid, primary key)
      - post_id (uuid, foreign key)
      - parent_reply_id (uuid, nullable, foreign key)
      - user_id (uuid, foreign key)
      - content (text)
      - has_hidden_content (boolean)
      - created_at (timestamptz)
      - updated_at (timestamptz)
    
    - `reactions` - PHC-style reactions
      - id (uuid, primary key)
      - user_id (uuid, foreign key)
      - post_id (uuid, nullable, foreign key)
      - reply_id (uuid, nullable, foreign key)
      - reaction_type (text, like/love/haha/wow/sad/angry)
      - created_at (timestamptz)
    
    - `bookmarks` - Saved posts
      - id (uuid, primary key)
      - user_id (uuid, foreign key)
      - post_id (uuid, foreign key)
      - created_at (timestamptz)
    
    - `hidden_content_access` - Track who unlocked hidden content
      - id (uuid, primary key)
      - user_id (uuid, foreign key)
      - post_id (uuid, nullable, foreign key)
      - reply_id (uuid, nullable, foreign key)
      - unlocked_at (timestamptz)
    
    - `points_history` - Track point changes
      - id (uuid, primary key)
      - user_id (uuid, foreign key)
      - points (integer)
      - action (text)
      - description (text)
      - created_at (timestamptz)
    
    - `private_messages` - Direct messages between users
      - id (uuid, primary key)
      - sender_id (uuid, foreign key)
      - receiver_id (uuid, foreign key)
      - message (text)
      - is_read (boolean)
      - created_at (timestamptz)
    
    - `profile_notes` - Temporary profile status notes
      - id (uuid, primary key)
      - user_id (uuid, foreign key)
      - content (text, max 40 chars)
      - created_at (timestamptz)
      - expires_at (timestamptz)
    
    - `email_change_codes` - Email change verification
      - id (uuid, primary key)
      - user_id (uuid, foreign key)
      - new_email (text)
      - verification_code (text)
      - used (boolean)
      - created_at (timestamptz)
      - expires_at (timestamptz)
    
    - `follows` - User following system
      - id (uuid, primary key)
      - follower_id (uuid, foreign key)
      - following_id (uuid, foreign key)
      - created_at (timestamptz)
    
    - `notifications` - User notifications
      - id (uuid, primary key)
      - user_id (uuid, foreign key)
      - type (text)
      - message (text)
      - related_id (uuid, nullable)
      - is_read (boolean)
      - created_at (timestamptz)
    
    - `post_views` - Track unique post views
      - id (uuid, primary key)
      - post_id (uuid, foreign key)
      - user_id (uuid, foreign key)
      - viewed_at (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Implement role-based access control
*/

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password text NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  year_level text NOT NULL CHECK (year_level IN ('G11', 'G12')),
  gender text DEFAULT 'prefer_not_to_say' CHECK (gender IN ('male', 'female', 'prefer_not_to_say')),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended', 'banned')),
  status_reason text,
  role text DEFAULT 'student' CHECK (role IN ('student', 'contributor', 'moderator', 'admin')),
  email_verified boolean DEFAULT false,
  school_id_path text,
  school_id_number text,
  avatar_id integer DEFAULT 1,
  profile_photo text,
  points integer DEFAULT 0,
  badge text DEFAULT 'Forum Newbie',
  posts_today integer DEFAULT 0,
  last_post_date date,
  last_chat_view timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_year_level ON users(year_level);

-- Posts table
CREATE TABLE IF NOT EXISTS posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  forum_type text NOT NULL CHECK (forum_type IN ('general', 'g11', 'g12')),
  prefix text DEFAULT 'none' CHECK (prefix IN ('none', 'question', 'tutorial', 'discussion', 'news', 'announcement', 'help')),
  title text NOT NULL CHECK (length(title) <= 200),
  content text NOT NULL,
  has_hidden_content boolean DEFAULT false,
  is_pinned boolean DEFAULT false,
  is_locked boolean DEFAULT false,
  view_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_posts_forum_type ON posts(forum_type);
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_pinned ON posts(is_pinned);

-- Replies table
CREATE TABLE IF NOT EXISTS replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  parent_reply_id uuid REFERENCES replies(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content text NOT NULL,
  has_hidden_content boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_replies_post_id ON replies(post_id);
CREATE INDEX IF NOT EXISTS idx_replies_user_id ON replies(user_id);
CREATE INDEX IF NOT EXISTS idx_replies_parent ON replies(parent_reply_id);

-- Reactions table
CREATE TABLE IF NOT EXISTS reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE,
  reply_id uuid REFERENCES replies(id) ON DELETE CASCADE,
  reaction_type text NOT NULL CHECK (reaction_type IN ('like', 'love', 'haha', 'wow', 'sad', 'angry')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, post_id, reply_id)
);

CREATE INDEX IF NOT EXISTS idx_reactions_post_id ON reactions(post_id);
CREATE INDEX IF NOT EXISTS idx_reactions_reply_id ON reactions(reply_id);
CREATE INDEX IF NOT EXISTS idx_reactions_user_id ON reactions(user_id);

-- Bookmarks table
CREATE TABLE IF NOT EXISTS bookmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, post_id)
);

CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_post_id ON bookmarks(post_id);

-- Hidden content access table
CREATE TABLE IF NOT EXISTS hidden_content_access (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE,
  reply_id uuid REFERENCES replies(id) ON DELETE CASCADE,
  unlocked_at timestamptz DEFAULT now(),
  UNIQUE(user_id, post_id, reply_id)
);

CREATE INDEX IF NOT EXISTS idx_hidden_access_user_id ON hidden_content_access(user_id);

-- Points history table
CREATE TABLE IF NOT EXISTS points_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  points integer NOT NULL,
  action text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_points_history_user_id ON points_history(user_id);

-- Private messages table
CREATE TABLE IF NOT EXISTS private_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_messages_sender ON private_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON private_messages(receiver_id);

-- Profile notes table
CREATE TABLE IF NOT EXISTS profile_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content text NOT NULL CHECK (length(content) <= 40),
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_profile_notes_user_id ON profile_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_profile_notes_expires ON profile_notes(expires_at);

-- Email change codes table
CREATE TABLE IF NOT EXISTS email_change_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  new_email text NOT NULL,
  verification_code text NOT NULL,
  used boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_email_codes_user_id ON email_change_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_email_codes_code ON email_change_codes(verification_code);

-- Follows table
CREATE TABLE IF NOT EXISTS follows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  following_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(follower_id, following_id)
);

CREATE INDEX IF NOT EXISTS idx_follows_follower ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON follows(following_id);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type text NOT NULL,
  message text NOT NULL,
  related_id uuid,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);

-- Post views table
CREATE TABLE IF NOT EXISTS post_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  viewed_at timestamptz DEFAULT now(),
  UNIQUE(post_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_post_views_post ON post_views(post_id);
CREATE INDEX IF NOT EXISTS idx_post_views_user ON post_views(user_id);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE hidden_content_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE points_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE private_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_change_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_views ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view active users"
  ON users FOR SELECT
  TO authenticated
  USING (status IN ('active', 'pending'));

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (id = (current_setting('app.current_user_id', true))::uuid)
  WITH CHECK (id = (current_setting('app.current_user_id', true))::uuid);

-- RLS Policies for posts table
CREATE POLICY "Anyone can view posts"
  ON posts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Active users can create posts"
  ON posts FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = (current_setting('app.current_user_id', true))::uuid
    AND EXISTS (
      SELECT 1 FROM users 
      WHERE id = (current_setting('app.current_user_id', true))::uuid 
      AND status = 'active'
    )
  );

CREATE POLICY "Users can update own posts"
  ON posts FOR UPDATE
  TO authenticated
  USING (user_id = (current_setting('app.current_user_id', true))::uuid)
  WITH CHECK (user_id = (current_setting('app.current_user_id', true))::uuid);

CREATE POLICY "Users can delete own posts"
  ON posts FOR DELETE
  TO authenticated
  USING (user_id = (current_setting('app.current_user_id', true))::uuid);

-- RLS Policies for replies table
CREATE POLICY "Anyone can view replies"
  ON replies FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Active users can create replies"
  ON replies FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = (current_setting('app.current_user_id', true))::uuid
    AND EXISTS (
      SELECT 1 FROM users 
      WHERE id = (current_setting('app.current_user_id', true))::uuid 
      AND status = 'active'
    )
  );

CREATE POLICY "Users can update own replies"
  ON replies FOR UPDATE
  TO authenticated
  USING (user_id = (current_setting('app.current_user_id', true))::uuid)
  WITH CHECK (user_id = (current_setting('app.current_user_id', true))::uuid);

CREATE POLICY "Users can delete own replies"
  ON replies FOR DELETE
  TO authenticated
  USING (user_id = (current_setting('app.current_user_id', true))::uuid);

-- RLS Policies for reactions table
CREATE POLICY "Anyone can view reactions"
  ON reactions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can add reactions"
  ON reactions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (current_setting('app.current_user_id', true))::uuid);

CREATE POLICY "Users can remove own reactions"
  ON reactions FOR DELETE
  TO authenticated
  USING (user_id = (current_setting('app.current_user_id', true))::uuid);

-- RLS Policies for bookmarks table
CREATE POLICY "Users can view own bookmarks"
  ON bookmarks FOR SELECT
  TO authenticated
  USING (user_id = (current_setting('app.current_user_id', true))::uuid);

CREATE POLICY "Users can add bookmarks"
  ON bookmarks FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (current_setting('app.current_user_id', true))::uuid);

CREATE POLICY "Users can remove own bookmarks"
  ON bookmarks FOR DELETE
  TO authenticated
  USING (user_id = (current_setting('app.current_user_id', true))::uuid);

-- RLS Policies for hidden_content_access table
CREATE POLICY "Users can view own hidden content access"
  ON hidden_content_access FOR SELECT
  TO authenticated
  USING (user_id = (current_setting('app.current_user_id', true))::uuid);

CREATE POLICY "Users can unlock hidden content"
  ON hidden_content_access FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (current_setting('app.current_user_id', true))::uuid);

-- RLS Policies for points_history table
CREATE POLICY "Users can view own points history"
  ON points_history FOR SELECT
  TO authenticated
  USING (user_id = (current_setting('app.current_user_id', true))::uuid);

-- RLS Policies for private_messages table
CREATE POLICY "Users can view messages they sent or received"
  ON private_messages FOR SELECT
  TO authenticated
  USING (
    sender_id = (current_setting('app.current_user_id', true))::uuid 
    OR receiver_id = (current_setting('app.current_user_id', true))::uuid
  );

CREATE POLICY "Users can send messages"
  ON private_messages FOR INSERT
  TO authenticated
  WITH CHECK (sender_id = (current_setting('app.current_user_id', true))::uuid);

CREATE POLICY "Users can update received messages"
  ON private_messages FOR UPDATE
  TO authenticated
  USING (receiver_id = (current_setting('app.current_user_id', true))::uuid)
  WITH CHECK (receiver_id = (current_setting('app.current_user_id', true))::uuid);

-- RLS Policies for profile_notes table
CREATE POLICY "Users can view own profile notes"
  ON profile_notes FOR SELECT
  TO authenticated
  USING (user_id = (current_setting('app.current_user_id', true))::uuid);

CREATE POLICY "Users can create profile notes"
  ON profile_notes FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (current_setting('app.current_user_id', true))::uuid);

CREATE POLICY "Users can delete own profile notes"
  ON profile_notes FOR DELETE
  TO authenticated
  USING (user_id = (current_setting('app.current_user_id', true))::uuid);

-- RLS Policies for email_change_codes table
CREATE POLICY "Users can view own email change codes"
  ON email_change_codes FOR SELECT
  TO authenticated
  USING (user_id = (current_setting('app.current_user_id', true))::uuid);

CREATE POLICY "Users can create email change codes"
  ON email_change_codes FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (current_setting('app.current_user_id', true))::uuid);

-- RLS Policies for follows table
CREATE POLICY "Anyone can view follows"
  ON follows FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can follow others"
  ON follows FOR INSERT
  TO authenticated
  WITH CHECK (follower_id = (current_setting('app.current_user_id', true))::uuid);

CREATE POLICY "Users can unfollow"
  ON follows FOR DELETE
  TO authenticated
  USING (follower_id = (current_setting('app.current_user_id', true))::uuid);

-- RLS Policies for notifications table
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (user_id = (current_setting('app.current_user_id', true))::uuid);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (user_id = (current_setting('app.current_user_id', true))::uuid)
  WITH CHECK (user_id = (current_setting('app.current_user_id', true))::uuid);

-- RLS Policies for post_views table
CREATE POLICY "Users can view own post views"
  ON post_views FOR SELECT
  TO authenticated
  USING (user_id = (current_setting('app.current_user_id', true))::uuid);

CREATE POLICY "Users can add post views"
  ON post_views FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (current_setting('app.current_user_id', true))::uuid);