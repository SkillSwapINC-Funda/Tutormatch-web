import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthService } from '../../public/services/authService';

interface AvatarContextType {
  avatarUrl: string | null;
  updateAvatarUrl: (newUrl: string | null) => void;
  isLoadingAvatar: boolean;
}

const AvatarContext = createContext<AvatarContextType>({
  avatarUrl: null,
  updateAvatarUrl: () => {},
  isLoadingAvatar: false
});

export const useAvatar = () => useContext(AvatarContext);

export const AvatarProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isLoadingAvatar, setIsLoadingAvatar] = useState<boolean>(true);

  // Cargar el avatar al iniciar
  useEffect(() => {
    const loadUserAvatar = async () => {
      try {
        setIsLoadingAvatar(true);
        const userId = AuthService.getCurrentUserId();
        
        if (!userId) {
          setAvatarUrl(null);
          return;
        }
        
        const user = await AuthService.getCurrentUserProfile();
        if (user && user.avatar) {
          setAvatarUrl(user.avatar);
        } else {
          setAvatarUrl(null);
        }
      } catch (error) {
        console.error('Error al cargar avatar:', error);
        setAvatarUrl(null);
      } finally {
        setIsLoadingAvatar(false);
      }
    };

    loadUserAvatar();
  }, []);

  const updateAvatarUrl = (newUrl: string | null) => {
    setAvatarUrl(newUrl);
    
    // Si hay un usuario actual, actualizamos su perfil en localStorage
    // para mantener coherencia entre sesiones
    const userId = AuthService.getCurrentUserId();
    if (userId) {
      const currentUserData = localStorage.getItem('currentUserProfile');
      if (currentUserData) {
        try {
          const userData = JSON.parse(currentUserData);
          userData.avatar = newUrl;
          localStorage.setItem('currentUserProfile', JSON.stringify(userData));
        } catch (error) {
          console.error('Error al actualizar avatar en localStorage:', error);
        }
      }
    }
  };

  return (
    <AvatarContext.Provider value={{ avatarUrl, updateAvatarUrl, isLoadingAvatar }}>
      {children}
    </AvatarContext.Provider>
  );
};