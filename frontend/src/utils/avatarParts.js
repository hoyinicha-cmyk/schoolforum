// Avatar customization parts - Anime/Naruto inspired

export const skinTones = [
  { id: 1, name: 'Light', color: '#FFE0BD' },
  { id: 2, name: 'Fair', color: '#FFCD94' },
  { id: 3, name: 'Medium', color: '#E0AC69' },
  { id: 4, name: 'Tan', color: '#C68642' },
  { id: 5, name: 'Dark', color: '#8D5524' }
];

export const hairStyles = [
  { id: 1, name: 'Spiky', emoji: '🦔' }, // Naruto style
  { id: 2, name: 'Short', emoji: '✂️' },
  { id: 3, name: 'Long', emoji: '💇' },
  { id: 4, name: 'Messy', emoji: '🌪️' },
  { id: 5, name: 'Straight', emoji: '📏' },
  { id: 6, name: 'Curly', emoji: '🌀' }
];

export const hairColors = [
  { id: 1, name: 'Black', color: '#2C2C2C' },
  { id: 2, name: 'Brown', color: '#8B4513' },
  { id: 3, name: 'Blonde', color: '#FFD700' },
  { id: 4, name: 'Red', color: '#DC143C' },
  { id: 5, name: 'Blue', color: '#4169E1' },
  { id: 6, name: 'Pink', color: '#FF69B4' },
  { id: 7, name: 'White', color: '#F0F0F0' },
  { id: 8, name: 'Orange', color: '#FF8C00' }
];

export const eyeColors = [
  { id: 1, name: 'Brown', color: '#8B4513' },
  { id: 2, name: 'Blue', color: '#4169E1' },
  { id: 3, name: 'Green', color: '#228B22' },
  { id: 4, name: 'Gray', color: '#808080' },
  { id: 5, name: 'Red', color: '#DC143C' }
];

export const accessories = [
  { id: 0, name: 'None', emoji: '❌' },
  { id: 1, name: 'Headband', emoji: '🎀' }, // Like Naruto's forehead protector
  { id: 2, name: 'Glasses', emoji: '👓' },
  { id: 3, name: 'Mask', emoji: '😷' },
  { id: 4, name: 'Hat', emoji: '🎩' },
  { id: 5, name: 'Bandana', emoji: '🧣' }
];

export const defaultAvatar = {
  skinTone: 1,
  hairStyle: 1,
  hairColor: 3,
  eyeColor: 2,
  accessory: 1
};

export const encodeAvatar = (avatar) => {
  return `${avatar.skinTone}-${avatar.hairStyle}-${avatar.hairColor}-${avatar.eyeColor}-${avatar.accessory}`;
};

export const decodeAvatar = (code) => {
  if (!code) return defaultAvatar;
  const parts = code.split('-').map(Number);
  return {
    skinTone: parts[0] || 1,
    hairStyle: parts[1] || 1,
    hairColor: parts[2] || 3,
    eyeColor: parts[3] || 2,
    accessory: parts[4] || 0
  };
};
