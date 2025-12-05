const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkUser() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'school_forum'
    });

    console.log('✅ Connected to database\n');

    // Get your user info (you can change the email)
    console.log('Enter your email to check (or press Enter for all users):');
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });

    readline.question('Email: ', async (email) => {
      try {
        let query = 'SELECT id, email, first_name, last_name, year_level, status, role, email_verified FROM users';
        let params = [];
        
        if (email.trim()) {
          query += ' WHERE email = ?';
          params = [email.trim()];
        } else {
          query += ' ORDER BY created_at DESC LIMIT 10';
        }

        const [users] = await connection.execute(query, params);

        if (users.length === 0) {
          console.log('\n❌ No users found');
        } else {
          console.log('\n📋 User Information:\n');
          users.forEach(user => {
            console.log('═══════════════════════════════════════');
            console.log(`ID: ${user.id}`);
            console.log(`Email: ${user.email}`);
            console.log(`Name: ${user.first_name} ${user.last_name}`);
            console.log(`Year Level: ${user.year_level}`);
            console.log(`Status: ${user.status} ${user.status === 'active' ? '✅' : '⚠️'}`);
            console.log(`Role: ${user.role}`);
            console.log(`Email Verified: ${user.email_verified ? '✅ Yes' : '❌ No'}`);
            
            console.log('\n🎯 Forum Access:');
            console.log(`  General: ${user.status === 'active' || user.status === 'pending' ? '✅ Yes' : '❌ No'}`);
            
            if (user.role === 'admin' || user.role === 'moderator') {
              console.log(`  G11: ✅ Yes (${user.role})`);
              console.log(`  G12: ✅ Yes (${user.role})`);
            } else if (user.status === 'active') {
              console.log(`  G11: ${user.year_level === 'G11' ? '✅ Yes' : '❌ No'}`);
              console.log(`  G12: ${user.year_level === 'G12' ? '✅ Yes' : '❌ No'}`);
            } else {
              console.log(`  G11: ❌ No (not active)`);
              console.log(`  G12: ❌ No (not active)`);
            }
            
            console.log('\n📝 Can Create Posts:');
            console.log(`  General: ${user.status !== 'banned' ? '✅ Yes' : '❌ No (banned)'}`);
            console.log(`  G11: ${user.status === 'active' && (user.role === 'admin' || user.role === 'moderator' || user.year_level === 'G11') ? '✅ Yes' : '❌ No'}`);
            console.log(`  G12: ${user.status === 'active' && (user.role === 'admin' || user.role === 'moderator' || user.year_level === 'G12') ? '✅ Yes' : '❌ No'}`);
            
            if (user.status !== 'active') {
              console.log('\n⚠️  NOTE: Your account status is "' + user.status + '"');
              console.log('   You need "active" status to post in G11/G12 forums.');
              console.log('   Contact an admin to activate your account.');
            }
            
            if (!user.email_verified) {
              console.log('\n⚠️  NOTE: Your email is not verified');
              console.log('   You can still post in General forum.');
              console.log('   Verify your email to post in G11/G12 forums.');
            }
          });
          console.log('═══════════════════════════════════════\n');
        }

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

checkUser();
