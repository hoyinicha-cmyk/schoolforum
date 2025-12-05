const PREFIX_STYLES = {
  question: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Question' },
  tutorial: { bg: 'bg-green-100', text: 'text-green-700', label: 'Tutorial' },
  discussion: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Discussion' },
  'unlock-request': { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Unlock Request' },
  announcement: { bg: 'bg-red-100', text: 'text-red-700', label: 'Announcement' },
  food: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Food' },
  'lost-found': { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Lost and Found' },
  none: null,
};

const PrefixBadge = ({ prefix }) => {
  // Debug: log ALL prefix values
  console.log('🏷️ PrefixBadge received:', { prefix, type: typeof prefix });
  
  if (!prefix || prefix === 'none') return null;
  
  const style = PREFIX_STYLES[prefix];
  
  if (!style) {
    console.warn('⚠️ Unknown prefix:', prefix, 'Available:', Object.keys(PREFIX_STYLES));
    return (
      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded">
        {prefix}
      </span>
    );
  }
  
  return (
    <span className={`px-2 py-1 ${style.bg} ${style.text} text-xs font-medium rounded`}>
      {style.label}
    </span>
  );
};

export default PrefixBadge;
