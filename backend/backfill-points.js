const db = require('./src/config/database');
const { addPoints, POINTS } = require('./src/utils/pointsSystem');

async function backfillPoints() {
  console.log('🔄 Starting points backfill...\n');

  try {
    // Get all users
    const [users] = await db.execute('SELECT id, first_name, last_name FROM users');
    console.log(`Found ${users.length} users\n`);

    for (const user of users) {
      console.log(`\n👤 Processing ${user.first_name} ${user.last_name} (ID: ${user.id})`);
      let totalPoints = 0;

      // 1. Award points for posts
      const [posts] = await db.execute(
        'SELECT id, title FROM posts WHERE user_id = ?',
        [user.id]
      );
      
      if (posts.length > 0) {
        const postPoints = posts.length * POINTS.CREATE_POST;
        totalPoints += postPoints;
        console.log(`  📝 ${posts.length} posts × ${POINTS.CREATE_POST} = ${postPoints} points`);
        
        for (const post of posts) {
          await addPoints(
            user.id,
            POINTS.CREATE_POST,
            'create_post',
            `Backfill: Created post "${post.title}"`
          );
        }
      }

      // 2. Award points for replies
      const [replies] = await db.execute(
        'SELECT id FROM replies WHERE user_id = ?',
        [user.id]
      );
      
      if (replies.length > 0) {
        const replyPoints = replies.length * POINTS.CREATE_REPLY;
        totalPoints += replyPoints;
        console.log(`  💬 ${replies.length} replies × ${POINTS.CREATE_REPLY} = ${replyPoints} points`);
        
        for (const reply of replies) {
          await addPoints(
            user.id,
            POINTS.CREATE_REPLY,
            'create_reply',
            `Backfill: Created reply #${reply.id}`
          );
        }
      }

      // 3. Award points for reactions (only unique post/reply reactions)
      const [reactions] = await db.execute(
        'SELECT DISTINCT post_id, reply_id FROM reactions WHERE user_id = ?',
        [user.id]
      );
      
      if (reactions.length > 0) {
        const reactionPoints = reactions.length * POINTS.RECEIVE_REACTION;
        totalPoints += reactionPoints;
        console.log(`  ❤️  ${reactions.length} reactions × ${POINTS.RECEIVE_REACTION} = ${reactionPoints} points`);
        
        for (const reaction of reactions) {
          await addPoints(
            user.id,
            POINTS.RECEIVE_REACTION,
            'react',
            `Backfill: Reacted to ${reaction.post_id ? 'post' : 'reply'}`
          );
        }
      }

      // 4. Award points for bookmarks
      const [bookmarks] = await db.execute(
        'SELECT id FROM bookmarks WHERE user_id = ?',
        [user.id]
      );
      
      if (bookmarks.length > 0) {
        const bookmarkPoints = bookmarks.length * POINTS.POST_BOOKMARKED;
        totalPoints += bookmarkPoints;
        console.log(`  🔖 ${bookmarks.length} bookmarks × ${POINTS.POST_BOOKMARKED} = ${bookmarkPoints} points`);
        
        for (const bookmark of bookmarks) {
          await addPoints(
            user.id,
            POINTS.POST_BOOKMARKED,
            'bookmark',
            `Backfill: Bookmarked post`
          );
        }
      }

      // 5. Award points for follows
      const [follows] = await db.execute(
        'SELECT id FROM follows WHERE follower_id = ?',
        [user.id]
      );
      
      if (follows.length > 0) {
        const followPoints = follows.length * POINTS.FOLLOW_USER;
        totalPoints += followPoints;
        console.log(`  👥 ${follows.length} follows × ${POINTS.FOLLOW_USER} = ${followPoints} points`);
        
        for (const follow of follows) {
          await addPoints(
            user.id,
            POINTS.FOLLOW_USER,
            'follow_user',
            `Backfill: Followed user`
          );
        }
      }

      // Get final points and badge
      const [userResult] = await db.execute(
        'SELECT points, badge FROM users WHERE id = ?',
        [user.id]
      );

      console.log(`  ✅ Total: ${userResult[0].points} points, Badge: ${userResult[0].badge}`);
    }

    console.log('\n\n🎉 Points backfill completed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Error during backfill:', error);
    process.exit(1);
  }
}

// Run the backfill
backfillPoints();
