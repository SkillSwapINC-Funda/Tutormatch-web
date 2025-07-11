import { useState, useEffect } from 'react';
import { TutoringService } from '../../tutoring/services/TutoringService';
import { UserService } from '../../user/services/UserService';
import { ClassroomBookingService, ClassroomBookingWithProfiles } from '../components/service/BookingService';
import { TutoringSession } from '../../tutoring/types/Tutoring';
import { Search, Filter, Users, Clock } from 'lucide-react';
import ClassroomCourseCard from '../components/classroom-dashboard/ClassroomCourseCard';
import ClassroomNavbar from '../components/ClassroomNavbar';
import ClassroomFooter from '../components/ClassroomFooter';

const ClassroomPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAllTutorials, setShowAllTutorials] = useState(false);

  const [courses, setCourses] = useState<TutoringSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [courseInfoMap, setCourseInfoMap] = useState<Record<string, {
    tutorName: string;
    nextSession: string;
    chatNotifications: number;
    materialsNotifications: number;
  }>>({});

  const [userId, setUserId] = useState<string | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [tutorBookings, setTutorBookings] = useState<ClassroomBookingWithProfiles[]>([]);
  const [studentInfoMap, setStudentInfoMap] = useState<Record<string, {
    firstName: string;
    lastName: string;
    email: string;
  }>>({});

  const [, setActiveBookings] = useState<ClassroomBookingWithProfiles[]>([]);
  const [, setLoadingBookings] = useState(false);

  useEffect(() => {
    const currentUserId = localStorage.getItem("currentUserId");
    const userRole = localStorage.getItem("currentUserRole");
    
    
    setUserId(currentUserId);
    setCurrentUserRole(userRole);

    const fetchCourses = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await TutoringService.getAllTutoringSessions();
        setCourses(data);
        
        if (userRole === 'tutor' && currentUserId) {
          const allBookings = await ClassroomBookingService.getTutorSessions(currentUserId);
          
          const activeBookings = allBookings.filter(b => b.status === 'active');
          
          setTutorBookings(activeBookings);
        }
      } catch (err: any) {
        setError('Error al cargar las tutorías.');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  useEffect(() => {
    const loadStudentInfo = async () => {
      const studentIds = [...new Set(tutorBookings.map(b => b.student_id))];
      const infoMap: Record<string, any> = {};
      
      await Promise.all(
        studentIds.map(async (studentId) => {
          try {
            const student = await UserService.getUserById(studentId);
            infoMap[studentId] = {
              firstName: student.firstName || 'Estudiante',
              lastName: student.lastName || '',
              email: student.email || ''
            };
          } catch {
            infoMap[studentId] = {
              firstName: 'Estudiante',
              lastName: 'Desconocido',
              email: ''
            };
          }
        })
      );
      
      setStudentInfoMap(infoMap);
    };

    if (tutorBookings.length > 0) {
      loadStudentInfo();
    }
  }, [tutorBookings]);

  async function calcularInfoCurso(course: TutoringSession): Promise<{
    tutorName: string;
    nextSession: string;
    chatNotifications: number;
    materialsNotifications: number;
  }> {
    let tutorName = 'Desconocido';
    if ((course as any).tutor && (course as any).tutor.firstName) {
      tutorName = `${(course as any).tutor.firstName} ${(course as any).tutor.lastName || ''}`.trim();
    } else if (course.tutorId) {
      try {
        const user = await UserService.getUserById(course.tutorId);
        tutorName = `${user.firstName} ${user.lastName}`.trim();
      } catch {
        tutorName = course.tutorId;
      }
    }

    let nextSession = '';
    const now = new Date();
    if (course.availableTimes && course.availableTimes.length > 0) {
      const future = course.availableTimes
        .map((t) => {
          const today = new Date();
          const dayDiff = ((t.dayOfWeek ?? t.day_of_week ?? 0) + 7 - today.getDay()) % 7;
          const sessionDate = new Date(today);
          sessionDate.setDate(today.getDate() + dayDiff);
          const [h, m] = (t.startTime ?? t.start_time ?? '00:00').split(':');
          sessionDate.setHours(Number(h), Number(m), 0, 0);
          return sessionDate > now ? sessionDate : null;
        })
        .filter(Boolean) as Date[];
      if (future.length > 0) {
        const next = future.sort((a, b) => a.getTime() - b.getTime())[0];
        nextSession = next.toLocaleString('es-ES', { dateStyle: 'long', timeStyle: 'short' });
      }
    }

    const chatNotifications = 0;
    const materialsNotifications = 0;

    return { tutorName, nextSession, chatNotifications, materialsNotifications };
  }

  useEffect(() => {
    let isMounted = true;
    async function calcularTodos() {
      const map: Record<string, any> = {};
      await Promise.all(
        courses.map(async (course) => {
          map[course.id] = await calcularInfoCurso(course);
        })
      );
      if (isMounted) setCourseInfoMap(map);
    }
    if (courses.length > 0) calcularTodos();
    else setCourseInfoMap({});
    return () => { isMounted = false; };
  }, [courses]);

  const fetchTutorActiveBookings = async () => {
    if (currentUserRole !== 'tutor' || !userId) return;
    
    setLoadingBookings(true);
    try {
      const bookings = await ClassroomBookingService.getTutorActiveBookings(userId);
      setActiveBookings(bookings);
    } catch (error) {
      console.error('Error obteniendo reservas del tutor:', error);
    } finally {
      setLoadingBookings(false);
    }
  };

  useEffect(() => {
    fetchTutorActiveBookings();
  }, [userId, currentUserRole]);


  return (
    <div className="min-h-screen bg-dark text-light flex flex-col">
      <ClassroomNavbar />

      <main className="flex-1 px-6 py-8">
        <h2 className="text-2xl font-bold mb-8">Tutorías disponibles en Classroom</h2>

        <div className="mb-4 p-4 bg-yellow-900 border border-yellow-600 rounded-lg text-yellow-100">
          <h3 className="font-bold mb-2">🔍 DEBUG INFO:</h3>
          <p>Rol actual: <strong>{currentUserRole || 'null'}</strong></p>
          <p>Es tutor: <strong>{currentUserRole === 'tutor' ? 'SÍ' : 'NO'}</strong></p>
          <p>Reservas encontradas: <strong>{tutorBookings.length}</strong></p>
          <p>Condición para mostrar sección: <strong>{currentUserRole === 'tutor' && tutorBookings.length > 0 ? 'SÍ' : 'NO'}</strong></p>
        </div>

        {currentUserRole === 'tutor' && tutorBookings.length > 0 && (
          <div className="mb-8 p-6 bg-dark-card border border-dark-border rounded-lg">
            <div className="flex items-center space-x-2 mb-4">
              <Users className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">Estudiantes Conectados</h3>
              <span className="bg-primary text-dark px-2 py-1 rounded-full text-sm font-medium">
                {tutorBookings.length}
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tutorBookings.map((booking) => {
                const studentInfo = studentInfoMap[booking.student_id] || {
                  firstName: 'Estudiante',
                  lastName: 'Desconocido',
                  email: ''
                };
                const course = courses.find(c => c.id === booking.tutoring_session_id);
                const joinedTime = new Date(booking.joined_at || '').toLocaleString('es-ES', {
                  dateStyle: 'short',
                  timeStyle: 'short'
                });
                
                return (
                  <div key={booking.id} className="p-4 bg-dark-light border border-dark-border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-medium text-light">
                          {studentInfo.firstName} {studentInfo.lastName}
                        </h4>
                        <p className="text-sm text-light-gray">{studentInfo.email}</p>
                      </div>
                      <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs">
                        Activo
                      </span>
                    </div>
                    
                    <div className="space-y-1 text-sm text-light-gray">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>Conectado: {joinedTime}</span>
                      </div>
                      {course && (
                        <div className="font-medium text-light">
                          Curso: {course.title}
                        </div>
                      )}
                    </div>
                    
                    <button 
                      onClick={() => window.open(`/classroom/tutor/${booking.tutoring_session_id}/student/${booking.student_id}`, '_blank')}
                      className="mt-3 w-full px-3 py-2 bg-primary text-dark rounded-lg hover:bg-primary-dark transition-colors text-sm font-medium"
                    >
                      Ir al Classroom
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex items-center space-x-4 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-light-gray w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar tutorías..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-dark-card border border-dark-border rounded-lg text-light placeholder-light-gray focus:outline-none focus:border-primary"
            />
          </div>
          <button 
            onClick={() => setShowAllTutorials(!showAllTutorials)}
            className="flex items-center space-x-2 px-4 py-2 bg-dark-card border border-dark-border rounded-lg hover:bg-dark-light transition-colors"
          >
            <Filter className="w-4 h-4" />
            <span>Todas las tutorías</span>
          </button>
        </div>

        {loading ? (
          <div className="text-center text-light-gray py-12">Cargando tutorías...</div>
        ) : error ? (
          <div className="text-center text-red-400 py-12">{error}</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {courses.length === 0 ? (
              <div className="col-span-full text-center text-light-gray py-12">No hay tutorías disponibles.</div>
            ) : (
              courses.map((course) => {
                const info = courseInfoMap[course.id] || {
                  tutorName: 'Desconocido',
                  nextSession: '',
                  chatNotifications: 0,
                  materialsNotifications: 0,
                };
                return (
                  <ClassroomCourseCard
                    key={course.id}
                    id={course.id}
                    title={course.title}
                    tutorName={info.tutorName}
                    chatNotifications={info.chatNotifications}
                    materialsNotifications={info.materialsNotifications}
                    imageUrl={course.imageUrl}
                  />
                );
              })
            )}
          </div>
        )}
      </main>

      <ClassroomFooter />
    </div>
  );
};

export default ClassroomPage;