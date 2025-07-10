import axios from 'axios';
import { User } from '../types/User';
import { AuthService } from '../../public/services/authService';

const API_URL = import.meta.env.VITE_TUTORMATCH_BACKEND_URL;


export const UserService = {
  // Obtener un usuario por ID
  getUserById: async (userId: string): Promise<User> => {
    try {
      const response = await axios.get(`${API_URL}/profiles/${userId}`);
      return new User(response.data);
    } catch (error) {
      console.error('Error obteniendo usuario:', error);
      throw error;
    }
  },

  // Actualizar el perfil de un usuario
  updateProfile: async (user: User): Promise<User> => {
    try {
      const updateData = {
        firstName: user.firstName,
        lastName: user.lastName,
        bio: user.bio,
        phone: user.phone,
        avatar: user.avatar,
        semesterNumber: user.semesterNumber,
        academicYear: user.academicYear
      };

      const response = await axios.patch(`${API_URL}/profiles/${user.id}`, updateData);
      return new User(response.data);
    } catch (error) {
      console.error('Error actualizando perfil:', error);
      throw error;
    }
  },

  // Eliminar la cuenta de un usuario
  deleteAccount: async (userId: string): Promise<void> => {
    try {
      await axios.delete(`${API_URL}/profiles/${userId}`);
    } catch (error) {
      console.error('Error eliminando cuenta:', error);
      throw error;
    }
  },

  // Versión mejorada para UserService.ts
  // Versión mejorada para UserService.ts
  uploadAvatar: async (userId: string, file: File): Promise<string> => {
    try {
      console.log('Iniciando subida de avatar para usuario:', userId);
      console.log('Archivo:', file.name, 'Tamaño:', file.size, 'Tipo:', file.type);
  
      // Validar el archivo
      if (!file || file.size === 0) {
        throw new Error('El archivo está vacío o no fue seleccionado');
      }
  
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('El archivo es demasiado grande. Máximo 5MB.');
      }
  
      if (!['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'].includes(file.type)) {
        throw new Error('Tipo de archivo inválido. Solo se permiten PNG, JPEG, GIF o WebP.');
      }
  
      // Obtener el usuario actual para verificar si ya tiene un avatar
      const currentUser = await AuthService.getCurrentUserProfile();
      let previousAvatarFileName = null;
  
      // Extraer el nombre del archivo del avatar anterior si existe
      if (currentUser?.avatar) {
        try {
          const avatarUrl = new URL(currentUser.avatar);
          const pathParts = avatarUrl.pathname.split('/');
          // El nombre del archivo suele ser el último segmento de la ruta
          previousAvatarFileName = pathParts[pathParts.length - 1];
          console.log('Avatar anterior encontrado:', previousAvatarFileName);
        } catch (e) {
          console.warn('No se pudo obtener el nombre del archivo del avatar anterior:', e);
        }
      }
  
      // Crear nombre de archivo único para el nuevo avatar
      const fileExtension = file.name.split('.').pop() || 'jpg';
      const uniqueFileName = `avatar-${userId}-${new Date().getTime()}.${fileExtension}`;
  
      // Preparar FormData para la subida
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', userId);
      formData.append('fileName', uniqueFileName);
  
      console.log('FormData creado con campos:');
      for (let pair of formData.entries()) {
        console.log(pair[0], typeof pair[1] === 'object' ? 'File object' : pair[1]);
      }
  
      // Subir el nuevo avatar
      const uploadResponse = await axios.post(
        `${API_URL}/storage/avatars`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 60000, // 60 segundos
        }
      );
  
      console.log('Respuesta de subida del servidor:', uploadResponse.data);
  
      // Obtener la URL del nuevo avatar
      const urlResponse = await axios.get(
        `${API_URL}/storage/avatars/${userId}/${uniqueFileName}`
      );
  
      console.log('Respuesta del endpoint getAvatarUrl:', urlResponse.data);
  
      if (urlResponse.data && urlResponse.data.url) {
        const newAvatarUrl = urlResponse.data.url;
  
        // Después de confirmar que el nuevo avatar se subió correctamente,
        // eliminamos el avatar anterior si existe
        if (previousAvatarFileName) {
          try {
            console.log(`Intentando eliminar avatar anterior: ${previousAvatarFileName}`);
            const deleteResponse = await axios.delete(
              `${API_URL}/storage/avatars/${userId}/${previousAvatarFileName}`
            );
            console.log('Resultado de eliminación del avatar anterior:', deleteResponse.data);
          } catch (deleteError) {
            // No interrumpir el flujo si la eliminación falla
            console.warn('Error al eliminar avatar anterior:', deleteError);
          }
        }
  
        // Actualizar el perfil del usuario con la nueva URL
        try {
          if (currentUser) {
            // Creamos una copia del usuario con la nueva URL
            const updatedUser = {
              ...currentUser,
              avatar: newAvatarUrl
            };
            
            // Actualizamos el perfil
            await UserService.updateProfile(updatedUser);
          }
        } catch (profileError) {
          console.warn('Error al actualizar perfil con nuevo avatar:', profileError);
          // Continuamos aunque falle la actualización del perfil
        }
        
        return newAvatarUrl;
      }
  
      throw new Error('No se pudo obtener la URL del avatar');
    } catch (error: any) {
      console.error('Error completo al subir avatar:', error);
  
      if (axios.isAxiosError(error)) {
        console.error('Error de Axios:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          headers: error.response?.headers
        });
  
        if (error.response?.data?.message) {
          throw new Error(`Error del servidor: ${error.response.data.message}`);
        }
      }
  
      throw new Error(error.message || 'Error al subir la imagen');
    }
  }
};