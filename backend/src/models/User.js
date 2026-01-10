const { supabaseAdmin } = require('../config/supabaseAdmin');

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

    const grade = gradeLevel || yearLevel;
    const schoolId = schoolIdNumber || '';

    let defaultAvatar = 16;
    if (gender === 'male') {
      defaultAvatar = 16;
    } else if (gender === 'female') {
      defaultAvatar = 17;
    }

    const { data, error } = await supabaseAdmin
      .from('users')
      .insert([{
        email,
        password,
        first_name: firstName,
        last_name: lastName,
        year_level: grade,
        school_id_path: schoolIdPath || null,
        school_id_number: schoolId,
        status,
        role,
        email_verified: emailVerified,
        gender,
        avatar_id: defaultAvatar
      }])
      .select()
      .single();

    if (error) throw error;
    return data.id;
  }

  static async findByEmail(email) {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  static async findById(id) {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select(`
        id, email, first_name, last_name, year_level,
        status, role, email_verified, avatar_id, profile_photo,
        school_id_number, badge, created_at
      `)
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    return {
      id: data.id,
      email: data.email,
      firstName: data.first_name,
      lastName: data.last_name,
      year_level: data.year_level,
      yearLevel: data.year_level,
      status: data.status,
      role: data.role,
      emailVerified: data.email_verified,
      avatarId: data.avatar_id,
      profilePhoto: data.profile_photo,
      schoolIdNumber: data.school_id_number,
      badge: data.badge,
      createdAt: data.created_at
    };
  }

  static async updateProfilePhoto(id, photoPath) {
    const { error } = await supabaseAdmin
      .from('users')
      .update({ profile_photo: photoPath, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
  }

  static async updateEmailVerification(id, isVerified = true) {
    const { error } = await supabaseAdmin
      .from('users')
      .update({ email_verified: isVerified, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
  }

  static async updateStatus(id, status, role = null) {
    const updates = { status, updated_at: new Date().toISOString() };
    if (role) updates.role = role;

    const { error } = await supabaseAdmin
      .from('users')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
  }

  static async getPendingUsers() {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('id, email, first_name, last_name, year_level, school_id_path, created_at')
      .eq('status', 'pending')
      .eq('email_verified', true)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  static async deleteSchoolId(id) {
    const { error } = await supabaseAdmin
      .from('users')
      .update({ school_id_path: null })
      .eq('id', id);

    if (error) throw error;
  }

  static async updateYearLevel(id, yearLevel) {
    const { error } = await supabaseAdmin
      .from('users')
      .update({ year_level: yearLevel, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
  }

  static async updateSchoolId(id, schoolIdPath) {
    const { error } = await supabaseAdmin
      .from('users')
      .update({ school_id_path: schoolIdPath, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
  }

  static async updateSchoolIdNumber(id, schoolIdNumber) {
    const { error } = await supabaseAdmin
      .from('users')
      .update({ school_id_number: schoolIdNumber, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
  }

  static async query(sqlQuery, params) {
    const { data, error } = await supabaseAdmin.rpc('exec_sql', {
      query: sqlQuery,
      params: params
    });

    if (error) throw error;
    return data || [];
  }

  static async getStats() {
    const { count: total } = await supabaseAdmin
      .from('users')
      .select('*', { count: 'exact', head: true });

    const { count: pending } = await supabaseAdmin
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    const { count: active } = await supabaseAdmin
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    const { count: g11 } = await supabaseAdmin
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('year_level', 'G11')
      .eq('status', 'active');

    const { count: g12 } = await supabaseAdmin
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('year_level', 'G12')
      .eq('status', 'active');

    return {
      total: total || 0,
      pending: pending || 0,
      active: active || 0,
      g11: g11 || 0,
      g12: g12 || 0
    };
  }

  static async findAll() {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select(`
        id, email, first_name, last_name, year_level,
        status, status_reason, role, email_verified,
        avatar_id, profile_photo, school_id_number, created_at
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(user => ({
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      yearLevel: user.year_level,
      status: user.status,
      statusReason: user.status_reason,
      role: user.role,
      emailVerified: user.email_verified,
      avatarId: user.avatar_id,
      profilePhoto: user.profile_photo,
      schoolIdNumber: user.school_id_number,
      createdAt: user.created_at
    }));
  }

  static async updatePassword(id, hashedPassword) {
    const { error } = await supabaseAdmin
      .from('users')
      .update({ password: hashedPassword, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
  }

  static async update(id, userData) {
    const { firstName, lastName, email, password, role, gradeLevel, schoolIdNumber, avatarId, profilePhoto } = userData;

    const updates = { updated_at: new Date().toISOString() };

    if (firstName) updates.first_name = firstName;
    if (lastName) updates.last_name = lastName;
    if (email) updates.email = email;
    if (password) updates.password = password;
    if (role) updates.role = role;
    if (gradeLevel) {
      const formattedGrade = gradeLevel.startsWith('G') ? gradeLevel : `G${gradeLevel}`;
      updates.year_level = formattedGrade;
    }
    if (schoolIdNumber !== undefined) updates.school_id_number = schoolIdNumber;
    if (avatarId !== undefined) updates.avatar_id = avatarId;
    if (profilePhoto !== undefined) updates.profile_photo = profilePhoto;

    const { error } = await supabaseAdmin
      .from('users')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
  }

  static async delete(id) {
    const { error } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  static async updateStatusReason(id, reason) {
    const { error } = await supabaseAdmin
      .from('users')
      .update({ status_reason: reason, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
  }
}

module.exports = User;