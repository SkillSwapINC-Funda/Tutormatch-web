import { useState, useEffect } from 'react';
import { TutoringService } from '../../tutoring/services/TutoringService';
import { TutoringSession } from '../../tutoring/types/Tutoring';
import { Search, Filter, MessageCircle, FileText } from 'lucide-react';
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

  function calcularInfoCurso(course: TutoringSession) {
    let tutorName = 'Desconocido';
    if ((course as any).tutor && (course as any).tutor.firstName) {
      tutorName = `${(course as any).tutor.firstName} ${(course as any).tutor.lastName || ''}`.trim();
    } else if (course.tutorId) {
      tutorName = course.tutorId;
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
    const map: Record<string, any> = {};
    courses.forEach((course) => {
      map[course.id] = calcularInfoCurso(course);
    });
    setCourseInfoMap(map);
  }, [courses]);

  return (
    <div className="min-h-screen bg-dark text-light flex flex-col">
      {/* Header */}
      <ClassroomNavbar />

      {/* Main Content */}
      <main className="flex-1 px-6 py-8">
        <h2 className="text-2xl font-bold mb-8">Mis Cursos en Classroom</h2>

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
                  <div key={course.id} className="bg-dark-card rounded-lg overflow-hidden hover:bg-dark-light transition-colors">
                    {/* Course Content Area */}
                    <div className="bg-light-gray h-40 flex items-center justify-center">
                      <div className="w-16 h-16 bg-dark-border rounded-lg flex items-center justify-center">
                        <FileText className="w-8 h-8 text-light-gray" />
                      </div>
                    </div>

                    {/* Course Info */}
                    <div className="px-4 py-4">
                      {/* Status Badge */}
                      <div className="mb-3">
                        <span className={`inline-block px-3 py-1 rounded text-sm font-medium text-light ${getStatusColor(status)}`}>
                          {getStatusText(status)}
                        </span>
                      </div>

                      <h3 className="text-lg font-semibold mb-2 text-light leading-tight">
                        {course.title}
                      </h3>
                      <p className="text-light-gray text-sm mb-1">
                        Tutor: {info.tutorName}
                      </p>
                      <p className="text-light-gray text-sm mb-4">
                        {info.status === 'Completado' ? (
                          <>🔴 Completado</>
                        ) : (
                          <>🔴 Próxima sesión: {info.nextSession}</>
                        )}
                      </p>

                      {/* Enter Classroom Button */}
                      <button className="w-full bg-primary hover:bg-primary-hover text-light font-medium py-3 px-4 rounded-lg transition-colors mb-4">
                        Entrar al Classroom
                      </button>

                      {/* Chat and Materials */}
                      <div className="flex space-x-4">
                        <div className="flex items-center space-x-2 text-light-gray">
                          <div className="relative">
                            <MessageCircle className="w-5 h-5" />
                            {info.chatNotifications > 0 && (
                              <span className="absolute -top-1 -right-1 bg-primary text-xs w-4 h-4 rounded-full flex items-center justify-center">
                                {info.chatNotifications}
                              </span>
                            )}
                          </div>
                          <span className="text-sm">Chat</span>
                        </div>
                        <div className="flex items-center space-x-2 text-light-gray">
                          <div className="relative">
                            <FileText className="w-5 h-5" />
                            {info.materialsNotifications > 0 && (
                              <span className="absolute -top-1 -right-1 bg-primary text-xs w-4 h-4 rounded-full flex items-center justify-center">
                                {info.materialsNotifications}
                              </span>
                            )}
                          </div>
                          <span className="text-sm">Materiales</span>
                        </div>
                      </div>
                    </div>
                  </div>
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