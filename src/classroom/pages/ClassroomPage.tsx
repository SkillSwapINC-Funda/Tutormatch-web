import { useState, useEffect } from 'react';
import { TutoringService } from '../../tutoring/services/TutoringService';
import { UserService } from '../../user/services/UserService';
import { TutoringSession } from '../../tutoring/types/Tutoring';
import { Search, Filter } from 'lucide-react';
import ClassroomCourseCard from '../components/classroom-dashboard/ClassroomCourseCard';
import ClassroomNavbar from '../components/ClassroomNavbar';
import ClassroomFooter from '../components/ClassroomFooter';

const ClassroomPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAllTutorials, setShowAllTutorials] = useState(false);

  // Estado para los cursos reales
  const [courses, setCourses] = useState<TutoringSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [courseInfoMap, setCourseInfoMap] = useState<Record<string, {
    tutorName: string;
    status: string;
    nextSession: string;
    chatNotifications: number;
    materialsNotifications: number;
  }>>({});

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await TutoringService.getAllTutoringSessions();
        setCourses(data);
      } catch (err: any) {
        setError('Error al cargar las tutorías.');
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'En curso':
        return 'bg-green-500';
      case 'Completado':
        return 'bg-blue-500';
      default:
        return 'bg-light-gray';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'En curso':
        return 'En curso';
      case 'Completado':
        return 'Completado';
      default:
        return status;
    }
  };


  async function calcularInfoCurso(course: TutoringSession): Promise<{
    tutorName: string;
    status: string;
    nextSession: string;
    chatNotifications: number;
    materialsNotifications: number;
  }> {
    let tutorName = 'Desconocido';
    if ((course as any).tutor && (course as any).tutor.firstName) {
      tutorName = `${(course as any).tutor.firstName} ${(course as any).tutor.lastName || ''}`.trim();
    } else if (course.tutorId) {
      // Buscar nombre real del tutor desde el perfil
      try {
        const user = await UserService.getUserById(course.tutorId);
        tutorName = `${user.firstName} ${user.lastName}`.trim();
      } catch {
        tutorName = course.tutorId;
      }
    }

    let status = 'Completado';
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
        status = 'En curso';
        const next = future.sort((a, b) => a.getTime() - b.getTime())[0];
        nextSession = next.toLocaleString('es-ES', { dateStyle: 'long', timeStyle: 'short' });
      }
    }

    const chatNotifications = 0;
    const materialsNotifications = 0;

    return { tutorName, status, nextSession, chatNotifications, materialsNotifications };
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

  return (
    <div className="min-h-screen bg-dark text-light flex flex-col">
      {/* Header */}
      <ClassroomNavbar />

      {/* Main Content */}
      <main className="flex-1 px-6 py-8">
        <h2 className="text-2xl font-bold mb-8">Tutorías disponibles en Classroom</h2>

        {/* Search and Filter */}
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

        {/* Courses Grid */}
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
                  status: 'Completado',
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
                    status={info.status}
                    nextSession={info.nextSession}
                    chatNotifications={info.chatNotifications}
                    materialsNotifications={info.materialsNotifications}
                    imageUrl={course.imageUrl}
                    getStatusColor={getStatusColor}
                    getStatusText={getStatusText}
                  />
                );
              })
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <ClassroomFooter />
    </div>
  );
};

export default ClassroomPage;