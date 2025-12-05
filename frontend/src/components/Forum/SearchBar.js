import { useState } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const SearchBar = ({ onSearch }) => {
  const [selectedPrefix, setSelectedPrefix] = useState('');

  const prefixes = [
    { value: '', label: 'All Posts' },
    { value: 'question', label: 'Question' },
    { value: 'discussion', label: 'Discussion' },
    { value: 'tutorial', label: 'Tutorial' },
    { value: 'unlock-request', label: 'Unlock Request' },
    { value: 'announcement', label: 'Announcement' },
    { value: 'food', label: 'Food' },
    { value: 'lost-found', label: 'Lost and Found' }
  ];

  const handleSearch = () => {
    onSearch(selectedPrefix);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <div className="flex gap-3">
        <select
          value={selectedPrefix}
          onChange={(e) => setSelectedPrefix(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        >
          {prefixes.map(prefix => (
            <option key={prefix.value} value={prefix.value}>
              {prefix.label}
            </option>
          ))}
        </select>
        
        <button
          onClick={handleSearch}
          className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition flex items-center gap-2"
        >
          <MagnifyingGlassIcon className="h-5 w-5" />
          Search
        </button>
      </div>
    </div>
  );
};

export default SearchBar;
