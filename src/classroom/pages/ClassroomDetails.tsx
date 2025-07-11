import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { MessageCircle, Info, Video } from 'lucide-react';
import ClassroomNavbar from '../components/ClassroomNavbar';
import ClassroomFooter from '../components/ClassroomFooter';
import ChatTab from '../components/classroom-detail/chat/ChatTab';
import InformationTab from '../components/classroom-detail/info/InformationTab';
import VideoCallModal from '../components/classroom-detail/videocall/components/VideoCallModal';
import { TutoringService } from '../../tutoring/services/TutoringService';
import { UserService } from '../../user/services/UserService';
import { ClassroomBookingService } from '../components/service/BookingService';
import { TutoringSession } from '../../tutoring/types/Tutoring';
import { User } from '../../user/types/User';
import { Course } from '../../course/types/Course';
import axios from 'axios';
import { AuthService } from '../../public/services/authService';
import { useVideoCallStatus } from '../hooks/useVideoCallStatus';

const BACKEND_URL = import.meta.env.VITE_TUTORMATCH_BACKEND_URL;

type TabType = 'chat' | 'materials' | 'information';

const ClassroomDetails: React.FC = () => {
  const { tutoringId } = useParams<{ tutoringId: string }>();
  const [activeTab, setActiveTab] = useState<TabType>('chat');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookingStatus, setBookingStatus] = useState<string>('');

  // Estados para los datos
  const [tutoring, setTutoring] = useState<TutoringSession | null>(null);
  const [tutor, setTutor] = useState<User | null>(null);
  const [student, setStudent] = useState<User | null>(null);
  const [course, setCourse] = useState<Course | null>(null);

  // Estado para el modal de videollamada
  const [isVideoCallModalOpen, setIsVideoCallModalOpen] = useState(false);

  // Función para obtener datos reales
  useEffect(() => {
    const fetchData = async () => {
      if (!tutoringId) {
        setError('ID de tutoría no proporcionado');
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

        // 3. Obtener información del curso
        if (tutoringData.courseId) {
          try {
            const courseResponse = await axios.get(`${BACKEND_URL}/courses/${tutoringData.courseId}`);
            setCourse(courseResponse.data);
          } catch (courseError) {
            console.warn('Error al obtener información del curso:', courseError);
          }
        }

        // 4. Obtener información del estudiante actual (solo si no es el tutor)
        const currentUserId = AuthService.getCurrentUserId();
        if (currentUserId && currentUserId !== tutoringData.tutorId) {
          try {
            const studentData = await UserService.getUserById(currentUserId);
            setStudent(studentData);

            // 5. NUEVA LÓGICA: Crear reserva automática para el estudiante
            await handleStudentBooking(tutoringId, currentUserId, tutoringData.tutorId);
          } catch (studentError) {
            console.warn('Error al obtener información del estudiante:', studentError);
          }
        }

      } catch (err: any) {
        console.error('Error al cargar datos de la tutoría:', err);
        setError(err.message || 'Error al cargar los datos');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [tutoringId]);

  // MOVER EL HOOK AQUÍ - después del useEffect de carga de datos
  const { hasActiveCall, activeCall, loading: videoCallLoading } = useVideoCallStatus(tutoringId);

  // NUEVA FUNCIÓN: Manejar reserva automática del estudiante
  const handleStudentBooking = async (tutoringSessionId: string, studentId: string, tutorId: string) => {
    try {
      setBookingStatus('Conectando...');

      // Crear o obtener reserva existente
      const booking = await ClassroomBookingService.joinTutoringSession(
        tutoringSessionId,
        studentId,
        tutorId
      );

      setBookingStatus(`Sesión activa desde ${new Date(booking.joined_at || '').toLocaleString()}`);
      console.log('Reserva procesada:', booking);

    } catch (error) {
      console.error('Error en reserva:', error);
      setBookingStatus('Error al conectar a la sesión');
    }
  };

  // Función para obtener el nombre completo del tutor
  const getTutorName = () => {
    if (!tutor) return 'Tutor no identificado';
    const fullName = `${tutor.firstName || ''} ${tutor.lastName || ''}`.trim();
    return fullName || 'Tutor no identificado';
  };


  // Mostrar loading
  if (loading) {
    return (
      <div className="h-screen bg-dark text-light flex flex-col overflow-hidden">
        <ClassroomNavbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-light-gray">Cargando información de la tutoría...</p>
          </div>
        </div>
      </div>
    );
  }

  // Mostrar error
  if (error) {
    return (
      <div className="h-screen bg-dark text-light flex flex-col overflow-hidden">
        <ClassroomNavbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-500 text-xl mb-4">⚠️</div>
            <p className="text-light-gray mb-4">Error al cargar la tutoría</p>
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }
  

  // Función para manejar la videollamada - ACTUALIZADA
  const handleVideoCall = () => {
    setIsVideoCallModalOpen(true);
  };
  

  return (
    <div className="h-screen bg-dark text-light flex flex-col overflow-hidden">
      <ClassroomNavbar />
      <div className="px-6 pt-6 flex-shrink-0">
        <div className="mb-4 flex items-center justify-between">
          <div className="text-lg font-bold">
            <b>{tutoring?.title || tutoringId}</b> • <span>{getTutorName()}</span>
          </div>
          <div className="flex items-center space-x-4">
            {/* Mostrar estado de la reserva */}
            {bookingStatus && (
              <div className="text-sm text-green-400 bg-green-900/20 px-3 py-1 rounded-lg">
                {bookingStatus}
              </div>
            )}
            {/* Botón de videollamada dinámico */}
            <button
              onClick={handleVideoCall}
              disabled={videoCallLoading}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                hasActiveCall 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              } ${videoCallLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Video className="w-5 h-5" />
              <span>
                {videoCallLoading ? (
                  '🔄 Verificando...'
                ) : hasActiveCall ? (
                  '🔗 Unirse a videollamada'
                ) : (
                  '🎥 Iniciar videollamada'
                )}
              </span>
            </button>
          </div>
        </div>
      </div>
      {/* Navigation Tabs */}
      <nav className="bg-dark px-6 py-2 border-b border-dark-border flex-shrink-0">
        <div className="flex space-x-8">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'chat'
                ? 'border-primary text-primary'
                : 'border-transparent text-light-gray hover:text-light'
            }`}
          >
            <MessageCircle className="w-4 h-4" />
            <span>Chat</span>
          </button>
         {/*  <button
            onClick={() => setActiveTab('materials')}
            className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'materials'
                ? 'border-primary text-primary'
                : 'border-transparent text-light-gray hover:text-light'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Materiales</span>
          </button> */}
          <button
            onClick={() => setActiveTab('information')}
            className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'information'
                ? 'border-primary text-primary'
                : 'border-transparent text-light-gray hover:text-light'
            }`}
          >
            <Info className="w-4 h-4" />
            <span>Información</span>
          </button>
        </div>
      </nav>
      {/* Main Content */}
      <main className="flex-1 p-6 overflow-hidden">
        {activeTab === 'chat' && (
          <ChatTab classroomId={String(tutoringId)} />
        )}
        {/* {activeTab === 'materials' && (
          <MaterialsTab
            tutoringId={tutoringId!}
            viewMode={viewMode}
            setViewMode={(mode: 'list' | 'grid') => setViewMode(mode)}
            canUpload={canUploadMaterials()}
          />
        )} */}
        {activeTab === 'information' && (
          <InformationTab
            tutoring={tutoring}
            tutor={tutor || undefined}
            student={student || undefined}
            reviews={[]}
            course={course || undefined}
          />
        )}
      </main>

      {/* Modal de videollamada */}
      <VideoCallModal
        isOpen={isVideoCallModalOpen}
        onClose={() => setIsVideoCallModalOpen(false)}
        roomId={tutoring?.id}
        tutoringSessionId={tutoringId}
        callId={hasActiveCall ? activeCall?.id : undefined}
      />

      <div className="flex-shrink-0">
        <ClassroomFooter />
      </div>
    </div>
  );
};

export default ClassroomDetails;

