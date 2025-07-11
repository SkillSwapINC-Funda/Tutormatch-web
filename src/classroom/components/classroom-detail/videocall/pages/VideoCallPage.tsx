import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';

const VideoCallPage: React.FC = () => {
  const { tutoringId } = useParams<{ tutoringId: string }>();

  useEffect(() => {
    // Configurar el título de la ventana
    document.title = `Videollamada - Tutoría ${tutoringId}`;
  }, [tutoringId]);

  return (
    <div className="h-screen w-screen bg-black flex flex-col overflow-hidden">
      {/* Header mínimo */}
      <div className="bg-gray-900 px-4 py-2 flex-shrink-0">
        <h1 className="text-white text-sm font-medium">
          Videollamada - Tutoría {tutoringId}
        </h1>
      </div>

      {/* Contenedor principal para Jitsi con marco rojo */}
      <div className="flex-1 p-4">
        <div 
          id="jitsi-container" 
          className="w-full h-full border-4 border-red-500 rounded-lg overflow-hidden bg-gray-800"
        >
          {/* Aquí se montará Jitsi Meet */}
          <div className="w-full h-full flex items-center justify-center text-white">
            <div className="text-center">
              <div className="animate-pulse mb-4">
                <div className="w-16 h-16 bg-gray-600 rounded-full mx-auto mb-4"></div>
              </div>
              <p className="text-gray-400">Cargando videollamada...</p>
              <p className="text-gray-500 text-sm mt-2">Jitsi Meet se cargará aquí</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCallPage;