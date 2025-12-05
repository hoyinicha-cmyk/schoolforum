@echo off
echo Restoring admin role...
node -e "const db = require('./backend/src/config/database'); db.execute('UPDATE users SET role = \"admin\" WHERE email = \"admin@school.edu\"').then(() => { console.log('✅ Admin role restored!'); console.log('Now logout and login again.'); process.exit(0); }).catch(err => { console.error('❌ Error:', err.message); process.exit(1); });"
pause
