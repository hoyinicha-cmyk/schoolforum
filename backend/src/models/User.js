const db = require('../config/database');

class User {
  static async create(userData) {
    const { 
      email, 
      password, 
      firstName, 
      lastName, 
      yearLevel, 
      gradeLevel,
      schoolIdPath, 
      schoolIdNumber,
      status = 'pending',
      role = 'student',
      emailVerified = false,
      gender = 'prefer_not_to_say'
    } = userData;
    
    // Use gradeLevel if provided, otherwise use yearLevel (for backward compatibility)
    const grade = gradeLevel || yearLevel;
    const schoolId = schoolIdNumber || '';
    
    // Set default avatar based on gender
    let defaultAvatar = 16; // Mason - default for prefer_not_to_say
    if (gender === 'male') {
      defaultAvatar = 16; // Mason
    } else if (gender === 'female') {
      defaultAvatar = 17; // Sophia
    }
    
    const [result] = await db.execute(
      `INSERT INTO users (email, password, first_name, last_name, year_level, school_id_path, school_id_number, status, role, email_verified, gender, avatar_id, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [email, password, firstName, lastName, grade, schoolIdPath || null, schoolId, status, role, emailVerified ? 1 : 0, gender, defaultAvatar]
    );
    
    return result.insertId;
  }
  
  static async findByEmail(email) {
    const [rows] = await db.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    return rows[0];
  }
  
  static async findById(id) {
    const [rows] = await db.execute(
      'SELECT id, email, first_name as firstName, last_name as lastName, year_level, year_level as yearLevel, status, role, email_verified as emailVerified, avatar_id as avatarId, profile_photo as profilePhoto, school_id_number as schoolIdNumber, badge, created_at as createdAt FROM users WHERE id = ?',
      [id]
    );
    return rows[0];
  }
  
  static async updateProfilePhoto(id, photoPath) {
    await db.execute(
      'UPDATE users SET profile_photo = ?, updated_at = NOW() WHERE id = ?',
      [photoPath, id]
    );
  }
  
  static async updateEmailVerification(id, isVerified = true) {
    await db.execute(
      'UPDATE users SET email_verified = ?, updated_at = NOW() WHERE id = ?',
      [isVerified, id]
    );
  }
  
  static async updateStatus(id, status, role = null) {
    if (role) {
      await db.execute(
        'UPDATE users SET status = ?, role = ?, updated_at = NOW() WHERE id = ?',
        [status, role, id]
      );
    } else {
      await db.execute(
        'UPDATE users SET status = ?, updated_at = NOW() WHERE id = ?',
        [status, id]
      );
    }
  }
  
  static async getPendingUsers() {
    const [rows] = await db.execute(
      `SELECT id, email, first_name, last_name, year_level, school_id_path, created_at 
       FROM users 
       WHERE status = 'pending' AND email_verified = 1
       ORDER BY created_at ASC`
    );
    return rows;
  }
  
  static async deleteSchoolId(id) {
    await db.execute(
      'UPDATE users SET school_id_path = NULL WHERE id = ?',
      [id]
    );
  }
  
  static async updateYearLevel(id, yearLevel) {
    await db.execute(
      'UPDATE users SET year_level = ?, updated_at = NOW() WHERE id = ?',
      [yearLevel, id]
    );
  }
  
  static async updateSchoolId(id, schoolIdPath) {
    await db.execute(
      'UPDATE users SET school_id_path = ?, updated_at = NOW() WHERE id = ?',
      [schoolIdPath, id]
    );
  }
  
  static async updateSchoolIdNumber(id, schoolIdNumber) {
    await db.execute(
      'UPDATE users SET school_id_number = ?, updated_at = NOW() WHERE id = ?',
      [schoolIdNumber, id]
    );
  }
  
  static async query(query, params) {
    const [rows] = await db.execute(query, params);
    return rows;
  }
  
  static async getStats() {
    const [totalUsers] = await db.execute('SELECT COUNT(*) as count FROM users');
    const [pendingUsers] = await db.execute('SELECT COUNT(*) as count FROM users WHERE status = "pending"');
    const [activeUsers] = await db.execute('SELECT COUNT(*) as count FROM users WHERE status = "active"');
    const [g11Users] = await db.execute('SELECT COUNT(*) as count FROM users WHERE year_level = "G11" AND status = "active"');
    const [g12Users] = await db.execute('SELECT COUNT(*) as count FROM users WHERE year_level = "G12" AND status = "active"');
    
    return {
      total: totalUsers[0].count,
      pending: pendingUsers[0].count,
      active: activeUsers[0].count,
      g11: g11Users[0].count,
      g12: g12Users[0].count
    };
  }

  static async findAll() {
    const [rows] = await db.execute(`
      SELECT 
        id, 
        email, 
        first_name as firstName, 
        last_name as lastName, 
        year_level as yearLevel, 
        status, 
        status_reason as statusReason,
        role, 
        email_verified as emailVerified,
        avatar_id as avatarId,
        profile_photo as profilePhoto,
        school_id_number as schoolIdNumber,
        created_at as createdAt
      FROM users 
      ORDER BY created_at DESC
    `);
    return rows;
  }
  static async updatePassword(id, hashedPassword) {
  await db.execute(
    'UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?',
    [hashedPassword, id]
  );
  }

  static async update(id, userData) {
    const { firstName, lastName, email, password, role, gradeLevel, schoolIdNumber, avatarId, profilePhoto } = userData;
    
    const updates = [];
    const values = [];
    
    if (firstName) {
      updates.push('first_name = ?');
      values.push(firstName);
    }
    if (lastName) {
      updates.push('last_name = ?');
      values.push(lastName);
    }
    if (email) {
      updates.push('email = ?');
      values.push(email);
    }
    if (password) {
      updates.push('password = ?');
      values.push(password);
    }
    if (role) {
      updates.push('role = ?');
      values.push(role);
    }
    if (gradeLevel) {
      updates.push('year_level = ?');
      // Convert "11" or "12" to "G11" or "G12" format
      const formattedGrade = gradeLevel.startsWith('G') ? gradeLevel : `G${gradeLevel}`;
      values.push(formattedGrade);
    }
    if (schoolIdNumber !== undefined) {
      updates.push('school_id_number = ?');
      values.push(schoolIdNumber);
    }
    if (avatarId !== undefined) {
      updates.push('avatar_id = ?');
      values.push(avatarId);
    }
    if (profilePhoto !== undefined) {
      updates.push('profile_photo = ?');
      values.push(profilePhoto);
    }
    
    if (updates.length === 0) {
      return;
    }
    
    updates.push('updated_at = NOW()');
    values.push(id);
    
    await db.execute(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      values
    );
  }
  
  static async delete(id) {
    await db.execute(
      'DELETE FROM users WHERE id = ?',
      [id]
    );
  }

  static async updateStatusReason(id, reason) {
    await db.execute(
      'UPDATE users SET status_reason = ?, updated_at = NOW() WHERE id = ?',
      [reason, id]
    );
  }
}

module.exports = User;