const mysql = require('mysql2/promise');
require('dotenv').config();

async function activateAccount() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'school_forum'
    });

    console.log('✅ Connected to database\n');

    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });

    readline.question('Enter your email: ', async (email) => {
      try {
        if (!email.trim()) {
          console.log('❌ Email is required');
          await connection.end();
          readline.close();
          return;
        }

        // Check if user exists
        const [users] = await connection.execute(
          'SELECT id, email, first_name, last_name, status, email_verified FROM users WHERE email = ?',
          [email.trim()]
        );

        if (users.length === 0) {
          console.log('\n❌ User not found with email:', email);
          await connection.end();
          readline.close();
          return;
        }

        const user = users[0];
        console.log('\n📋 Current Status:');
        console.log(`  Name: ${user.first_name} ${user.last_name}`);
        console.log(`  Status: ${user.status}`);
        console.log(`  Email Verified: ${user.email_verified ? 'Yes' : 'No'}`);

        // Update user
        await connection.execute(
          'UPDATE users SET status = ?, email_verified = ? WHERE id = ?',
          ['active', 1, user.id]
        );

        console.log('\n✅ Account Activated!');
        console.log('  Status: active');
        console.log('  Email Verified: Yes');
        console.log('\n🎉 You can now:');
        console.log('  ✅ Post in General forum');
        console.log('  ✅ Post in your grade forum (G11/G12)');
        console.log('  ✅ React to posts');
        console.log('  ✅ Bookmark posts');
        console.log('\n🔄 Please restart your backend and try again!');

        await connection.end();
        readline.close();
      } catch (error) {
        console.error('❌ Error:', error.message);
        await connection.end();
        readline.close();
      }
    });

  } catch (error) {
    console.error('❌ Connection error:', error.message);
    process.exit(1);
  }
}

activateAccount();
