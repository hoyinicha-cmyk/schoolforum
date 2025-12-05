/**
 * Check if user has contributor privileges
 * PRIORITY: Role (admin/moderator/contributor) > Badge (Forum Contributor)
 * Admin, Moderator, and Contributor roles have full access regardless of badge
 */

export const hasContributorPrivileges = (user) => {
  if (!user) return false;
  
  // PRIORITY 1: Check role-based contributor access (ALWAYS GRANTED)
  const hasContributorRole = ['contributor', 'moderator', 'admin'].includes(user.role);
  if (hasContributorRole) return true;
  
  // PRIORITY 2: Check badge-based contributor access (Forum Contributor = 200+ points)
  const hasContributorBadge = user.badge === 'Forum Contributor';
  
  return hasContributorBadge;
};

/**
 * Check if user can lock/unlock threads (Expert level and above)
 * PRIORITY: Role (admin/moderator/contributor) > Badge (Expert/Contributor)
 * Admin, Moderator, and Contributor roles can ALWAYS lock threads
 */
export const canLockThreads = (user) => {
  if (!user) return false;
  
  // PRIORITY 1: Check role-based access (ALWAYS GRANTED)
  const hasContributorRole = ['contributor', 'moderator', 'admin'].includes(user.role);
  if (hasContributorRole) return true;
  
  // PRIORITY 2: Check badge-based access (Expert = 100+ points, Contributor = 200+ points)
  const hasExpertBadge = ['Forum Expert', 'Forum Contributor'].includes(user.badge);
  
  return hasExpertBadge;
};

/**
 * Check if user can access Student Chat (Active level and above)
 * PRIORITY: Role (admin/moderator/contributor) > Badge (Active/Expert/Contributor)
 * Admin, Moderator, and Contributor roles ALWAYS have chat access
 */
export const canAccessChat = (user) => {
  console.log('🔍 canAccessChat called with user:', user);
  
  if (!user) {
    console.log('❌ No user - access denied');
    return false;
  }
  
  console.log('👤 User role:', user.role);
  console.log('🎯 User badge:', user.badge);
  
  // PRIORITY 1: Admin, Moderator, Contributor always have access (ALWAYS GRANTED)
  if (['contributor', 'moderator', 'admin'].includes(user.role)) {
    console.log('✅ Access GRANTED via role:', user.role);
    return true;
  }
  
  // PRIORITY 2: Check badge-based access (Active = 25+ points and above)
  const hasActiveBadge = ['Forum Active', 'Forum Expert', 'Forum Contributor'].includes(user.badge);
  console.log('🎯 Badge check result:', hasActiveBadge ? `✅ Has active badge: ${user.badge}` : `❌ Badge not active: ${user.badge}`);
  
  return hasActiveBadge;
};

export const hasModeratorPrivileges = (user) => {
  if (!user) return false;
  return ['moderator', 'admin'].includes(user.role);
};

export const hasAdminPrivileges = (user) => {
  if (!user) return false;
  return user.role === 'admin';
};
