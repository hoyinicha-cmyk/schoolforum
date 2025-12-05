/**
 * Check if user has contributor privileges
 * PRIORITY: Role (admin/moderator/contributor) > Badge (Forum Contributor)
 * Admin, Moderator, and Contributor roles have full access regardless of badge
 */

const hasContributorPrivileges = (user) => {
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
const canLockThreads = (user) => {
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
const canAccessChat = (user) => {
  // PRIORITY 1: Check role-based access (ALWAYS GRANTED)
  const hasRole = ['contributor', 'moderator', 'admin'].includes(user.role);
  if (hasRole) return true;
  
  // PRIORITY 2: Check badge-based access (Active = 25+ points and above)
  const hasActiveBadge = ['Forum Active', 'Forum Expert', 'Forum Contributor'].includes(user.badge);
  
  return hasActiveBadge;
};

const hasModeratorPrivileges = (user) => {
  return ['moderator', 'admin'].includes(user.role);
};

const hasAdminPrivileges = (user) => {
  return user.role === 'admin';
};

module.exports = {
  hasContributorPrivileges,
  hasModeratorPrivileges,
  hasAdminPrivileges,
  canLockThreads,
  canAccessChat
};
