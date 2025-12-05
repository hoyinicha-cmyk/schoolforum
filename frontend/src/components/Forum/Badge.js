import React from 'react';
import './Badge.css';

const Badge = ({ badge, size = 'medium', showLabel = true }) => {
  const badges = {
    'Forum Newbie': {
      icon: '🌱',
      color: '#94a3b8',
      label: 'Forum Newbie'
    },
    'Forum Active': {
      icon: '⚡',
      color: '#3b82f6',
      label: 'Forum Active'
    },
    'Forum Expert': {
      icon: '🎓',
      color: '#8b5cf6',
      label: 'Forum Expert'
    },
    'Forum Contributor': {
      icon: '👑',
      color: '#f59e0b',
      label: 'Forum Contributor'
    }
  };

  const badgeInfo = badges[badge] || badges['Forum Newbie'];

  return (
    <div className={`badge badge-${size}`} title={badgeInfo.label}>
      <span 
        className="badge-icon" 
        style={{ color: badgeInfo.color }}
      >
        {badgeInfo.icon}
      </span>
      {showLabel && (
        <span 
          className="badge-label" 
          style={{ color: badgeInfo.color }}
        >
          {badgeInfo.label}
        </span>
      )}
    </div>
  );
};

export default Badge;
