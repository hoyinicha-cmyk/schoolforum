const mysql = require('mysql2/promise');
require('dotenv').config();

async function setYearLevel() {
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

        // Check current user
        const [users] = await connection.execute(
          'SELECT id, email, first_name, last_name, year_level, status, role FROM users WHERE email = ?',
          [email.trim()]
        );

        if (users.length === 0) {
          console.log('\n❌ User not found with email:', email);
          await connection.end();
          readline.close();
          return;
        }

        const user = users[0];
        console.log('\n📋 Current User Info:');
        console.log(`  Name: ${user.first_name} ${user.last_name}`);
        console.log(`  Email: ${user.email}`);
        console.log(`  Year Level: ${user.year_level}`);
        console.log(`  Status: ${user.status}`);
        console.log(`  Role: ${user.role}`);

        console.log('\n🎯 Forum Access:');
        console.log(`  General: ✅ Yes`);
        console.log(`  G11: ${user.status === 'active' && (user.year_level === 'G11' || user.role === 'admin' || user.role === 'moderator') ? '✅ Yes' : '❌ No'}`);
        console.log(`  G12: ${user.status === 'active' && (user.year_level === 'G12' || user.role === 'admin' || user.role === 'moderator') ? '✅ Yes' : '❌ No'}`);

        readline.question('\nWhich year level do you want? (G11/G12/admin): ', async (choice) => {
          try {
            choice = choice.trim().toUpperCase();

            if (choice === 'ADMIN') {
              // Make admin
              await connection.execute(
                'UPDATE users SET role = ?, status = ?, email_verified = ? WHERE id = ?',
                ['admin', 'active', 1, user.id]
              );
              console.log('\n✅ User updated to ADMIN!');
              console.log('  Role: admin');
              console.log('  Status: active');
              console.log('  Email Verified: Yes');
              console.log('\n🎉 You now have access to ALL forums!');
            } else if (choice === 'G11' || choice === 'G12') {
              // Set year level
              await connection.execute(
                'UPDATE users SET year_level = ?, status = ?, email_verified = ? WHERE id = ?',
                [choice, 'active', 1, user.id]
              );
              console.log(`\n✅ User updated to ${choice}!`);
              console.log(`  Year Level: ${choice}`);
              console.log('  Status: active');
              console.log('  Email Verified: Yes');
              console.log(`\n🎉 You can now post in ${choice} forum!`);
            } else {
              console.log('\n❌ Invalid choice. Use G11, G12, or admin');
            }

            console.log('\n🔄 Next steps:');
            console.log('1. Restart your backend: npm start');
            console.log('2. Refresh your browser');
            console.log('3. Try creating a thread in G11 forum');

            await connection.end();
            readline.close();
          } catch (error) {
            console.error('❌ Error:', error.message);
            await connection.end();
            readline.close();
          }
        });

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

setYearLevel();
