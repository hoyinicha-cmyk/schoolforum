const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function resetPassword() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'school_forum',
      port: process.env.DB_PORT || 3306
    });

    console.log('📄 Connected to database\n');

    const email = 'tulingtuling@example.com';
    const newPassword = 'Tuling123!';  // Temporary password

    console.log('🔧 Resetting password for:', email);
    console.log('📝 New temporary password:', newPassword);
    console.log('');

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update the password
    const [result] = await connection.query(
      'UPDATE users SET password = ?, updated_at = NOW() WHERE email = ?',
      [hashedPassword, email]
    );

    if (result.affectedRows > 0) {
      console.log('✅ Password reset successfully!\n');
      console.log('📋 Login credentials:');
      console.log('   Email:', email);
      console.log('   Password:', newPassword);
      console.log('');
      console.log('⚠️  IMPORTANT: Change this password after logging in!');
      console.log('   Go to Profile > Change Password');
    } else {
      console.log('❌ User not found');
    }

    await connection.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

resetPassword();
