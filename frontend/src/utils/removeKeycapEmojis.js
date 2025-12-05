/**
 * Remove keycap emoji numbers (blue boxes) from text
 * Keycap emojis are: 0️⃣ 1️⃣ 2️⃣ 3️⃣ 4️⃣ 5️⃣ 6️⃣ 7️⃣ 8️⃣ 9️⃣
 */
const removeKeycapEmojis = (text) => {
  if (!text) return text;
  
  // Remove all keycap number emojis
  return text
    .replace(/0️⃣/g, '')
    .replace(/1️⃣/g, '')
    .replace(/2️⃣/g, '')
    .replace(/3️⃣/g, '')
    .replace(/4️⃣/g, '')
    .replace(/5️⃣/g, '')
    .replace(/6️⃣/g, '')
    .replace(/7️⃣/g, '')
    .replace(/8️⃣/g, '')
    .replace(/9️⃣/g, '')
    .replace(/\*️⃣/g, '')
    .replace(/#️⃣/g, '');
};

export { removeKeycapEmojis };
export default removeKeycapEmojis;
