import axios from 'axios';

const API_URL = import.meta.env.VITE_TUTORMATCH_BACKEND_URL;

export const TutoringImageService = {
  /**
   * Sube una imagen para una tutoría al servicio de almacenamiento
   * @param tutoringId ID del usuario (tutor)
   * @param file Archivo de imagen a subir
   * @returns URL de la imagen subida
   */
  uploadTutoringImage: async (tutoringId: string, file: File): Promise<string> => {
    try {
      console.log('Iniciando subida de imagen para usuario:', tutoringId);
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
      
      // Crear nombre de archivo único para la nueva imagen
      const fileExtension = file.name.split('.').pop() || 'jpg';
      const uniqueFileName = `tutoring-${tutoringId}-${new Date().getTime()}.${fileExtension}`;
      
      // Preparar FormData para la subida
      const formData = new FormData();
      formData.append('file', file);
      formData.append('tutoringId', tutoringId);
      formData.append('fileName', uniqueFileName);
      
      console.log('FormData creado con campos:');
      for (let pair of formData.entries()) {
        console.log(pair[0], typeof pair[1] === 'object' ? 'File object' : pair[1]);
      }
      
      // Subir la nueva imagen
      const uploadResponse = await axios.post(
        `${API_URL}/storage/tutoring-images`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 60000, // 60 segundos
        }
      );
      
      console.log('Respuesta de subida del servidor:', uploadResponse.data);
      
      // Obtener la URL de la nueva imagen
      const urlResponse = await axios.get(
        `${API_URL}/storage/tutoring-images/${tutoringId}/${uniqueFileName}`
      );
      
      console.log('Respuesta del endpoint getImageUrl:', urlResponse.data);
      
      if (urlResponse.data && urlResponse.data.url) {
        return urlResponse.data.url;
      }
      
      throw new Error('No se pudo obtener la URL de la imagen');
    } catch (error: any) {
      console.error('Error al subir imagen de tutoría:', error);
      
      if (axios.isAxiosError(error)) {
        console.error('Detalles del error:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data
        });
        
        if (error.response?.data?.message) {
          throw new Error(`Error del servidor: ${error.response.data.message}`);
        }
      }
      
      // En caso de error, usar una URL por defecto
      const placeholderUrl = `https://media.istockphoto.com/id/1147544807/vector/thumbnail-image-vector-graphic.jpg?s=612x612&w=0&k=20&c=rnCKVbdxqkjlcs3xH87-9gocETqpspHFXu5dIGB4wuM=`;
      console.log('Usando URL simulada debido al error de subida');
      return placeholderUrl;
    }
  },
  
  /**
   * Elimina una imagen de tutoría del almacenamiento
   * @param tutoringId ID del usuario (tutor)
   * @param fileName Nombre del archivo a eliminar
   * @returns Verdadero si se eliminó correctamente
   */
  deleteTutoringImage: async (tutoringId: string, fileName: string): Promise<boolean> => {
    try {
      const response = await axios.delete(
        `${API_URL}/storage/tutoring-images/${tutoringId}/${fileName}`
      );
      return response.data?.success || false;
    } catch (error) {
      console.error('Error al eliminar imagen de tutoría:', error);
      return false;
    }
  }
};