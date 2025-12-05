// Thread emoji mapping based on prefix/category
const emojiMap = {
  // Question/Help related
  'question': '❓',
  'help': '🆘',
  'homework': '📚',
  'study': '📖',
  
  // Discussion types
  'discussion': '💬',
  'general': '🗣️',
  'announcement': '📢',
  'news': '📰',
  
  // Academic subjects
  'math': '🔢',
  'science': '🔬',
  'english': '📝',
  'history': '📜',
  'physics': '⚛️',
  'chemistry': '🧪',
  'biology': '🧬',
  'literature': '📚',
  
  // Activities
  'event': '🎉',
  'project': '🎯',
  'exam': '📝',
  'quiz': '✏️',
  'assignment': '📋',
  
  // Social
  'meme': '😂',
  'fun': '🎮',
  'off-topic': '🎭',
  'random': '🎲',
  'poll': '📊',
  
  // Support
  'bug': '🐛',
  'feedback': '💡',
  'suggestion': '💭',
  'complaint': '😤',
  
  // Status
  'solved': '✅',
  'closed': '🔒',
  'pinned': '📌',
  'important': '⚠️',
  
  // Grade specific
  'g11': '🎓',
  'g12': '🎓',
  'grade11': '🎓',
  'grade12': '🎓',
  
  // Default fallbacks
  'default': '📄'
};

// Additional emoji pool for random assignment
const emojiPool = [
  '🌟', '✨', '🎨', '🎪', '🎭', '🎬', '🎤', '🎧', '🎵', '🎸',
  '🎹', '🎺', '🎻', '🎲', '🎯', '🎰', '🎳', '🎮', '🎴', '🎁',
  '🏆', '🏅', '⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🏉', '🎱',
  '🌈', '🌸', '🌺', '🌻', '🌼', '🌷', '🌹', '🥀', '🌾', '🌿',
  '🍀', '🍁', '🍂', '🍃', '🌍', '🌎', '🌏', '🌐', '🌑', '🌒',
  '⭐', '🌟', '💫', '✨', '⚡', '🔥', '💧', '🌊', '🎈', '🎀'
];

/**
 * Get emoji for a thread based on its prefix
 * @param {string} prefix - The thread prefix
 * @param {number} id - Thread ID for consistent random emoji
 * @returns {string} - Emoji character
 */
export const getThreadEmoji = (prefix, id = 0) => {
  if (!prefix) {
    // Use thread ID to get consistent random emoji
    const index = id % emojiPool.length;
    return emojiPool[index];
  }
  
  const normalizedPrefix = prefix.toLowerCase().trim();
  
  // Check for exact match
  if (emojiMap[normalizedPrefix]) {
    return emojiMap[normalizedPrefix];
  }
  
  // Check for partial match
  for (const [key, emoji] of Object.entries(emojiMap)) {
    if (normalizedPrefix.includes(key) || key.includes(normalizedPrefix)) {
      return emoji;
    }
  }
  
  // Fallback to consistent random emoji based on ID
  const index = id % emojiPool.length;
  return emojiPool[index];
};

/**
 * Get emoji for a post/thread with fallback logic
 * @param {object} post - Post object with prefix and id
 * @returns {string} - Emoji character
 */
export const getPostEmoji = (post) => {
  if (post.prefix) {
    return getThreadEmoji(post.prefix, post.id);
  }
  
  // Check title for keywords
  const title = post.title?.toLowerCase() || '';
  
  for (const [key, emoji] of Object.entries(emojiMap)) {
    if (title.includes(key)) {
      return emoji;
    }
  }
  
  // Use ID for consistent random emoji
  return getThreadEmoji(null, post.id);
};

export default {
  getThreadEmoji,
  getPostEmoji,
  emojiMap,
  emojiPool
};
