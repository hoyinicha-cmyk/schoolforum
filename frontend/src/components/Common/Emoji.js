import React from 'react';

/**
 * Emoji component that displays iOS-style emojis using Apple Color Emoji font
 * Falls back to other emoji fonts on non-Apple devices
 * @param {string} emoji - The emoji character
 * @param {string} size - Size in pixels or Tailwind class
 * @param {string} className - Additional CSS classes
 */
const Emoji = ({ emoji, size = '32px', className = '' }) => {
  if (!emoji) return null;

  // Determine if size is a number or Tailwind class
  const isPixelSize = !isNaN(size) || size.includes('px');
  const fontSize = isPixelSize ? size : undefined;

  return (
    <span 
      className={`inline-flex items-center justify-center ${!isPixelSize ? size : ''} ${className}`}
      style={{
        fontFamily: '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif',
        fontSize: fontSize,
        lineHeight: 1,
        verticalAlign: 'middle',
        // Force emoji rendering style
        fontVariantEmoji: 'emoji',
        textRendering: 'optimizeLegibility',
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale'
      }}
      role="img"
      aria-label={emoji}
    >
      {emoji}
    </span>
  );
};

export default Emoji;
