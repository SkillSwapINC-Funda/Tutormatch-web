import axios from 'axios';

const API_URL = import.meta.env.VITE_TUTORMATCH_BACKEND_URL;;

export const SemesterService = {
  // Obtener todos los semestres
  getSemesters: async () => {
    const response = await axios.get(`${API_URL}/semesters`);
    return response.data;
  },

  // Obtener un semestre por ID
  getSemesterById: async (id: string) => {
    const response = await axios.get(`${API_URL}/semesters/${id}`);
    return response.data;
  },

  // Obtener los cursos de un semestre
  getSemesterCourses: async (semesterId: string) => {
    const response = await axios.get(`${API_URL}/semesters/${semesterId}`);
    return response.data.courses || [];
  }
};