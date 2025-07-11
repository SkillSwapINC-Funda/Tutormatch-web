import { supabase } from '../../../lib/supabase/client';
import { Database } from '../../../lib/supabase/supabase';
import { chatService } from "../classroom-detail/chat/services/ChatService";

// Tipos basados en la base de datos de Supabase
type ClassroomBookingInsert = Database['public']['Tables']['classroom_bookings']['Insert'];

export interface ClassroomBooking {
  id: string;
  student_id: string;
  tutor_id: string;
  tutoring_session_id: string;
  status: string | null;
  joined_at: string | null;
  created_at: string | null;
}

export interface ClassroomBookingWithProfiles extends ClassroomBooking {
  student?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  tutoring_session?: {
    id: string;
    title: string;
    course_id: string | null;
  };
}

export class ClassroomBookingService {
  // Crear reserva cuando el estudiante entra al classroom
  // En el método joinTutoringSession
  static async joinTutoringSession(
    tutoringSessionId: string, 
    studentId: string, 
    tutorId: string
  ): Promise<ClassroomBooking> {
    try {
      // Verificar si ya existe una reserva activa
      const existingBooking = await this.getActiveBooking(tutoringSessionId, studentId);
      
      if (existingBooking) {
        console.log('Reserva existente encontrada:', existingBooking);
        
        // Asegurar que el chat room existe y el usuario está agregado
        try {
          await chatService.createOrJoinTutoringRoom(tutoringSessionId);
        } catch (chatError) {
          console.error('Error con sala de chat:', chatError);
        }
        
        return existingBooking;
      }

      // Crear nueva reserva en Supabase
      const bookingData: ClassroomBookingInsert = {
        student_id: studentId,
        tutor_id: tutorId,
        tutoring_session_id: tutoringSessionId,
        status: 'active',
        joined_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('classroom_bookings')
        .insert(bookingData)
        .select()
        .single();

      if (error) {
        console.error('Error creando reserva:', error);
        throw error;
      }

      console.log('Nueva reserva creada:', data);

      // Crear o unirse a la sala de chat (mejorado)
      try {
        await chatService.createOrJoinTutoringRoom(tutoringSessionId);
      } catch (chatError) {
        console.error('Error creando sala de chat:', chatError);
        // No lanzar error aquí para no bloquear la reserva
      }

      return data;
    } catch (error) {
      console.error('Error en joinTutoringSession:', error);
      throw error;
    }
  }

  // Verificar si estudiante ya tiene reserva activa
  static async getActiveBooking(
    tutoringSessionId: string, 
    studentId: string
  ): Promise<ClassroomBooking | null> {
    try {
      const { data, error } = await supabase
        .from('classroom_bookings')
        .select('*')
        .eq('tutoring_session_id', tutoringSessionId)
        .eq('student_id', studentId)
        .eq('status', 'active')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error obteniendo reserva activa:', error);
        throw error;
      }

      return data || null;
    } catch (error) {
      console.error('Error en getActiveBooking:', error);
      return null;
    }
  }

  // Obtener reservas activas del tutor con información del estudiante
  static async getTutorActiveBookings(tutorId: string): Promise<ClassroomBookingWithProfiles[]> {
    try {
      const { data, error } = await supabase
        .from('classroom_bookings')
        .select(`
          *,
          student:student_id(
            id,
            first_name,
            last_name,
            email
          ),
          tutoring_session:tutoring_session_id(
            id,
            title,
            course_id
          )
        `)
        .eq('tutor_id', tutorId)
        .eq('status', 'active')
        .order('joined_at', { ascending: false });

      if (error) {
        console.error('Error obteniendo reservas del tutor:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error en getTutorActiveBookings:', error);
      return [];
    }
  }

  // Completar sesión
  static async completeSession(bookingId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('classroom_bookings')
        .update({ 
          status: 'completed'
        })
        .eq('id', bookingId);

      if (error) {
        console.error('Error completando sesión:', error);
        throw error;
      }

      console.log('Sesión completada:', bookingId);
    } catch (error) {
      console.error('Error en completeSession:', error);
      throw error;
    }
  }

  // Obtener historial del estudiante
  static async getStudentHistory(studentId: string): Promise<ClassroomBookingWithProfiles[]> {
    try {
      const { data, error } = await supabase
        .from('classroom_bookings')
        .select(`
          *,
          tutoring_session:tutoring_session_id(
            id,
            title,
            course_id
          )
        `)
        .eq('student_id', studentId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error obteniendo historial del estudiante:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error en getStudentHistory:', error);
      return [];
    }
  }

  // Obtener todas las sesiones del tutor (activas y completadas)
  static async getTutorSessions(tutorId: string): Promise<ClassroomBookingWithProfiles[]> {
    try {
      const { data, error } = await supabase
        .from('classroom_bookings')
        .select(`
          *,
          student:student_id(
            id,
            first_name,
            last_name,
            email
          ),
          tutoring_session:tutoring_session_id(
            id,
            title,
            course_id
          )
        `)
        .eq('tutor_id', tutorId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error obteniendo sesiones del tutor:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error en getTutorSessions:', error);
      return [];
    }
  }
}