const mysql = require('mysql2/promise');

async function changeUserRole() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'school_forum'
  });

  try {
    console.log('Changing user role to student...');
    
    const [result] = await connection.execute(
      "UPDATE users SET role = 'student' WHERE email = 'hoyinicha@gmail.com'"
    );
    
    console.log('✅ User role updated successfully!');
    console.log('Rows affected:', result.affectedRows);
    
    // Verify the change
    const [users] = await connection.execute(
      "SELECT id, email, role, status FROM users WHERE email = 'hoyinicha@gmail.com'"
    );
    
    console.log('\nUser details:');
    console.log(users[0]);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

changeUserRole();
