// Utility to convert URLs in text to clickable links
export const linkify = (text) => {
  if (!text) return '';
  
  // URL regex pattern - detects http://, https://, and www. URLs
  const urlPattern = /(https?:\/\/[^\s]+)|(www\.[^\s]+)/g;
  
  // Split text by URLs
  const parts = text.split(urlPattern).filter(Boolean);
  
  return parts.map((part, index) => {
    // Check if this part is a URL
    if (part.match(urlPattern)) {
      // Add https:// if URL starts with www.
      const href = part.startsWith('www.') ? `https://${part}` : part;
      
      return (
        <a
          key={index}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 underline break-all"
          onClick={(e) => e.stopPropagation()}
        >
          {part}
        </a>
      );
    }
    
    // Regular text
    return <span key={index}>{part}</span>;
  });
};

// Alternative: Convert text with URLs to JSX elements
export const LinkifiedText = ({ children, className = '' }) => {
  if (!children) return null;
  
  const text = String(children);
  const urlPattern = /(https?:\/\/[^\s]+)|(www\.[^\s]+)/g;
  const parts = text.split(urlPattern).filter(Boolean);
  
  return (
    <span className={className}>
      {parts.map((part, index) => {
        if (part.match(urlPattern)) {
          const href = part.startsWith('www.') ? `https://${part}` : part;
          return (
            <a
              key={index}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline break-all"
              onClick={(e) => e.stopPropagation()}
            >
              {part}
            </a>
          );
        }
        return <span key={index}>{part}</span>;
      })}
    </span>
  );
};
