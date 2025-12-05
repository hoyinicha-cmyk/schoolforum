@echo off
echo Running email_change_confirmations migration...
node -e "const db = require('./backend/src/config/database'); const migration = require('./backend/src/migrations/006_add_email_change_confirmation'); migration.up().then(() => { console.log('Migration complete!'); process.exit(0); }).catch(err => { console.error('Error:', err); process.exit(1); });"
pause
