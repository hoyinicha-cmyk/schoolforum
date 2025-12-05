import { getAvatarUrl } from '../../utils/avatars';

const Avatar = ({ avatarId, size = 'md', className = '' }) => {
  const sizeMap = {
    sm: { class: 'w-8 h-8', px: 32 },
    md: { class: 'w-12 h-12', px: 48 },
    lg: { class: 'w-16 h-16', px: 64 },
    xl: { class: 'w-24 h-24', px: 96 }
  };

  const sizeConfig = sizeMap[size];
  const avatarUrl = getAvatarUrl(avatarId || 1, sizeConfig.px);

  return (
    <div 
      className={`
        ${sizeConfig.class} 
        rounded-full 
        overflow-hidden
        shadow-lg
        ring-4 ring-white
        bg-white
        ${className}
      `}
    >
      <img 
        src={avatarUrl} 
        alt="Avatar" 
        className="w-full h-full object-cover"
      />
    </div>
  );
};

export default Avatar;
