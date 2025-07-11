import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { MessageCircle, FileText, Info, Video, User, Clock, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ClassroomNavbar from '../components/ClassroomNavbar';
import ClassroomFooter from '../components/ClassroomFooter';
import ChatTab from '../components/classroom-detail/chat/ChatTab';
import MaterialsTab from '../components/classroom-detail/materials/MaterialsTab';
import InformationTab from '../components/classroom-detail/info/InformationTab';
import VideoCallModal from '../components/classroom-detail/videocall/components/VideoCallModal';
import { TutoringService } from '../../tutoring/services/TutoringService';
import { UserService } from '../../user/services/UserService';
import { TutoringSession } from '../../tutoring/types/Tutoring';
import { User as UserType } from '../../user/types/User';
import { Course } from '../../course/types/Course';
import { ClassroomBookingService, ClassroomBooking } from '../components/service/BookingService';
import axios from 'axios';

const API_URL = import.meta.env.VITE_TUTORMATCH_BACKEND_URL;
const API_VIDEO_URL = import.meta.env.VITE_TUTORMATCH_MICROSERVICES;

const TutorClassroomView: React.FC = () => {
  const { tutoringId, studentId } = useParams<{ tutoringId: string; studentId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('chat');
  const [viewMode, setViewMode] = useState('list');
  const [isVideoCallModalOpen, setIsVideoCallModalOpen] = useState(false);

  // Estados para datos reales
  const [tutoring, setTutoring] = useState<TutoringSession | null>(null);
  const [tutor, setTutor] = useState<UserType | null>(null);
  const [student, setStudent] = useState<UserType | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [booking, setBooking] = useState<ClassroomBooking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Función para obtener datos reales
  useEffect(() => {
    const fetchData = async () => {
      if (!tutoringId || !studentId) {
        setError('ID de tutoría o estudiante no proporcionado');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // 1. Obtener información de la tutoría
        const tutoringData = await TutoringService.getTutoringSession(tutoringId);
        setTutoring(tutoringData);

        // 2. Obtener información del tutor
        if (tutoringData.tutorId) {
          const tutorData = await UserService.getUserById(tutoringData.tutorId);
          setTutor(tutorData);
        }

        // 3. Obtener información del estudiante específico
        const studentData = await UserService.getUserById(studentId);
        setStudent(studentData);

        // 4. Obtener información del curso si existe
        if (tutoringData.courseId) {
          try {
            const response = await axios.get(`${API_URL}/courses/${tutoringData.courseId}`);
            setCourse(response.data);
          } catch (courseError) {
            console.warn('No se pudo obtener información del curso:', courseError);
          }
        }

        // 5. Obtener información de la reserva activa
        const activeBooking = await ClassroomBookingService.getActiveBooking(tutoringId, studentId);
        setBooking(activeBooking);

      } catch (err: any) {
        console.error('Error al cargar datos:', err);
        setError('Error al cargar la información del classroom');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [tutoringId, studentId]);

  // Función para manejar la videollamada - ACTUALIZADA
  const handleVideoCall = () => {
    setIsVideoCallModalOpen(true);
  };

  const getTutorName = () => {
    if (!tutor) return 'Tutor no identificado';
    const fullName = `${tutor.firstName || ''} ${tutor.lastName || ''}`.trim();
    return fullName || 'Tutor no identificado';
  };

  const getStudentName = () => {
    if (!student) return 'Estudiante no identificado';
    const fullName = `${student.firstName || ''} ${student.lastName || ''}`.trim();
    return fullName || 'Estudiante no identificado';
  };

  const getConnectionTime = () => {
    if (!booking?.joined_at) return 'Tiempo desconocido';
    
    const now = new Date();
    const joined = new Date(booking.joined_at);
    const diffMs = now.getTime() - joined.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 60) {
      return `${diffMins} minutos`;
    } else {
      const hours = Math.floor(diffMins / 60);
      const mins = diffMins % 60;
      return `${hours}h ${mins}min`;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark text-light flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-light-gray">Cargando classroom...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-dark text-light flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button 
            onClick={() => navigate('/classroom')}
            className="px-4 py-2 bg-primary text-dark rounded-lg hover:bg-primary-dark transition-colors"
          >
            Volver al Classroom
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark text-light flex flex-col">
      <ClassroomNavbar />
      
      <main className="flex-1 px-6 py-8">
        {/* Header con información del estudiante */}
        <div className="mb-6">
          <button 
            onClick={() => navigate('/classroom')}
            className="flex items-center space-x-2 text-light-gray hover:text-light mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al Classroom</span>
          </button>
          
          <div className="bg-dark-card border border-dark-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-light mb-2">
                  {tutoring?.title || 'Tutoría'}
                </h1>
                <p className="text-light-gray">
                  Sesión con: <span className="text-primary font-medium">{getStudentName()}</span>
                </p>
              </div>
              <div className="text-right">
                <div className="flex items-center space-x-2 mb-2">
                  <User className="w-4 h-4 text-primary" />
                  <span className="text-sm text-light-gray">Tutor: {getTutorName()}</span>
                </div>
                {booking && (
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-green-500">Conectado: {getConnectionTime()}</span>
                  </div>
                )}
              </div>
            </div>
            
            {course && (
              <div className="text-sm text-light-gray">
                <strong>Curso:</strong> {course.name}
              </div>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-6 bg-dark-card rounded-lg p-1">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
              activeTab === 'chat'
                ? 'bg-primary text-dark font-medium'
                : 'text-light-gray hover:text-light hover:bg-dark-light'
            }`}
          >
            <MessageCircle className="w-4 h-4" />
            <span>Chat</span>
          </button>
          <button
            onClick={() => setActiveTab('materials')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
              activeTab === 'materials'
                ? 'bg-primary text-dark font-medium'
                : 'text-light-gray hover:text-light hover:bg-dark-light'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Materiales</span>
          </button>
          <button
            onClick={() => setActiveTab('info')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
              activeTab === 'info'
                ? 'bg-primary text-dark font-medium'
                : 'text-light-gray hover:text-light hover:bg-dark-light'
            }`}
          >
            <Info className="w-4 h-4" />
            <span>Información</span>
          </button>
          <button
            onClick={handleVideoCall}
            className="flex items-center space-x-2 px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700 transition-colors ml-auto"
          >
            <Video className="w-4 h-4" />
            <span>Videollamada</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="bg-dark-card rounded-lg border border-dark-border overflow-hidden">
          {activeTab === 'chat' && (
            <ChatTab 
              classroomId={tutoringId!}
            />
          )}
          {activeTab === 'materials' && (
            <MaterialsTab 
              tutoringId={tutoringId!}
              materials={[]} 
              viewMode={viewMode as 'list' | 'grid'}
              setViewMode={setViewMode}
            />
          )}
          {activeTab === 'info' && (
            <InformationTab 
              tutoring={tutoring} 
              tutor={tutor || undefined}
              student={student || undefined}
              course={course}
              reviews={[]}
              tutorView={true}
            />
          )}
        </div>
      </main>
      
      {/* Modal de videollamada */}
      <VideoCallModal
        isOpen={isVideoCallModalOpen}
        onClose={() => setIsVideoCallModalOpen(false)}
        roomId={tutoringId}
        tutoringSessionId={tutoringId}
      />
      
      <ClassroomFooter />
    </div>
  );
};

export default TutorClassroomView;