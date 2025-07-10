import React from 'react';
import { List, Eye, ExternalLink } from 'lucide-react';

interface Material {
  id: number;
  name: string;
  size: string;
  date: string;
  type: string;
  icon: string;
}

interface MaterialsTabProps {
  materials: Material[];
  viewMode: string;
  setViewMode: (mode: string) => void;
}

const MaterialsTab: React.FC<MaterialsTabProps> = ({ materials, viewMode, setViewMode }) => (
  <div className="space-y-6">
    {/* Header */}
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-light text-xl font-semibold mb-2">Materiales del Curso</h3>
        <p className="text-light-gray">Recursos y documentos compartidos por tu tutor</p>
      </div>
      <div className="flex items-center space-x-2">
        <button 
          onClick={() => setViewMode('list')}
          className={`p-2 rounded ${viewMode === 'list' ? 'bg-primary text-light' : 'bg-dark-card text-light-gray'}`}
        >
          <List className="w-4 h-4" />
        </button>
        <button 
          onClick={() => setViewMode('grid')}
          className={`p-2 rounded ${viewMode === 'grid' ? 'bg-primary text-light' : 'bg-dark-card text-light-gray'}`}
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
        </button>
      </div>
    </div>
    {/* Materials List */}
    <div className="space-y-3">
      {materials.map((material) => (
        <div key={material.id} className="bg-dark-card border border-dark-border rounded-lg p-4 hover:border-primary transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-2xl">{material.icon}</div>
              <div className="flex-1">
                <h4 className="text-light font-medium">{material.name}</h4>
                <div className="flex items-center space-x-4 text-light-gray text-sm mt-1">
                  <span>{material.size}</span>
                  <span>📅 {material.date}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button className="flex items-center space-x-1 text-light-gray hover:text-light transition-colors">
                <Eye className="w-4 h-4" />
                <span className="text-sm">Ver</span>
              </button>
              <button className="flex items-center space-x-1 text-light-gray hover:text-light transition-colors">
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default MaterialsTab;
