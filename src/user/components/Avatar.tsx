import React from 'react';
import { useAvatar } from '../hooks/avatarContext';

interface AvatarProps {
  user: {
    firstName?: string;
    lastName?: string;
    avatar?: string;
    id?: string;
  };
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({ user, size = 'md', className = '' }) => {
  const { avatarUrl } = useAvatar();
  
  // Determinar las clases de tamaño
  const sizeClasses = {
    sm: 'h-8 w-8 text-sm',
    md: 'h-12 w-12 text-base',
    lg: 'h-16 w-16 text-2xl'
  };
  
  // Usar avatar del contexto si el usuario es el actual o el del usuario pasado como prop
  const avatarToUse = user?.id === localStorage.getItem('currentUserId')
    ? avatarUrl || user.avatar
    : user.avatar;
  
  // Obtener la inicial para el fallback
  const initial = user?.firstName?.charAt(0) || user?.lastName?.charAt(0) || 'U';
  
  return (
    <div className={`rounded-full bg-red-600 flex items-center justify-center overflow-hidden ${sizeClasses[size]} ${className}`}>
      {avatarToUse ? (
        <img
          src={avatarToUse}
          alt="Avatar"
          className="h-full w-full object-cover"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            const parent = e.currentTarget.parentElement;
            if (parent) {
              parent.innerHTML = `<span class="text-white ${sizeClasses[size].split(' ').pop()}">${initial}</span>`;
            }
          }}
        />
      ) : (
        <span className="text-white">{initial}</span>
      )}
    </div>
  );
};

export default Avatar;