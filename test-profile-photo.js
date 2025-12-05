const db = require('./backend/src/config/database');

async function test() {
  try {
    console.log('Testing profile_photo column...\n');
    
    // Check if column exists
    const [columns] = await db.execute('DESCRIBE users');
    const hasProfilePhoto = columns.some(col => col.Field === 'profile_photo');
    
    if (hasProfilePhoto) {
      console.log('✅ profile_photo column EXISTS');
      
      // Show column details
      const photoCol = columns.find(col => col.Field === 'profile_photo');
      console.log(`   Type: ${photoCol.Type}`);
      console.log(`   Null: ${photoCol.Null}`);
      console.log(`   Default: ${photoCol.Default}`);
    } else {
      console.log('❌ profile_photo column DOES NOT EXIST');
      console.log('\n📝 Run this command to add it:');
      console.log('   add-profile-photo.bat');
    }
    
    console.log('\n📋 All columns in users table:');
    columns.forEach(col => {
      console.log(`   - ${col.Field} (${col.Type})`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

test();
