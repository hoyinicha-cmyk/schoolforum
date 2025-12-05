-- Change user role from admin to student
UPDATE users 
SET role = 'student' 
WHERE email = 'hoyinicha@gmail.com';

-- Verify the change
SELECT id, email, role, status 
FROM users 
WHERE email = 'hoyinicha@gmail.com';
