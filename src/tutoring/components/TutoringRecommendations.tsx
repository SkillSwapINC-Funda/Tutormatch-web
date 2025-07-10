import React from 'react';
import { TutoringSession } from '../types/Tutoring';
import TutoringCard from './TutoringCard';

interface TutoringRecommendationsProps {
  tutorings: TutoringSession[];
  onTutoringClick: (tutoringId: string | number) => void;
}

const TutoringRecommendations: React.FC<TutoringRecommendationsProps> = ({ 
  tutorings, 
  onTutoringClick 
}) => {
  if (!tutorings || tutorings.length === 0) {
    return null;
  }
  
  return (
    <div className="w-full mb-8">
      {/* Lista de tutorías en formato grid, 3 columnas en escritorio, 2 en tablet, 1 en móvil */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tutorings.map((tutoring) => (
          <div key={tutoring.id}>
            <TutoringCard 
              tutoring={tutoring} 
              onClick={onTutoringClick} 
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default TutoringRecommendations;