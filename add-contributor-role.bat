@echo off
echo Adding contributor role...
cd backend
node -e "const migration = require('./src/migrations/005_add_contributor_role'); migration.up().then(() => { console.log('Done!'); process.exit(0); }).catch(err => { console.error(err); process.exit(1); });"
cd ..
pause
