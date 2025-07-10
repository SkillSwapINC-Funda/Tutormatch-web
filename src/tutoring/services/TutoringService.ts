import axios from 'axios';
import { TutoringSession, TutoringReview } from '../types/Tutoring';
import { TutoringImageService } from './TutoringImageService';

const API_URL = import.meta.env.VITE_TUTORMATCH_BACKEND_URL;

/**
 * Función para convertir nombres de campos de camelCase (backend) a snake_case (Supabase)
 */
const toSnakeCase = (data: any): any => {
  if (!data || typeof data !== 'object') return data;

  if (Array.isArray(data)) {
    return data.map(item => toSnakeCase(item));
  }

  const result: any = {};
  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      // Convertir camelCase a snake_case
      const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();

      // Casos especiales
      const finalKey =
        key === 'tutorId' ? 'tutor_id' :
          key === 'courseId' ? 'course_id' :
            key === 'whatTheyWillLearn' ? 'what_they_will_learn' :
              key === 'imageUrl' ? 'image_url' :
                key === 'dayOfWeek' ? 'day_of_week' :
                  key === 'startTime' ? 'start_time' :
                    key === 'endTime' ? 'end_time' :
                      key === 'studentId' ? 'student_id' :
                        key === 'tutoringId' ? 'tutoring_id' :
                          snakeKey;

      result[finalKey] = toSnakeCase(data[key]);
    }
  }
  return result;
};

/**
 * Función para convertir nombres de campos de snake_case (Supabase) a camelCase (frontend)
 */
const toCamelCase = (data: any): any => {
  if (!data || typeof data !== 'object') return data;

  if (Array.isArray(data)) {
    return data.map(item => toCamelCase(item));
  }

  const result: any = {};
  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      // Convertir snake_case a camelCase
      const camelKey = key.replace(/_([a-z])/g, (_, p1) => p1.toUpperCase());

      // Casos especiales
      const finalKey =
        key === 'tutor_id' ? 'tutorId' :
          key === 'course_id' ? 'courseId' :
            key === 'what_they_will_learn' ? 'whatTheyWillLearn' :
              key === 'image_url' ? 'imageUrl' :
                key === 'day_of_week' ? 'dayOfWeek' :
                  key === 'start_time' ? 'startTime' :
                    key === 'end_time' ? 'endTime' :
                      key === 'student_id' ? 'studentId' :
                        key === 'tutoring_id' ? 'tutoringId' :
                          camelKey;

      result[finalKey] = toCamelCase(data[key]);
    }
  }
  return result;
};

