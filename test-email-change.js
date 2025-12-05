const db = require('./backend/src/config/database');

async function testEmailChangeSetup() {
  console.log('🧪 Testing Email Change Database Setup\n');
  
  try {
    // Test 1: Check if table exists
    console.log('📝 Test 1: Checking if email_change_codes table exists...');
    const [tables] = await db.execute("SHOW TABLES LIKE 'email_change_codes'");
    
    if (tables.length === 0) {
      console.error('❌ Table does not exist!');
      process.exit(1);
    }
    
    console.log('✅ Table exists!\n');
    
    // Test 2: Check table structure
    console.log('📝 Test 2: Checking table structure...');
    const [columns] = await db.execute('DESCRIBE email_change_codes');
    
    console.log('✅ Table structure:');
    columns.forEach(col => {
      console.log(`   - ${col.Field} (${col.Type}) ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${col.Key ? `[${col.Key}]` : ''}`);
    });
    
    // Test 3: Test insert
    console.log('\n📝 Test 3: Testing insert operation...');
    const testCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    
    await db.execute(
      'INSERT INTO email_change_codes (user_id, new_email, verification_code, expires_at) VALUES (?, ?, ?, ?)',
      [1, 'test@example.com', testCode, expiresAt]
    );
    
    console.log('✅ Insert successful!');
    console.log('   Test code:', testCode);
    
    // Test 4: Test select
    console.log('\n📝 Test 4: Testing select operation...');
    const [rows] = await db.execute(
      'SELECT * FROM email_change_codes WHERE verification_code = ?',
      [testCode]
    );
    
    if (rows.length === 0) {
      console.error('❌ Could not retrieve inserted record!');
      process.exit(1);
    }
    
    console.log('✅ Select successful!');
    console.log('   Record found:', {
      id: rows[0].id,
      user_id: rows[0].user_id,
      new_email: rows[0].new_email,
      verification_code: rows[0].verification_code,
      used: rows[0].used,
      expires_at: rows[0].expires_at
    });
    
    // Test 5: Test update
    console.log('\n📝 Test 5: Testing update operation...');
    await db.execute(
      'UPDATE email_change_codes SET used = TRUE WHERE verification_code = ?',
      [testCode]
    );
    
    const [updatedRows] = await db.execute(
      'SELECT used FROM email_change_codes WHERE verification_code = ?',
      [testCode]
    );
    
    if (updatedRows[0].used !== 1) {
      console.error('❌ Update failed!');
      process.exit(1);
    }
    
    console.log('✅ Update successful!');
    console.log('   Code marked as used:', updatedRows[0].used === 1);
    
    // Test 6: Test delete (cleanup)
    console.log('\n📝 Test 6: Cleaning up test data...');
    await db.execute(
      'DELETE FROM email_change_codes WHERE verification_code = ?',
      [testCode]
    );
    
    const [deletedRows] = await db.execute(
      'SELECT * FROM email_change_codes WHERE verification_code = ?',
      [testCode]
    );
    
    if (deletedRows.length > 0) {
      console.error('❌ Delete failed!');
      process.exit(1);
    }
    
    console.log('✅ Delete successful!\n');
    
    // Test 7: Check existing codes
    console.log('📝 Test 7: Checking for existing email change codes...');
    const [existingCodes] = await db.execute(
      'SELECT COUNT(*) as count FROM email_change_codes'
    );
    
    console.log('✅ Total codes in database:', existingCodes[0].count);
    
    if (existingCodes[0].count > 0) {
      const [recentCodes] = await db.execute(
        'SELECT user_id, new_email, verification_code, used, created_at, expires_at FROM email_change_codes ORDER BY created_at DESC LIMIT 5'
      );
      
      console.log('\n📋 Recent codes:');
      recentCodes.forEach((code, index) => {
        console.log(`\n   ${index + 1}. Code: ${code.verification_code}`);
        console.log(`      User ID: ${code.user_id}`);
        console.log(`      New Email: ${code.new_email}`);
        console.log(`      Used: ${code.used ? 'Yes' : 'No'}`);
        console.log(`      Created: ${code.created_at}`);
        console.log(`      Expires: ${code.expires_at}`);
      });
    }
    
    console.log('\n✅ All database tests passed! Email change system is ready! 🎉');
    console.log('\n📌 Next steps:');
    console.log('   1. Start the backend server: npm start (in backend folder)');
    console.log('   2. Start the frontend: npm start (in frontend folder)');
    console.log('   3. Login and try changing your email in Profile settings');
    console.log('   4. Check your email for the 6-digit verification code');
    
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Test failed with error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run the test
testEmailChangeSetup();
