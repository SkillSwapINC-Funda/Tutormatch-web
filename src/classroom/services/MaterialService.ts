const API_BASE_URL = import.meta.env.VITE_TUTORMATCH_MICROSERVICES;

export interface Material {
  id: string;
  title: string;
  description?: string;
  type: 'document' | 'image' | 'video' | 'audio' | 'presentation' | 'other';
  url: string;
  size: number;
  created_at: string;
  updated_at: string;
  uploaded_by: string;
  tutoring_id: string;
}

export interface MaterialsResponse {
  materials: Material[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

export interface UploadMaterialDto {
  title: string;
  description?: string;
  tutoringId: string;
  type: 'document' | 'image' | 'video' | 'audio' | 'presentation' | 'other';
}

export interface UpdateMaterialDto {
  title?: string;
  description?: string;
}

class MaterialService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('auth_token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  private getAuthHeadersForUpload(): HeadersInit {
    const token = localStorage.getItem('auth_token');
    return {
      'Authorization': `Bearer ${token}`
    };
  }

  /**
   * Subir un material a una sesión de tutoría
   */
  async uploadMaterial(
    file: File, 
    materialData: UploadMaterialDto
  ): Promise<Material> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', materialData.title);
    if (materialData.description) {
      formData.append('description', materialData.description);
    }
    formData.append('tutoringId', materialData.tutoringId);
    formData.append('type', materialData.type);

    const response = await fetch(`${API_BASE_URL}/api/classroom/materials/upload`, {
      method: 'POST',
      headers: this.getAuthHeadersForUpload(),
      body: formData
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al subir material');
    }

    return response.json();
  }

  /**
   * Obtener materiales de una sesión de tutoría
   */
  async getTutoringMaterials(
    tutoringId: string,
    options?: {
      type?: string;
      page?: number;
      limit?: number;
    }
  ): Promise<MaterialsResponse> {
    const params = new URLSearchParams();
    
    // Solo agregar parámetros si están definidos y son válidos
    if (options?.type) {
      params.append('type', options.type);
    }
    
    // No enviar parámetros de paginación por defecto para evitar el error 400
    // El backend manejará valores por defecto internamente
    if (options?.page && options.page > 1) {
      params.append('page', options.page.toString());
    }
    
    if (options?.limit && options.limit !== 50) {
      params.append('limit', options.limit.toString());
    }

    const queryString = params.toString();
    const url = `${API_BASE_URL}/api/classroom/materials/tutoring/${tutoringId}${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al cargar materiales');
    }

    return response.json();
  }

  /**
   * Generar URL de descarga para un material
   */
  async downloadMaterial(materialId: string): Promise<{ downloadUrl: string; material: Partial<Material> }> {
    const response = await fetch(`${API_BASE_URL}/api/classroom/materials/${materialId}/download`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al generar URL de descarga');
    }

    return response.json();
  }

  /**
   * Actualizar información de un material
   */
  async updateMaterial(
    materialId: string, 
    updateData: UpdateMaterialDto
  ): Promise<Material> {
    const response = await fetch(`${API_BASE_URL}/api/classroom/materials/${materialId}`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(updateData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al actualizar material');
    }

    return response.json();
  }

  /**
   * Eliminar un material
   */
  async deleteMaterial(materialId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/classroom/materials/${materialId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al eliminar material');
    }
  }

  /**
   * Formatear tamaño de archivo
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Obtener icono según el tipo de archivo
   */
  getFileIcon(type: string): string {
    const icons: Record<string, string> = {
      document: '📄',
      image: '🖼️',
      video: '🎥',
      audio: '🎵',
      presentation: '📊',
      other: '📁'
    };
    return icons[type] || '📁';
  }

  /**
   * Determinar tipo de archivo basado en la extensión
   */
  getFileType(fileName: string): 'document' | 'image' | 'video' | 'audio' | 'presentation' | 'other' {
    const extension = fileName.split('.').pop()?.toLowerCase() || '';
    
    const typeMap: Record<string, 'document' | 'image' | 'video' | 'audio' | 'presentation' | 'other'> = {
      // Documentos
      pdf: 'document',
      doc: 'document',
      docx: 'document',
      txt: 'document',
      rtf: 'document',
      odt: 'document',
      
      // Imágenes
      jpg: 'image',
      jpeg: 'image',
      png: 'image',
      gif: 'image',
      bmp: 'image',
      webp: 'image',
      svg: 'image',
      
      // Videos
      mp4: 'video',
      avi: 'video',
      mov: 'video',
      wmv: 'video',
      flv: 'video',
      webm: 'video',
      mkv: 'video',
      
      // Audio
      mp3: 'audio',
      wav: 'audio',
      ogg: 'audio',
      aac: 'audio',
      flac: 'audio',
      m4a: 'audio',
      
      // Presentaciones
      ppt: 'presentation',
      pptx: 'presentation',
      odp: 'presentation'
    };
    
    return typeMap[extension] || 'other';
  }
}

export default new MaterialService();