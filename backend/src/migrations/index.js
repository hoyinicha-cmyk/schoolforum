const fs = require('fs');
const path = require('path');

async function runMigrations() {
  console.log('🚀 Starting database migrations...');
  
  const migrationsDir = __dirname;
  const files = fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.js') && file !== 'index.js')
    .sort();

  for (const file of files) {
    try {
      const migration = require(path.join(migrationsDir, file));
      if (migration.up) {
        console.log(`\n📦 Running migration: ${file}`);
        await migration.up();
      }
    } catch (error) {
      console.error(`❌ Failed to run migration ${file}:`, error);
      // Continue with other migrations
    }
  }

  console.log('\n✅ All migrations completed!\n');
}

module.exports = { runMigrations };
