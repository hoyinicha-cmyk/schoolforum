const nodemailer = require('nodemailer');

async function setupTestEmail() {
  try {
    // Create a test account using nodemailer's built-in testAccount generator
    const testAccount = await nodemailer.createTestAccount();
    
    console.log('\n📧 Test Email Account Generated:');
    console.log('Host:', testAccount.smtp.host);
    console.log('Port:', testAccount.smtp.port);
    console.log('Secure:', testAccount.smtp.secure);
    console.log('Username:', testAccount.user);
    console.log('Password:', testAccount.pass);
    console.log('Web URL:', `https://ethereal.email/login`);
    console.log('Login with username/password above to see emails\n');
    
    // Update .env file content
    const envConfig = `# Environment Variables
PORT=5000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=school_forum
DB_PORT=3306

# JWT Configuration
JWT_SECRET=super_secret_jwt_key_for_school_forum_development_2024
JWT_EXPIRES_IN=7d

# Gmail OAuth Configuration (Optional for demo)
GMAIL_CLIENT_ID=demo_client_id
GMAIL_CLIENT_SECRET=demo_client_secret

# Email Configuration - Test Account
EMAIL_USER=${testAccount.user}
EMAIL_PASS=${testAccount.pass}
EMAIL_FROM=School Forum <${testAccount.user}>
EMAIL_HOST=${testAccount.smtp.host}
EMAIL_PORT=${testAccount.smtp.port}
EMAIL_SECURE=${testAccount.smtp.secure}

# Frontend URL
FRONTEND_URL=http://localhost:3000

# File Upload Configuration
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
`;

    const fs = require('fs');
    fs.writeFileSync('.env', envConfig);
    console.log('✅ .env file updated with test email configuration');
    console.log('\n🔄 Please restart the backend server to apply changes');
    
  } catch (error) {
    console.error('❌ Error setting up test email:', error);
  }
}

if (require.main === module) {
  setupTestEmail();
}

module.exports = { setupTestEmail };