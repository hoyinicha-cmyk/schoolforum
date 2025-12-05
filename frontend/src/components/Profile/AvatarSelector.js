import { avatars, getAvatarUrl } from '../../utils/avatars';

const AvatarSelector = ({ selectedAvatarId, onSelect }) => {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        Choose Your Avatar
      </label>
      <div className="grid grid-cols-5 gap-3 max-h-96 overflow-y-auto p-2">
        {avatars.map((avatar) => (
          <button
            key={avatar.id}
            type="button"
            onClick={() => onSelect(avatar.id)}
            className={`
              flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all transform hover:scale-105
              ${selectedAvatarId === avatar.id 
                ? 'border-emerald-500 bg-emerald-50 ring-4 ring-emerald-200 scale-105' 
                : 'border-gray-200 hover:border-emerald-300 hover:bg-gray-50 hover:shadow-lg'
              }
            `}
          >
            <div className="w-14 h-14 rounded-full overflow-hidden bg-white shadow-lg mb-2">
              <img 
                src={getAvatarUrl(avatar.id, 56)} 
                alt={avatar.name}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-xs font-medium text-gray-600 text-center leading-tight">{avatar.name}</span>
          </button>
        ))}
      </div>
      <p className="text-xs text-gray-500 text-center">
        Choose an avatar that represents you
      </p>
    </div>
  );
};

export default AvatarSelector;
