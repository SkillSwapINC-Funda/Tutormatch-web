import { User } from '../../user/types/User';

export interface AvailableTime {
  id: string;
  tutoring_id: string; // Cambio a snake_case para coincidir con la BD
  day_of_week: number; // 0-6 donde 0 es domingo
  start_time: string;  // Formato "HH:MM"
  end_time: string;    // Formato "HH:MM"
  created_at?: string;
  updated_at?: string;
  // Versión camelCase para mantener compatibilidad
  tutoringId?: string;
  dayOfWeek?: number;
  startTime?: string;
  endTime?: string;
  createdAt?: string;
  updatedAt?: string;
}

export class TutoringSession {
  id: string;
  title: string;
  description: string | null;
  price: number;
  whatTheyWillLearn: string[] | any;
  imageUrl: string | null;
  tutorId: string;
  courseId: string | null;
  availableTimes: AvailableTime[];
  createdAt?: string;
  updatedAt?: string;

  constructor(data: any) {
    this.id = data.id || '';
    this.title = data.title || '';
    this.description = data.description || '';
    this.price = typeof data.price === 'number' ? data.price : 0;
    
    // Manejar diferentes formatos de whatTheyWillLearn
    if (typeof data.whatTheyWillLearn === 'string') {
      try {
        this.whatTheyWillLearn = JSON.parse(data.whatTheyWillLearn);
      } catch (e) {
        this.whatTheyWillLearn = [data.whatTheyWillLearn];
      }
    } else {
      this.whatTheyWillLearn = data.whatTheyWillLearn || [];
    }
    
    this.imageUrl = data.imageUrl || data.image_url || null;
    this.tutorId = data.tutorId || data.tutor_id || '';
    this.courseId = data.courseId || data.course_id || null;
    
    // Procesar horarios disponibles con mejor manejo de formatos
    if (Array.isArray(data.availableTimes)) {
      this.availableTimes = data.availableTimes.map((time: any) => {
        // Compatibilidad para ambos formatos (snake_case y camelCase)
        return {
          id: time.id,
          tutoring_id: time.tutoring_id || time.tutoringId || '',
          day_of_week: typeof time.day_of_week === 'number' ? time.day_of_week : 
                      typeof time.dayOfWeek === 'number' ? time.dayOfWeek : 0,
          start_time: time.start_time || time.startTime || '',
          end_time: time.end_time || time.endTime || '',
          created_at: time.created_at || time.createdAt,
          updated_at: time.updated_at || time.updatedAt,
          // Agregar propiedades camelCase para compatibilidad interna
          tutoringId: time.tutoring_id || time.tutoringId || '',
          dayOfWeek: typeof time.day_of_week === 'number' ? time.day_of_week : 
                    typeof time.dayOfWeek === 'number' ? time.dayOfWeek : 0,
          startTime: time.start_time || time.startTime || '',
          endTime: time.end_time || time.endTime || '',
          createdAt: time.created_at || time.createdAt,
          updatedAt: time.updated_at || time.updatedAt
        };
      });
    } else if (Array.isArray(data.available_times)) {
      this.availableTimes = data.available_times.map((time: any) => {
        return {
          id: time.id,
          tutoring_id: time.tutoring_id || '',
          day_of_week: typeof time.day_of_week === 'number' ? time.day_of_week : 0,
          start_time: time.start_time || '',
          end_time: time.end_time || '',
          created_at: time.created_at,
          updated_at: time.updated_at,
          // Agregar propiedades camelCase para compatibilidad interna
          tutoringId: time.tutoring_id || '',
          dayOfWeek: typeof time.day_of_week === 'number' ? time.day_of_week : 0,
          startTime: time.start_time || '',
          endTime: time.end_time || '',
          createdAt: time.created_at,
          updatedAt: time.updated_at
        };
      });
    } else {
      this.availableTimes = [];
    }
    
    this.createdAt = data.createdAt || data.created_at;
    this.updatedAt = data.updatedAt || data.updated_at;
  }
}

export class TutoringReview {
  id: string;
  tutoringId: string;
  studentId: string;
  rating: number;
  comment: string | null;
  likes: number;
  student?: User;
  createdAt?: string;
  updatedAt?: string;

  constructor(data: any) {
    this.id = data.id || '';
    this.tutoringId = data.tutoringId || data.tutoring_id || '';
    this.studentId = data.studentId || data.student_id || '';
    this.rating = typeof data.rating === 'number' ? data.rating : 0;
    this.comment = data.comment || null;
    this.likes = typeof data.likes === 'number' ? data.likes : 0;
    
    // Si hay datos de estudiante, crear un objeto User
    if (data.student) {
      this.student = new User(data.student);
    }
    
    this.createdAt = data.createdAt || data.created_at;
    this.updatedAt = data.updatedAt || data.updated_at;
  }

  
}

export class TutoringMaterial {
  id: number;
  tutoringId: number;
  title: string;
  description?: string;
  type: 'document' | 'video' | 'link' | 'image' | 'code';
  url: string;
  size?: number;
  uploadedBy: string | number;
  createdAt: Date;
  updatedAt: Date;

  constructor(tutoringMaterial: {
    id?: number;
    tutoringId?: number;
    title?: string;
    description?: string;
    type?: 'document' | 'video' | 'link' | 'image' | 'code';
    url?: string;
    size?: number;
    uploadedBy?: string | number;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.id = tutoringMaterial.id || 0;
    this.tutoringId = tutoringMaterial.tutoringId || 0;
    this.title = (tutoringMaterial.title || '').trim();
    this.description = (tutoringMaterial.description || '').trim();
    this.type = tutoringMaterial.type || 'document';
    this.url = (tutoringMaterial.url || '').trim();
    this.size = tutoringMaterial.size || 0;
    this.uploadedBy = tutoringMaterial.uploadedBy || 0;
    this.createdAt = tutoringMaterial.createdAt ? new Date(tutoringMaterial.createdAt) : new Date();
    this.updatedAt = tutoringMaterial.updatedAt ? new Date(tutoringMaterial.updatedAt) : new Date();
  }
}

