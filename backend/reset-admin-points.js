const db = require('./src/config/database');

async function resetAdminPoints() {
  try {
    console.log('🔄 Resetting admin points...\n');
    
    // Reset admin user (ID: 1) points to 0
    await db.execute(
      'UPDATE users SET points = 0, badge = "Forum Newbie" WHERE id = 1'
    );
    
    // Delete admin's point history
    await db.execute(
      'DELETE FROM points_history WHERE user_id = 1'
    );
    
    console.log('✅ Admin points reset to 0');
    console.log('✅ Admin badge reset to Forum Newbie');
    console.log('✅ Admin point history cleared\n');
    console.log('Now run: node backfill-points.js');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

resetAdminPoints();
