import React, { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { TutoringSession } from '../../tutoring/types/Tutoring';
import { TutoringService } from '../../tutoring/services/TutoringService';
import { useNavigate } from 'react-router-dom';
import { Loader } from 'lucide-react';
import TutoringRecommendations from '../../tutoring/components/TutoringRecommendations';
import { useAuth } from '../../public/hooks/useAuth';

const DashboardPage: React.FC = () => {
  // Obtener datos del usuario desde useAuth
  const { user, loading: userLoading } = useAuth();
  
  // Estados para tutorías recomendadas
  const [recommendedTutorings, setRecommendedTutorings] = useState<TutoringSession[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Obtener datos de tutorías de la API
  useEffect(() => {
    const fetchTutorings = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Obtener todas las tutorías disponibles
        const tutoringsData = await TutoringService.getAllTutoringSessions();

        // En una aplicación real, aquí aplicaríamos lógica de recomendación basada
        // en el perfil del usuario, historial, cursos, etc.
        setRecommendedTutorings(tutoringsData);

      } catch (error) {
        console.error('Error al cargar las tutorías recomendadas:', error);
        setError('No se pudieron cargar las tutorías recomendadas. Por favor, intente nuevamente.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTutorings();
  }, []);

  // Manejar clic en una tarjeta de tutoría
  const handleTutoringClick = (tutoringId: string | number) => {
    navigate(`/tutoring/${tutoringId}`);
  };

  // Determinar si estamos cargando cualquier dato
  const loading = userLoading || isLoading;

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <Loader className="animate-spin text-primary h-10 w-10 mb-4" />
            <div className="text-white">Cargando datos del dashboard...</div>
          </div>
        ) : error ? (
          <div className="bg-red-900 bg-opacity-25 border border-red-700 rounded-md p-4 my-6">
            <p className="text-red-400">{error}</p>
          </div>
        ) : (
          <>
            {/* Perfil del usuario - responsive con Tailwind */}
            {user && (
              <div className="bg-dark-card rounded-lg shadow-lg mb-6 overflow-hidden">
                <div className="p-6">
                  <div className="flex flex-col md:flex-row items-center md:items-start">
                    <div className="w-24 h-24 md:w-32 md:h-32 bg-primary rounded-full flex items-center justify-center mb-4 md:mb-0 md:mr-6 overflow-hidden">
                      {user.avatar ? (
                        <img 
                          src={user.avatar} 
                          alt={`${user.firstName} ${user.lastName}`}
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : (
                        <span className="text-white text-4xl font-bold">
                          {user.firstName?.charAt(0) || user.lastName?.charAt(0) || 'U'}
                        </span>
                      )}
                    </div>
                    <div className="text-center md:text-left flex-1">
                      <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                        ¡Hola de nuevo, {user.firstName} {user.lastName}!
                      </h1>
                      <p className="text-light-gray mb-1">
                        {user.role === 'tutor' ? 'Tutor' : 'Estudiante'} • {user.semesterNumber}° Semestre
                      </p>
                      <p className="text-light-gray">{user.academicYear || 'No especificado'}</p>
                    </div>                    <div className="mt-4 md:mt-0 flex flex-col gap-2">
                      <button
                        className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-md"
                        onClick={() => navigate('/profile')}
                      >
                        Ver perfil
                      </button>
                      {/* Solo mostrar botón "Ver Tutorías" si el usuario es tutor */}
                      {user.role === 'tutor' && (
                        <button
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
                          onClick={() => navigate(`/tutor/${user.id}/tutorings`)}
                        >
                          Ver Tutorías
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Sección de tutorías recomendadas usando el componente especializado */}
            <div className="mb-6">
              <h2 className="text-xl md:text-2xl font-bold text-white mb-4">
                Tutorías disponibles para ti
              </h2>
              {recommendedTutorings.length > 0 ? (
                <TutoringRecommendations
                  tutorings={recommendedTutorings}
                  onTutoringClick={handleTutoringClick}
                />
              ) : (
                <div className="bg-dark-card rounded-lg p-6 text-center">
                  <p className="text-light-gray">
                    Aún no hay tutorías recomendadas disponibles.
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;