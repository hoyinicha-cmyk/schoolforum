require('dotenv').config();
const bcrypt = require('bcryptjs');
const { supabaseAdmin } = require('../config/supabaseAdmin');

async function seedDatabase() {
  try {
    console.log('🌱 Seeding database with default users...');

    const adminPassword = await bcrypt.hash('AdminPass123!', 12);
    const modPassword = await bcrypt.hash('ModPass123!', 12);
    const studentPassword = await bcrypt.hash('StudentPass123!', 12);

    const { data: existingAdmin } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', 'admin@school.edu')
      .maybeSingle();

    if (!existingAdmin) {
      const { error: adminError } = await supabaseAdmin
        .from('users')
        .insert([{
          email: 'admin@school.edu',
          password: adminPassword,
          first_name: 'System',
          last_name: 'Administrator',
          year_level: 'G12',
          status: 'active',
          role: 'admin',
          email_verified: true,
          avatar_id: 16,
          points: 0,
          badge: 'Forum Newbie'
        }]);

      if (adminError) {
        console.error('Error creating admin:', adminError);
      } else {
        console.log('✅ Admin account created: admin@school.edu / AdminPass123!');
      }
    } else {
      console.log('ℹ️  Admin account already exists');
    }

    const { data: existingMod } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', 'moderator@school.edu')
      .maybeSingle();

    if (!existingMod) {
      const { error: modError } = await supabaseAdmin
        .from('users')
        .insert([{
          email: 'moderator@school.edu',
          password: modPassword,
          first_name: 'Forum',
          last_name: 'Moderator',
          year_level: 'G12',
          status: 'active',
          role: 'moderator',
          email_verified: true,
          avatar_id: 16,
          points: 0,
          badge: 'Forum Newbie'
        }]);

      if (modError) {
        console.error('Error creating moderator:', modError);
      } else {
        console.log('✅ Moderator account created: moderator@school.edu / ModPass123!');
      }
    } else {
      console.log('ℹ️  Moderator account already exists');
    }

    const { data: existingStudent } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', 'student@gmail.com')
      .maybeSingle();

    if (!existingStudent) {
      const { error: studentError } = await supabaseAdmin
        .from('users')
        .insert([{
          email: 'student@gmail.com',
          password: studentPassword,
          first_name: 'Demo',
          last_name: 'Student',
          year_level: 'G11',
          status: 'active',
          role: 'student',
          email_verified: true,
          avatar_id: 17,
          points: 0,
          badge: 'Forum Newbie'
        }]);

      if (studentError) {
        console.error('Error creating student:', studentError);
      } else {
        console.log('✅ Demo student account created: student@gmail.com / StudentPass123!');
      }
    } else {
      console.log('ℹ️  Demo student account already exists');
    }

    console.log('✅ Database seeding completed!');
    return true;
  } catch (error) {
    console.error('❌ Database seeding failed:', error.message);
    return false;
  }
}

if (require.main === module) {
  seedDatabase().then(() => process.exit(0)).catch(() => process.exit(1));
}

module.exports = { seedDatabase };
