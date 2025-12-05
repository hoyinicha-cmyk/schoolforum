const db = require('./backend/src/config/database');

async function checkTables() {
  try {
    console.log('🔍 Checking email-related tables...\n');
    
    const [tables] = await db.execute("SHOW TABLES LIKE 'email_%'");
    
    if (tables.length === 0) {
      console.log('❌ No email tables found!');
      process.exit(1);
    }
    
    console.log('✅ Found email tables:');
    for (const table of tables) {
      const tableName = Object.values(table)[0];
      console.log(`\n📋 Table: ${tableName}`);
      
      const [columns] = await db.execute(`DESCRIBE ${tableName}`);
      columns.forEach(col => {
        console.log(`   - ${col.Field} (${col.Type})`);
      });
    }
    
    console.log('\n✅ Migration successful!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkTables();
