import React from 'react';
import { Check, Users, Monitor } from 'lucide-react';
import { Rating } from 'primereact/rating';

interface InformationTabProps {
  tutoring: {
    title: string;
    description: string | null;
    price: number;
    imageUrl?: string | null;
    whatTheyWillLearn?: any;
    availableTimes?: any[];
  } | null;
  tutor?: {
    id?: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
    bio?: string;
  };
  student?: {
    firstName?: string;
    lastName?: string;
    avatar?: string;
    bio?: string;
  };
  reviews?: {
    rating: number;
  }[];
  course?: {
    name?: string;
    semesterNumber?: number;
  } | null;
  // Agregar prop opcional para identificar si es vista de tutor
  tutorView?: boolean;
}

const InformationTab: React.FC<InformationTabProps> = ({ 
  tutoring, 
  tutor, 
  student, 
  reviews = [],
  course,
  tutorView = false
}) => {

  if (!tutoring) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-light-gray text-xl mb-4">⚠️</div>
          <p className="text-light-gray">No se pudo cargar la información de la tutoría</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-primary text-light rounded hover:bg-primary-dark transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  // Función para obtener las iniciales del nombre
  const getInitials = (firstName?: string, lastName?: string) => {
    const first = firstName?.charAt(0)?.toUpperCase() || '';
    const last = lastName?.charAt(0)?.toUpperCase() || '';
    return first + last || 'NN';
  };

  // Función para obtener el nombre completo
  const getFullName = (fallback: string, firstName?: string, lastName?: string) => {
    const fullName = `${firstName || ''} ${lastName || ''}`.trim();
    return fullName || fallback;
  };

  // Calcular rating promedio
  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0;

  // Procesar puntos de aprendizaje
  const learningPoints = Array.isArray(tutoring.whatTheyWillLearn)
    ? tutoring.whatTheyWillLearn
    : typeof tutoring.whatTheyWillLearn === 'object' && tutoring.whatTheyWillLearn !== null
      ? Object.values(tutoring.whatTheyWillLearn)
      : typeof tutoring.whatTheyWillLearn === 'string'
        ? tutoring.whatTheyWillLearn.split('\n').filter((item: string) => item.trim() !== '')
        : ['Contenido no especificado'];

  const defaultImageUrl = 'https://i0.wp.com/port2flavors.com/wp-content/uploads/2022/07/placeholder-614.png';

  return (
    <div className="h-full overflow-y-auto">
      <div className="flex flex-col lg:flex-row gap-6 p-4">
        {/* Contenido principal */}
        <div className="w-full lg:w-3/4 space-y-6">
          {/* Header con información básica */}
          <div className="bg-dark-card rounded-lg p-6">
            <div className="flex gap-2 mb-4">
              {course && course.name && (
                <>
                  <span className="px-2 py-1 bg-red-600/20 text-red-500 rounded-full text-xs font-medium">
                    {course.semesterNumber}° Semestre
                  </span>
                  <span className="px-2 py-1 bg-green-600/20 text-green-500 rounded-full text-xs font-medium">
                    {course.name}
                  </span>
                </>
              )}
              {tutorView && (
                <span className="px-2 py-1 bg-blue-600/20 text-blue-500 rounded-full text-xs font-medium">
                  Vista de Tutor
                </span>
              )}
            </div>
            
            <h1 className="text-2xl font-bold mb-4 text-light">{tutoring.title}</h1>
            <p className="text-light-gray mb-4">{tutoring.description}</p>
            
            {reviews.length > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <span className="text-primary font-semibold text-lg">
                  {averageRating.toFixed(1)}
                </span>
                <Rating
                  value={Math.round(averageRating)}
                  readOnly
                  cancel={false}
                />
                <span className="text-light-gray text-sm">({reviews.length} reseñas)</span>
              </div>
            )}
            
            {tutor && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-light rounded-full flex items-center justify-center text-dark text-sm font-bold overflow-hidden">
                  {tutor.avatar ? (
                    <img 
                      src={tutor.avatar} 
                      alt="Avatar del tutor" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    getInitials(tutor.firstName, tutor.lastName)
                  )}
                </div>
                <div>
                  <p className="text-light font-medium">
                    {getFullName('Tutor no identificado', tutor.firstName, tutor.lastName)}
                  </p>
                  <span className="bg-primary text-light text-xs px-2 py-1 rounded">Tutor</span>
                </div>
              </div>
            )}
          </div>

          {/* Lo que aprenderás */}
          <div className="bg-dark-card rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-6 text-light">
              {tutorView ? 'Contenido de la tutoría' : 'Lo que aprenderás'}
            </h2>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {learningPoints.map((item: any, index: number) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">
                    <Check size={18} />
                  </span>
                  <span className="text-light-gray">
                    {typeof item === 'string' ? item : JSON.stringify(item)}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Información del tutor */}
          {tutor && (
            <div className="bg-dark-card rounded-lg p-6">
              <h3 className="text-light text-lg font-semibold mb-4">
                {tutorView ? 'Tu perfil como tutor' : 'Sobre el tutor'}
              </h3>
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 bg-light rounded-full flex items-center justify-center text-dark text-xl font-bold overflow-hidden">
                  {tutor.avatar ? (
                    <img 
                      src={tutor.avatar} 
                      alt="Avatar del tutor" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    getInitials(tutor.firstName, tutor.lastName)
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="text-light font-semibold">
                      {getFullName('Tutor no identificado', tutor.firstName, tutor.lastName)}
                    </h4>
                    <span className="bg-primary text-light text-xs px-2 py-1 rounded">Tutor</span>
                  </div>
                  <p className="text-light-gray text-sm leading-relaxed">
                    {tutor.bio || 'Información del tutor no disponible'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Información del estudiante - Mostrar siempre en vista de tutor */}
          {student && (
            <div className="bg-dark-card rounded-lg p-6">
              <h3 className="text-light text-lg font-semibold mb-4">
                {tutorView ? 'Tu estudiante' : 'Estudiante'}
              </h3>
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 bg-light rounded-full flex items-center justify-center text-dark text-xl font-bold overflow-hidden">
                  {student.avatar ? (
                    <img 
                      src={student.avatar} 
                      alt="Avatar del estudiante" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    getInitials(student.firstName, student.lastName)
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="text-light font-semibold">
                      {getFullName('Estudiante no identificado', student.firstName, student.lastName)}
                    </h4>
                    <span className="bg-blue-500 text-light text-xs px-2 py-1 rounded">Estudiante</span>
                  </div>
                  <p className="text-light-gray text-sm leading-relaxed">
                    {student.bio || 'Información del estudiante no disponible'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar derecho */}
        <div className="w-full lg:w-1/4">
          <div className="bg-dark-card p-6 rounded-lg sticky top-4">
            <img
              src={tutoring.imageUrl || defaultImageUrl}
              alt={tutoring.title}
              className="w-full aspect-video object-cover rounded-lg mb-4"
            />
            <h3 className="text-xl font-bold mb-2 text-light">{tutoring.title}</h3>
            <p className="text-2xl font-bold text-primary my-3">S/. {tutoring.price.toFixed(2)}</p>
            
            <div className="w-full text-sm text-light-gray">
              <p className="font-semibold text-light mb-2">Esta tutoría incluye:</p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <Users size={16} className="text-primary" />
                  <span>Sesiones personalizadas</span>
                </li>
                <li className="flex items-center gap-2">
                  <Monitor size={16} className="text-primary" />
                  <span>Modalidad: 100% virtual</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InformationTab;
