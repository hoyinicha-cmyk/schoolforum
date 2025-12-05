const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function resetPassword() {
  const email = process.argv[2];
  const newPassword = process.argv[3];
  
  if (!email || !newPassword) {
    console.log('Usage: node reset-password.js <email> <new-password>');
    console.log('Example: node reset-password.js admin@school.edu newpass123');
    process.exit(1);
  }
  
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'school_forum'
  });

  try {
    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update the password
    const [result] = await connection.execute(
      'UPDATE users SET password = ? WHERE email = ?',
      [hashedPassword, email]
    );
    
    if (result.affectedRows === 0) {
      console.log('❌ User not found with email:', email);
    } else {
      console.log('✅ Password updated successfully!');
      console.log('Email:', email);
      console.log('New Password:', newPassword);
      console.log('\nYou can now login with these credentials.');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

resetPassword();
