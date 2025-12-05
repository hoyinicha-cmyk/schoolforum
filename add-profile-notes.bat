@echo off
echo Adding profile notes table...
cd backend
node -e "const migration = require('./src/migrations/006_add_profile_notes'); migration.up().then(() => { console.log('Done!'); process.exit(0); }).catch(err => { console.error(err); process.exit(1); });"
cd ..
pause