export const TutoringService = {
  // Obtener una tutoría por ID
  getTutoringSession: async (id: string): Promise<TutoringSession> => {
    try {
      // Primero obtenemos los datos básicos de la tutoría
      const response = await axios.get(`${API_URL}/tutoring-sessions/${id}`);

      // Convertimos los datos de snake_case a camelCase
      const tutoringData = toCamelCase(response.data);

      // Luego obtenemos los horarios disponibles para esta tutoría usando la ruta correcta
      try {
        const timesResponse = await axios.get(`${API_URL}/tutoring-sessions/${id}/available-times`);

        // Convertir los horarios de snake_case a camelCase
        const availableTimes = toCamelCase(timesResponse.data);

        // Combinar los datos
        tutoringData.availableTimes = availableTimes;
      } catch (timesError) {
        console.warn('Error al obtener horarios:', timesError);
        tutoringData.availableTimes = [];
      }

      return new TutoringSession(tutoringData);
    } catch (error) {
      console.error('Error al obtener tutoría:', error);
      throw error;
    }
  },

  // Obtener todas las tutorías
  getAllTutoringSessions: async (): Promise<TutoringSession[]> => {
    try {
      const response = await axios.get(`${API_URL}/tutoring-sessions`);

      // Convertir cada tutoría de snake_case a camelCase
      const tutoringsData = toCamelCase(response.data);

      // Para cada tutoría, intentar obtener sus horarios disponibles
      const tutoringsWithTimes = await Promise.all(
        tutoringsData.map(async (session: any) => {
          try {
            const timesResponse = await axios.get(
              `${API_URL}/tutoring-sessions/${session.id}/available-times`
            );

            // Convertir horarios de snake_case a camelCase
            const availableTimes = toCamelCase(timesResponse.data);

            return {
              ...session,
              availableTimes: availableTimes
            };
          } catch (error) {
            console.warn(`Error al obtener horarios para tutoría ${session.id}:`, error);
            // Si falla, retornamos la sesión sin horarios
            return {
              ...session,
              availableTimes: []
            };
          }
        })
      );

      return tutoringsWithTimes.map((session: any) => new TutoringSession(session));
    } catch (error) {
      console.error('Error al obtener tutorías:', error);
      throw error;
    }
  },

  // Obtener tutorías por tutorId
  getTutoringSessionsByTutorId: async (tutorId: string): Promise<TutoringSession[]> => {
    try {
      const response = await axios.get(`${API_URL}/tutoring-sessions`, {
        params: { tutorId }
      });

      // Convertir cada tutoría de snake_case a camelCase
      const tutoringsData = toCamelCase(response.data);

      // Para cada tutoría, intentar obtener sus horarios disponibles
      const tutoringsWithTimes = await Promise.all(
        tutoringsData.map(async (session: any) => {
          try {
            const timesResponse = await axios.get(
              `${API_URL}/tutoring-sessions/${session.id}/available-times`
            );

            // Convertir horarios de snake_case a camelCase
            const availableTimes = toCamelCase(timesResponse.data);

            return {
              ...session,
              availableTimes: availableTimes
            };
          } catch (error) {
            console.warn(`Error al obtener horarios para tutoría ${session.id}:`, error);
            return {
              ...session,
              availableTimes: []
            };
          }
        })
      );

      return tutoringsWithTimes.map((session: any) => new TutoringSession(session));
    } catch (error) {
      console.error('Error al obtener tutorías por tutor:', error);
      throw error;
    }
  },

  // Obtener tutorías por courseId
  getTutoringSessionsByCourseId: async (courseId: string): Promise<TutoringSession[]> => {
    try {
      const response = await axios.get(`${API_URL}/tutoring-sessions`, {
        params: { courseId }
      });

      // Convertir cada tutoría de snake_case a camelCase
      const tutoringsData = toCamelCase(response.data);

      // Para cada tutoría, intentar obtener sus horarios disponibles
      const tutoringsWithTimes = await Promise.all(
        tutoringsData.map(async (session: any) => {
          try {
            const timesResponse = await axios.get(
              `${API_URL}/tutoring-sessions/${session.id}/available-times`
            );

            // Convertir horarios de snake_case a camelCase
            const availableTimes = toCamelCase(timesResponse.data);

            return {
              ...session,
              availableTimes: availableTimes
            };
          } catch (error) {
            console.warn(`Error al obtener horarios para tutoría ${session.id}:`, error);
            return {
              ...session,
              availableTimes: []
            };
          }
        })
      );

      return tutoringsWithTimes.map((session: any) => new TutoringSession(session));
    } catch (error) {
      console.error('Error al obtener tutorías por curso:', error);
      throw error;
    }
  },

  // Obtener reseñas de una tutoría
  getReviews: async (tutoringId: string): Promise<TutoringReview[]> => {
    try {

      // Usar la ruta correcta para obtener las reseñas de la tutoría específica
      const response = await axios.get(`${API_URL}/tutoring-sessions/${tutoringId}/reviews`);

      // Si no hay reseñas, devolver un array vacío
      if (!response.data || !Array.isArray(response.data)) {
        console.warn('No se recibieron reseñas o el formato es incorrecto');
        return [];
      }

      // Convertir reseñas de snake_case a camelCase
      const reviewsData = toCamelCase(response.data);

      // Para cada reseña, obtener los datos del estudiante
      const reviewsWithStudents = await Promise.all(
        reviewsData.map(async (review: any) => {
          try {
            const studentId = review.studentId;

            if (!studentId) {
              console.warn('Reseña sin ID de estudiante:', review);
              return review;
            }

            const studentResponse = await axios.get(`${API_URL}/profiles/${studentId}`);
            // Convertir datos del estudiante de snake_case a camelCase
            const studentData = toCamelCase(studentResponse.data);

            return {
              ...review,
              student: studentData
            };
          } catch (error) {
            console.warn(`Error al obtener datos del estudiante:`, error);
            return review;
          }
        })
      );

      return reviewsWithStudents.map((review: any) => new TutoringReview(review));
    } catch (error) {
      console.error('Error al obtener reseñas:', error);
      return [];
    }
  },

  createTutoring: async (tutoring: any): Promise<TutoringSession> => {
    try {

      // Preparar el objeto con los campos en camelCase como espera el backend
      const tutoringPayload = {
        tutorId: tutoring.tutorId,
        courseId: tutoring.courseId,
        title: tutoring.title || tutoring.courseName,
        description: tutoring.description,
        price: Number(tutoring.price),
        whatTheyWillLearn: Array.isArray(tutoring.whatTheyWillLearn) ?
          tutoring.whatTheyWillLearn :
          tutoring.whatTheyWillLearn.split('\n').map((item: string) => item.trim()).filter(Boolean),
        imageUrl: tutoring.imageUrl || "",
        availableTimes: tutoring.availableTimes.map((slot: any) => ({
          dayOfWeek: slot.dayOfWeek,
          startTime: slot.startTime,
          endTime: slot.endTime
        }))
      };

      // Hacer la petición con formato camelCase
      const response = await axios.post(`${API_URL}/tutoring-sessions`, tutoringPayload);

      // Procesar la respuesta
      const createdTutoring = response.data;
      return new TutoringSession(createdTutoring);
    } catch (error) {
      console.error('Error al crear tutoría:', error);

      if (axios.isAxiosError(error) && error.response) {
        console.error('Detalles del error:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data
        });
      }
      throw error;
    }
  },

  // Actualizar una tutoría
  updateTutoring: async (tutoringId: string, updates: any): Promise<TutoringSession> => {
    try {

      // Convertir campos a camelCase para la API
      const updateData = {
        ...(updates.image_url !== undefined && { imageUrl: updates.image_url }),
        ...(updates.imageUrl !== undefined && { imageUrl: updates.imageUrl }),
        ...(updates.what_they_will_learn !== undefined && { whatTheyWillLearn: updates.what_they_will_learn }),
        ...(updates.whatTheyWillLearn !== undefined && { whatTheyWillLearn: updates.whatTheyWillLearn }),
        ...(updates.description !== undefined && { description: updates.description }),
        ...(updates.price !== undefined && { price: Number(updates.price) }),
        ...(updates.title !== undefined && { title: updates.title }),
        ...(updates.available_times !== undefined && { availableTimes: updates.available_times }),
        ...(updates.availableTimes !== undefined && { availableTimes: updates.availableTimes }),

      };


      const response = await axios.patch(
        `${API_URL}/tutoring-sessions/${tutoringId}`,
        updateData
      );

      // Convertir respuesta de snake_case a camelCase
      const updatedTutoring = toCamelCase(response.data);

      return new TutoringSession(updatedTutoring);
    } catch (error) {
      console.error('Error al actualizar tutoría:', error);
      throw error;
    }
  },

  // Añadir una reseña a una tutoría
  addReview: async (tutoringId: string, review: any): Promise<any> => {
    try {

      // Preparar el payload para el backend - en camelCase
      const reviewData = {
        tutoringId: tutoringId,
        studentId: review.studentId || review.student_id,
        rating: Number(review.rating),
        comment: review.comment
      };


      const response = await axios.post(
        `${API_URL}/tutoring-sessions/reviews`,
        reviewData
      );

      // Convertir respuesta de snake_case a camelCase
      const createdReview = toCamelCase(response.data);

      return new TutoringReview(createdReview);
    } catch (error) {
      console.error('Error al agregar reseña:', error);
      throw error;
    }
  },

  // Actualizar una reseña
  updateReview: async (reviewId: string, reviewData: any): Promise<TutoringReview> => {
    try {
      const response = await axios.patch(
        `${API_URL}/tutoring-sessions/reviews/${reviewId}`,
        reviewData
      );

      // Convertir respuesta de snake_case a camelCase
      const updatedReview = toCamelCase(response.data);

      return new TutoringReview(updatedReview);
    } catch (error) {
      console.error('Error al actualizar reseña:', error);
      throw error;
    }
  },

  // Eliminar una reseña
  deleteReview: async (reviewId: string): Promise<boolean> => {
    try {
      await axios.delete(`${API_URL}/tutoring-sessions/reviews/${reviewId}`);
      return true;
    } catch (error) {
      console.error('Error al eliminar reseña:', error);
      throw error;
    }
  },

  deleteTutoring: async (tutoringId: string): Promise<boolean> => {
    try {

      try {
        // 1. Primero obtenemos información de la tutoría para saber qué recursos eliminar
        const tutoringResponse = await axios.get(`${API_URL}/tutoring-sessions/${tutoringId}`);
        const tutoringData = tutoringResponse.data;

        // 2. Eliminar horarios disponibles
        try {
          const timesResponse = await axios.get(`${API_URL}/tutoring-sessions/${tutoringId}/available-times`);
          const times = timesResponse.data;

          if (times && times.length > 0) {
            await Promise.all(
              times.map((time: any) =>
                axios.delete(`${API_URL}/tutoring-sessions/available-times/${time.id}`)
              )
            );
          }
        } catch (timesError) {
          console.warn('Error al eliminar horarios disponibles:', timesError);
        }

        // 3. Eliminar reseñas
        try {
          const reviewsResponse = await axios.get(`${API_URL}/tutoring-sessions/${tutoringId}/reviews`);
          const reviews = reviewsResponse.data;

          if (reviews && reviews.length > 0) {
            await Promise.all(
              reviews.map((review: any) =>
                axios.delete(`${API_URL}/tutoring-sessions/reviews/${review.id}`)
              )
            );
          }
        } catch (reviewsError) {
          console.warn('Error al eliminar reseñas:', reviewsError);
        }

        // 4. Eliminar materiales
        try {
          const materialsResponse = await axios.get(`${API_URL}/tutoring-sessions/${tutoringId}/materials`);
          const materials = materialsResponse.data;

          if (materials && materials.length > 0) {
            await Promise.all(
              materials.map((material: any) =>
                axios.delete(`${API_URL}/tutoring-sessions/materials/${material.id}`)
              )
            );
          }
        } catch (materialsError) {
          console.warn('Error al eliminar materiales:', materialsError);
        }

        // 5. Eliminar la imagen de la tutoría si existe
        try {
          if (tutoringData.imageUrl) {
            const imageUrlParts = tutoringData.imageUrl.split('/');
            const fileName = imageUrlParts[imageUrlParts.length - 1];
            const userId = tutoringData.tutorId;

            await TutoringImageService.deleteTutoringImage(userId, fileName);
          }
        } catch (imageError) {
          console.warn('Error al eliminar imagen:', imageError);
        }

      } catch (relatedError) {
        console.warn('Error al eliminar elementos relacionados:', relatedError);
      }

      await axios.delete(`${API_URL}/tutoring-sessions/${tutoringId}`);

      return true;
    } catch (error) {
      console.error('Error al eliminar tutoría:', error);
      throw error;
    }
  }

};