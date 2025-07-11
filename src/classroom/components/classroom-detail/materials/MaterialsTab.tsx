import React, { useState, useEffect } from 'react';
import { List, Eye, FileText, Download, Grid3X3 } from 'lucide-react';

interface Material {
  id: number;
  name: string;
  size: string;
  date: string;
  type: string;
  icon: string;
  url?: string;
}

interface MaterialsTabProps {
  tutoringId?: string;
  classroomId?: string;
  materials?: Material[];
  viewMode?: 'list' | 'grid';
  setViewMode?: (mode: 'list' | 'grid') => void;
}

const MaterialsTab: React.FC<MaterialsTabProps> = ({ 
  tutoringId,
  classroomId,
  materials: propMaterials,
  viewMode: propViewMode,
  setViewMode: propSetViewMode
}) => {
  const [materials, setMaterials] = useState<Material[]>(propMaterials || []);
  const [viewMode, setViewModeState] = useState(propViewMode || 'list');
  const [isLoading, setIsLoading] = useState(false);

  // Usar props si están disponibles, sino manejar estado interno
  const currentViewMode = propViewMode || viewMode;
  const handleViewModeChange = propSetViewMode || setViewModeState;

  useEffect(() => {
    // Si no hay materiales como props, cargar desde API
    if (!propMaterials && (tutoringId || classroomId)) {
      loadMaterials();
    }
  }, [tutoringId, classroomId, propMaterials]);

  const loadMaterials = async () => {
    setIsLoading(true);
    try {
      // TODO: Implementar carga de materiales desde API
      // Por ahora usar datos mock
      const mockMaterials: Material[] = [
        {
          id: 1,
          name: 'Guía de Algoritmos.pdf',
          size: '2.5 MB',
          date: '2024-01-15',
          type: 'pdf',
          icon: '📄',
          url: '#'
        },
        {
          id: 2,
          name: 'Ejercicios Prácticos.docx',
          size: '1.8 MB',
          date: '2024-01-14',
          type: 'document',
          icon: '📝',
          url: '#'
        },
        {
          id: 3,
          name: 'Video Tutorial.mp4',
          size: '45.2 MB',
          date: '2024-01-13',
          type: 'video',
          icon: '🎥',
          url: '#'
        }
      ];
      setMaterials(mockMaterials);
    } catch (error) {
      console.error('Error loading materials:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreview = (material: Material) => {
    if (material.url) {
      window.open(material.url, '_blank');
    }
  };

  const handleDownload = (material: Material) => {
    if (material.url) {
      const link = document.createElement('a');
      link.href = material.url;
      link.download = material.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-light-gray">Cargando materiales...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-light text-xl font-semibold mb-2">Materiales del Curso</h3>
          <p className="text-light-gray">Recursos y documentos compartidos por tu tutor</p>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => handleViewModeChange('list')}
            className={`p-2 rounded transition-colors ${
              currentViewMode === 'list' 
                ? 'bg-primary text-light' 
                : 'bg-dark-card text-light-gray hover:bg-dark-border'
            }`}
            title="Vista de lista"
          >
            <List className="w-4 h-4" />
          </button>
          <button 
            onClick={() => handleViewModeChange('grid')}
            className={`p-2 rounded transition-colors ${
              currentViewMode === 'grid' 
                ? 'bg-primary text-light' 
                : 'bg-dark-card text-light-gray hover:bg-dark-border'
            }`}
            title="Vista de cuadrícula"
          >
            <Grid3X3 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Materials Content */}
      {materials.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <FileText className="w-12 h-12 text-light-gray mx-auto mb-4" />
            <h3 className="text-lg font-medium text-light mb-2">No hay materiales disponibles</h3>
            <p className="text-light-gray">Tu tutor aún no ha compartido materiales para esta sesión.</p>
          </div>
        </div>
      ) : (
        <div className={`${
          currentViewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' 
            : 'space-y-3'
        }`}>
          {materials.map((material) => (
            <div 
              key={material.id} 
              className="bg-dark-card border border-dark-border rounded-lg p-4 hover:border-primary transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <div className="text-2xl flex-shrink-0">{material.icon}</div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-light font-medium truncate">{material.name}</h4>
                    <div className="flex items-center space-x-4 text-light-gray text-sm mt-1">
                      <span>{material.size}</span>
                      <span>📅 {material.date}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2 flex-shrink-0">
                  <button 
                    onClick={() => handlePreview(material)}
                    className="flex items-center space-x-1 text-light-gray hover:text-light transition-colors p-1"
                    title="Ver archivo"
                  >
                    <Eye className="w-4 h-4" />
                    <span className="text-sm hidden sm:inline">Ver</span>
                  </button>
                  <button 
                    onClick={() => handleDownload(material)}
                    className="flex items-center space-x-1 text-light-gray hover:text-light transition-colors p-1"
                    title="Descargar archivo"
                  >
                    <Download className="w-4 h-4" />
                    <span className="text-sm hidden sm:inline">Descargar</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MaterialsTab;
