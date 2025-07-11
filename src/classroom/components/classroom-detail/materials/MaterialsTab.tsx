import React, { useState, useEffect } from 'react';
import { List, FileText, Download, Grid3X3, Plus, Trash2 } from 'lucide-react';
import MaterialService, { Material, UploadMaterialDto } from '../../../services/MaterialService';

interface MaterialsTabProps {
  tutoringId?: string;
  classroomId?: string;
  materials?: Material[];
  viewMode?: 'list' | 'grid';
  setViewMode?: (mode: 'list' | 'grid') => void;
  canUpload?: boolean; // Para determinar si el usuario puede subir materiales
}

const MaterialsTab: React.FC<MaterialsTabProps> = ({ 
  tutoringId,
  materials: propMaterials,
  viewMode: propViewMode,
  setViewMode: propSetViewMode,
  canUpload = false
}) => {
  const [materials, setMaterials] = useState<Material[]>(propMaterials || []);
  const [viewMode, setViewModeState] = useState(propViewMode || 'list');
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [filterType, setFilterType] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Usar props si están disponibles, sino manejar estado interno
  const currentViewMode = propViewMode || viewMode;
  const handleViewModeChange = propSetViewMode || setViewModeState;

  useEffect(() => {
    // Si no hay materiales como props, cargar desde API
    if (!propMaterials && tutoringId) {
      loadMaterials();
    }
  }, [tutoringId, propMaterials, filterType]);

  const loadMaterials = async () => {
    if (!tutoringId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Solo pasar el tipo de filtro si está seleccionado
      const options: any = {};
      if (filterType) {
        options.type = filterType;
      }
      
      const response = await MaterialService.getTutoringMaterials(tutoringId, options);
      setMaterials(response.materials);
    } catch (error) {
      console.error('Error loading materials:', error);
      setError(error instanceof Error ? error.message : 'Error al cargar materiales');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadMaterial = async (file: File, materialData: Omit<UploadMaterialDto, 'tutoringId'>) => {
    if (!tutoringId) return;
    
    setIsUploading(true);
    try {
      await MaterialService.uploadMaterial(file, {
        ...materialData,
        tutoringId
      });
      setShowUploadModal(false);
      await loadMaterials(); // Recargar materiales
    } catch (error) {
      console.error('Error uploading material:', error);
      setError(error instanceof Error ? error.message : 'Error al subir material');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = async (material: Material) => {
    try {
      const response = await MaterialService.downloadMaterial(material.id);
      window.open(response.downloadUrl, '_blank');
    } catch (error) {
      console.error('Error downloading material:', error);
      setError(error instanceof Error ? error.message : 'Error al descargar material');
    }
  };

  const handleDelete = async (material: Material) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar "${material.title}"?`)) {
      return;
    }
    
    try {
      await MaterialService.deleteMaterial(material.id);
      await loadMaterials(); // Recargar materiales
    } catch (error) {
      console.error('Error deleting material:', error);
      setError(error instanceof Error ? error.message : 'Error al eliminar material');
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
          <p className="text-light-gray">Recursos y documentos compartidos</p>
        </div>
        <div className="flex items-center space-x-2">
          {canUpload && (
            <button 
              onClick={() => setShowUploadModal(true)}
              className="flex items-center space-x-2 bg-primary text-light px-4 py-2 rounded hover:bg-primary-dark transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Subir Material</span>
            </button>
          )}
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

      {/* Filtros */}
      <div className="flex items-center space-x-4">
        <select 
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="bg-dark-card border border-dark-border text-light px-3 py-2 rounded"
        >
          <option value="">Todos los tipos</option>
          <option value="document">Documentos</option>
          <option value="image">Imágenes</option>
          <option value="video">Videos</option>
          <option value="audio">Audio</option>
          <option value="presentation">Presentaciones</option>
          <option value="other">Otros</option>
        </select>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-900/20 border border-red-500 text-red-400 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Materials Content */}
      {materials.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <FileText className="w-12 h-12 text-light-gray mx-auto mb-4" />
            <h3 className="text-lg font-medium text-light mb-2">No hay materiales disponibles</h3>
            <p className="text-light-gray">
              {canUpload 
                ? 'Sube el primer material para esta sesión.' 
                : 'Tu tutor aún no ha compartido materiales para esta sesión.'}
            </p>
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
                  <div className="text-2xl flex-shrink-0">
                    {MaterialService.getFileIcon(material.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-light font-medium truncate">{material.title}</h4>
                    <div className="flex items-center space-x-4 text-light-gray text-sm mt-1">
                      <span>{MaterialService.formatFileSize(material.size)}</span>
                      <span>📅 {new Date(material.created_at).toLocaleDateString()}</span>
                    </div>
                    {material.description && (
                      <p className="text-light-gray text-sm mt-1 truncate">{material.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2 flex-shrink-0">
                  <button 
                    onClick={() => handleDownload(material)}
                    className="flex items-center space-x-1 text-light-gray hover:text-light transition-colors p-1"
                    title="Descargar archivo"
                  >
                    <Download className="w-4 h-4" />
                    <span className="text-sm hidden sm:inline">Descargar</span>
                  </button>
                  {canUpload && (
                    <button 
                      onClick={() => handleDelete(material)}
                      className="flex items-center space-x-1 text-red-400 hover:text-red-300 transition-colors p-1"
                      title="Eliminar archivo"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="text-sm hidden sm:inline">Eliminar</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <UploadMaterialModal
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          onUpload={handleUploadMaterial}
          isUploading={isUploading}
        />
      )}
    </div>
  );
};

// Componente Modal para subir materiales
interface UploadMaterialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File, data: Omit<UploadMaterialDto, 'tutoringId'>) => void;
  isUploading: boolean;
}

const UploadMaterialModal: React.FC<UploadMaterialModalProps> = ({
  isOpen,
  onClose,
  onUpload,
  isUploading
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'document' | 'image' | 'video' | 'audio' | 'presentation' | 'other'>('document');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      if (!title) {
        setTitle(selectedFile.name.split('.')[0]);
      }
      setType(MaterialService.getFileType(selectedFile.name));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (file && title) {
      onUpload(file, { title, description, type });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-dark-card border border-dark-border rounded-lg p-6 w-full max-w-md">
        <h3 className="text-light text-lg font-semibold mb-4">Subir Material</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-light-gray text-sm font-medium mb-2">
              Archivo
            </label>
            <input
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.mp4,.mp3,.ppt,.pptx,.zip"
              className="w-full bg-dark-border border border-dark-border text-light px-3 py-2 rounded"
              required
            />
          </div>
          
          <div>
            <label className="block text-light-gray text-sm font-medium mb-2">
              Título
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-dark-border border border-dark-border text-light px-3 py-2 rounded"
              required
            />
          </div>
          
          <div>
            <label className="block text-light-gray text-sm font-medium mb-2">
              Descripción (opcional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full bg-dark-border border border-dark-border text-light px-3 py-2 rounded"
            />
          </div>
          
          <div>
            <label className="block text-light-gray text-sm font-medium mb-2">
              Tipo
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              className="w-full bg-dark-border border border-dark-border text-light px-3 py-2 rounded"
            >
              <option value="document">Documento</option>
              <option value="image">Imagen</option>
              <option value="video">Video</option>
              <option value="audio">Audio</option>
              <option value="presentation">Presentación</option>
              <option value="other">Otro</option>
            </select>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-light-gray hover:text-light transition-colors"
              disabled={isUploading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!file || !title || isUploading}
              className="bg-primary text-light px-4 py-2 rounded hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? 'Subiendo...' : 'Subir Material'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MaterialsTab;
