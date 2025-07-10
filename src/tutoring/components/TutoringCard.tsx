import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TutoringSession } from '../types/Tutoring';
import { User } from '../../user/types/User';
import { Rating } from 'primereact/rating';
import { UserService } from '../../user/services/UserService';
import { TutoringService } from '../services/TutoringService';
import { Star, Clock } from 'lucide-react';

interface TutoringCardProps {
  tutoring: TutoringSession;
  onClick?: (tutoringId: string | number) => void;
}

const TutoringCard: React.FC<TutoringCardProps> = ({ tutoring }) => {
  const [tutor, setTutor] = useState<User | null>(null);
  const [rating, setRating] = useState<number>(0);
  const [reviewCount, setReviewCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchTutorAndReviews = async () => {
      try {
        // Obtener información del tutor
        if (tutoring.tutorId) {
          const tutorData = await UserService.getUserById(tutoring.tutorId.toString());
          setTutor(tutorData);
        }

        // Obtener reseñas y calcular valoración
        const reviews = await TutoringService.getReviews(tutoring.id.toString());
        if (reviews && reviews.length > 0) {
          const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
          setRating(parseFloat((totalRating / reviews.length).toFixed(1)));
          setReviewCount(reviews.length);
        }
      } catch (error) {
        console.error('Error al cargar datos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTutorAndReviews();
  }, [tutoring.id, tutoring.tutorId]);

  const customStyles = `
    .p-rating .p-rating-item .p-rating-icon {
      color: #F59E0B;
    }
    
    .p-rating .p-rating-item:not(.p-rating-item-active) .p-rating-icon {
      color: rgba(245, 158, 11, 0.3);
    }
    
    .p-rating:not(.p-disabled):not(.p-readonly) .p-rating-item:hover .p-rating-icon {
      color: #D97706;
    }
  `;

  // Imagen por defecto si no hay una
  const defaultImage = 'https://i0.wp.com/port2flavors.com/wp-content/uploads/2022/07/placeholder-614.png';

  return (
    <Link 
      to={`/tutoring/${tutoring.id}`} 
      className="block bg-dark-card border border-dark-card rounded-xl overflow-hidden hover:shadow-2xl hover:border-gray-600 transition-all duration-300 transform hover:-translate-y-1 group"
    >
      <style>{customStyles}</style>
      
      {/* Header con imagen y información principal */}
      <div className="relative">
        <div className="aspect-video sm:aspect-[3/2] md:aspect-video overflow-hidden">
          <img
            src={tutoring.imageUrl || defaultImage}
            alt={tutoring.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        
        {/* Badge de precio destacado */}
        <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full font-bold text-sm shadow-lg">
          S/. {tutoring.price.toFixed(2)}
        </div>
      </div>

      {/* Contenido principal */}
      <div className="p-5 space-y-4">
        {/* Título del curso */}
        <div>
          <h2 className="text-xl font-bold text-white mb-2 line-clamp-2 group-hover:text-blue-400 transition-colors">
            {tutoring.title}
          </h2>
        </div>

        {/* Información del tutor */}
        <div className="flex items-center space-x-3 pb-3 border-b border-gray-700">
          <div className="flex-1 min-w-0">
            <p className="text-blue-400 font-medium truncate">
              {loading ? 'Cargando...' : tutor ? `${tutor.firstName} ${tutor.lastName}` : 'Tutor desconocido'}
            </p>
            <p className="text-xs text-gray-500">Tutor</p>
          </div>
        </div>

        {/* Rating y reseñas */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
              <span className="text-white font-semibold text-sm">
                {rating > 0 ? rating : '0.0'}
              </span>
            </div>
            <Rating 
              value={Math.round(rating)} 
              disabled 
              cancel={false} 
              className="custom-rating scale-75" 
            />
            <span className="text-gray-400 text-xs">
              ({reviewCount} reseñas)
            </span>
          </div>
        </div>

        {/* Descripción */}
        <div>
          <p className="text-gray-300 text-sm line-clamp-3 leading-relaxed">
            {tutoring.description}
          </p>
        </div>

        {/* Footer con fecha */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-700">
          <div className="flex items-center space-x-2 text-gray-400">
            <Clock className="w-4 h-4" />
            <span className="text-xs">
              {tutoring.createdAt ? new Date(tutoring.createdAt).toLocaleString('es-PE', { 
                year: 'numeric', 
                month: '2-digit', 
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
              }) : 'Fecha no disponible'}
            </span>
          </div>
          
          {/* Indicador de acción */}
          <div className="text-blue-400 text-sm font-medium group-hover:text-blue-300 transition-colors">
            Ver detalles →
          </div>
        </div>
      </div>
    </Link>
  );
};

export default TutoringCard;