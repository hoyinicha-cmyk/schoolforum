const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const readline = require('readline');
require('dotenv').config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

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

    // Get email from user
    rl.question('Enter user email: ', async (email) => {
      // Check if user exists
      const [users] = await connection.query(
        'SELECT id, email, first_name, last_name, status FROM users WHERE email = ?',
        [email]
      );

      if (users.length === 0) {
        console.log('\n❌ User not found with email:', email);
        await connection.end();
        rl.close();
        return;
      }

      const user = users[0];
      console.log('\n✅ User found:');
      console.log('   Name:', user.first_name, user.last_name);
      console.log('   Email:', user.email);
      console.log('   Status:', user.status);
      console.log('');

      // Get new password
      rl.question('Enter new password (min 8 chars, uppercase, lowercase, number): ', async (newPassword) => {
        // Validate password
        if (newPassword.length < 8) {
          console.log('\n❌ Password must be at least 8 characters');
          await connection.end();
          rl.close();
          return;
        }

        if (!/[a-z]/.test(newPassword)) {
          console.log('\n❌ Password must contain at least one lowercase letter');
          await connection.end();
          rl.close();
          return;
        }

        if (!/[A-Z]/.test(newPassword)) {
          console.log('\n❌ Password must contain at least one uppercase letter');
          await connection.end();
          rl.close();
          return;
        }

        if (!/\d/.test(newPassword)) {
          console.log('\n❌ Password must contain at least one number');
          await connection.end();
          rl.close();
          return;
        }

        console.log('\n🔧 Resetting password...');

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 12);

        // Update the password
        const [result] = await connection.query(
          'UPDATE users SET password = ?, updated_at = NOW() WHERE email = ?',
          [hashedPassword, email]
        );

        if (result.affectedRows > 0) {
          console.log('\n✅ Password reset successfully!\n');
          console.log('📋 New login credentials:');
          console.log('   Email:', email);
          console.log('   Password:', newPassword);
          console.log('');
          console.log('⚠️  User can now login with the new password');
        } else {
          console.log('\n❌ Failed to update password');
        }

        await connection.end();
        rl.close();
      });
    });
  } catch (error) {
    console.error('❌ Error:', error.message);
    rl.close();
    process.exit(1);
  }
}

resetPassword();
