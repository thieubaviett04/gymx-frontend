import React from 'react';

export interface UserAvatarProps {
  name: string;
  image?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isOnline?: boolean;
}

const sizeClasses = {
  sm: 'w-7 h-7 text-[10px]',
  md: 'w-9 h-9 text-xs',
  lg: 'w-11 h-11 text-sm',
  xl: 'w-14 h-14 text-base',
};

const badgeSize = {
  sm: 'w-2 h-2',
  md: 'w-2.5 h-2.5',
  lg: 'w-3 h-3',
  xl: 'w-3.5 h-3.5',
};

export function UserAvatar({
  name,
  image,
  size = 'md',
  isOnline,
}: UserAvatarProps) {
  const getInitials = (text: string) => {
    const parts = text.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return text.slice(0, 2).toUpperCase();
  };

  return (
    <div className="relative inline-block shrink-0">
      {image ? (
        <img
          src={image}
          alt={name}
          className={`${sizeClasses[size]} rounded-full object-cover ring-2 ring-white`}
        />
      ) : (
        <div
          className={`${sizeClasses[size]} rounded-full bg-[#101828] text-white flex items-center justify-center font-bold ring-2 ring-white`}
        >
          {getInitials(name)}
        </div>
      )}

      {typeof isOnline === 'boolean' && (
        <span
          className={`absolute bottom-0 right-0 ${badgeSize[size]} rounded-full ring-2 ring-white ${
            isOnline ? 'bg-emerald-500' : 'bg-gray-400'
          }`}
        />
      )}
    </div>
  );
}

export default UserAvatar;
