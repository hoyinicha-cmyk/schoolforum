const { seedDatabase } = require('./seedDatabase');

const setupDatabase = async () => {
  console.log('📄 Using Supabase database - no local setup needed');
  console.log('📄 Tables already created via Supabase migrations');

  try {
    await seedDatabase();
    return true;
  } catch (error) {
    console.log('⚠️  Seeding skipped - will seed on first request');
    return true;
  }
};

module.exports = { setupDatabase };