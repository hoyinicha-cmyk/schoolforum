const db = require('./backend/src/config/database');

async function testAdminNotification() {
  try {
    console.log('🧪 Testing admin post notification...\n');
    
    // Get admin and demo user info
    const [users] = await db.execute(
      'SELECT id, email, role, year_level FROM users WHERE id IN (1, 3)'
    );
    console.log('Users:', users);
    
    // Check follows
    const [follows] = await db.execute(
      'SELECT * FROM follows WHERE following_id = 1'
    );
    console.log('\nFollowers of admin:', follows);
    
    // Simulate notification creation for G12 post
    const postId = 999; // Test post ID
    const adminId = 1;
    const forumType = 'g12';
    
    // Get followers with year level and role
    const [followers] = await db.execute(
      `SELECT u.id, u.email, u.year_level, u.role 
       FROM follows f
       JOIN users u ON f.follower_id = u.id
       WHERE f.following_id = ? AND u.status = 'active'`,
      [adminId]
    );
    
    console.log('\nActive followers:', followers);
    
    let notifiedCount = 0;
    
    // Filter followers based on forum access
    for (const follower of followers) {
      let canAccess = false;
      
      // Check if follower can access this forum
      if (forumType === 'general') {
        canAccess = true;
      } else if (forumType === 'g11' || forumType === 'g12') {
        // Admin and moderators can access all forums
        if (follower.role === 'admin' || follower.role === 'moderator') {
          canAccess = true;
        }
        // Students can only access their own grade forum
        else if (follower.year_level === forumType.toUpperCase()) {
          canAccess = true;
        }
      }
      
      console.log(`\n${follower.email}:`);
      console.log(`  - Role: ${follower.role}`);
      console.log(`  - Year Level: ${follower.year_level}`);
      console.log(`  - Forum: ${forumType}`);
      console.log(`  - Can Access: ${canAccess}`);
      
      if (canAccess) {
        notifiedCount++;
      }
    }
    
    console.log(`\n✅ Would notify ${notifiedCount} out of ${followers.length} followers`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testAdminNotification();
