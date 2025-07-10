import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ProgressSpinner } from 'primereact/progressspinner';
import Navbar from '../../dashboard/components/Navbar';
import Footer from '../../public/components/Footer';
import { TutoringService } from '../services/TutoringService';
import { UserService } from '../../user/services/UserService';
import { TutoringSession } from '../types/Tutoring';
import { User } from '../../user/types/User';
import TutoringCard from '../components/TutoringCard';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, Calendar } from 'lucide-react';
import Avatar from '../../user/components/Avatar';

const TutorTutoringsPage: React.FC = () => {
  const { tutorId } = useParams<{ tutorId: string }>();
  const [tutorings, setTutorings] = useState<TutoringSession[]>([]);
  const [tutor, setTutor] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!tutorId) {
          setError('ID de tutor no proporcionado');
          return;
        }

        setLoading(true);

        // Obtener información del tutor y sus tutorías en paralelo
        const [tutorData, tutoringsData] = await Promise.all([
          UserService.getUserById(tutorId),
          TutoringService.getTutoringSessionsByTutorId(tutorId)
        ]);

        setTutor(tutorData);
        setTutorings(tutoringsData);

      } catch (error: any) {
        console.error('Error al cargar los datos:', error);
        setError(error.message || 'Error al cargar las tutorías del tutor');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [tutorId]);

  const handleTutoringClick = (tutoringId: string | number) => {
    navigate(`/tutoring/${tutoringId}`);
  };

  const handleBackClick = () => {
    navigate(-1); // Volver a la página anterior
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-[#1e1e1e] text-white">
        <div className="fixed top-0 left-0 right-0 z-50">
          <Navbar />
        </div>
        <div className="flex-1 flex items-center justify-center pt-16">
          <div className="text-center">
            <ProgressSpinner 
              style={{ width: '50px', height: '50px' }}
              strokeWidth="4"
              fill="#1e1e1e"
              animationDuration=".5s" 
            />
            <p className="text-white mt-4">Cargando tutorías del tutor...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !tutor) {
    return (
      <div className="flex flex-col min-h-screen bg-[#1e1e1e] text-white">
        <div className="fixed top-0 left-0 right-0 z-50">
          <Navbar />
        </div>
        <div className="flex-1 flex items-center justify-center pt-16">
          <div className="text-center p-6 bg-[#252525] rounded-lg border border-red-500">
            <h2 className="text-xl text-red-500 mb-4">Error</h2>
            <p className="text-white">{error || 'No se encontró el tutor solicitado'}</p>
            <button
              onClick={handleBackClick}
              className="mt-4 px-4 py-2 bg-[#f05c5c] text-white rounded-lg hover:bg-[#d14949] transition-all"
            >
              Volver
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }  // Calcular estadísticas del tutor
  const totalTutorings = tutorings.length;

  return (
    <div className="flex flex-col min-h-screen bg-[#1e1e1e] text-white">
      <div className="fixed top-0 left-0 right-0 z-50">
        <Navbar />
      </div>
      
      <div className="pt-16 flex-1">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          {/* Botón volver */}
          <button
            onClick={handleBackClick}
            className="flex items-center gap-2 mb-6 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Volver</span>
          </button>

          {/* Header del tutor */}
          <div className="bg-[#252525] rounded-lg p-6 mb-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <div className="flex-shrink-0">
                <Avatar user={tutor} size="lg" />
              </div>
              
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-bold text-white mb-2">
                  {tutor.firstName} {tutor.lastName}
                </h1>
                <p className="text-gray-400 mb-1">Tutor</p>
                <p className="text-gray-400 mb-4">
                  {tutor.semesterNumber}° Semestre • {tutor.academicYear || 'UPC'}
                </p>
                
                {/* Estadísticas */}
                <div className="flex flex-wrap justify-center md:justify-start gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <BookOpen size={16} className="text-[#f05c5c]" />
                    <span className="text-gray-300">
                      {totalTutorings} {totalTutorings === 1 ? 'tutoría' : 'tutorías'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-[#f05c5c]" />
                    <span className="text-gray-300">
                      Activo desde {new Date().getFullYear()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tutorías del tutor */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">
                Tutorías ofrecidas por {tutor.firstName}
              </h2>
              <span className="text-gray-400 text-sm">
                {totalTutorings} {totalTutorings === 1 ? 'resultado' : 'resultados'}
              </span>
            </div>

            {tutorings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tutorings.map((tutoring) => (
                  <TutoringCard
                    key={tutoring.id}
                    tutoring={tutoring}
                    onClick={handleTutoringClick}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-[#252525] rounded-lg p-8 text-center">
                <BookOpen size={48} className="text-gray-500 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-white mb-2">
                  No hay tutorías disponibles
                </h3>
                <p className="text-gray-400">
                  {tutor.firstName} aún no ha creado ninguna tutoría.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default TutorTutoringsPage;
