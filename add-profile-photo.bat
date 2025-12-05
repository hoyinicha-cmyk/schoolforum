@echo off
echo Running profile photo migration...
cd backend
node -e "const migration = require('./src/migrations/004_add_profile_photo'); migration.up().then(() => { console.log('Done!'); process.exit(0); }).catch(err => { console.error(err); process.exit(1); });"
cd ..
pause
