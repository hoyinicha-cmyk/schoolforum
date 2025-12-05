    // Avatar options using DiceBear API - Generates unique avatar images
// DiceBear provides free avatar generation with different styles

export const avatars = [
  { id: 1, name: 'Felix', style: 'adventurer', seed: 'Felix' },
  { id: 2, name: 'Aneka', style: 'adventurer', seed: 'Aneka' },
  { id: 3, name: 'Luna', style: 'adventurer', seed: 'Luna' },
  { id: 4, name: 'Max', style: 'adventurer', seed: 'Max' },
  { id: 5, name: 'Bella', style: 'adventurer', seed: 'Bella' },
  { id: 6, name: 'Oliver', style: 'adventurer', seed: 'Oliver' },
  { id: 7, name: 'Sophie', style: 'adventurer', seed: 'Sophie' },
  { id: 8, name: 'Leo', style: 'adventurer', seed: 'Leo' },
  { id: 9, name: 'Mia', style: 'adventurer', seed: 'Mia' },
  { id: 10, name: 'Noah', style: 'adventurer', seed: 'Noah' },
  { id: 11, name: 'Emma', style: 'adventurer', seed: 'Emma' },
  { id: 12, name: 'Liam', style: 'adventurer', seed: 'Liam' },
  { id: 13, name: 'Ava', style: 'adventurer', seed: 'Ava' },
  { id: 14, name: 'Ethan', style: 'adventurer', seed: 'Ethan' },
  { id: 15, name: 'Isabella', style: 'adventurer', seed: 'Isabella' },
  { id: 16, name: 'Mason', style: 'adventurer', seed: 'Mason' },
  { id: 17, name: 'Sophia', style: 'adventurer', seed: 'Sophia' },
  { id: 18, name: 'Lucas', style: 'adventurer', seed: 'Lucas' },
  { id: 19, name: 'Charlotte', style: 'adventurer', seed: 'Charlotte' },
  { id: 20, name: 'James', style: 'adventurer', seed: 'James' }
];

export const getAvatarById = (avatarId) => {
  return avatars.find(a => a.id === avatarId) || avatars[0];
};

export const getDefaultAvatar = () => avatars[0];

// Generate avatar URL using DiceBear API
export const getAvatarUrl = (avatarId, size = 200) => {
  const avatar = getAvatarById(avatarId);
  return `https://api.dicebear.com/7.x/${avatar.style}/svg?seed=${avatar.seed}&size=${size}`;
};
