import axios from 'axios';

const API_URL = import.meta.env.VITE_TUTORMATCH_BACKEND_URL;

export const MembershipService = {
  /**
   * Sube un comprobante de pago al backend y retorna la URL
   * @param file Archivo de comprobante (imagen/pdf)
   * @returns URL del comprobante subido
   */
  uploadPaymentProof: async (file: File): Promise<string> => {
    const userId = localStorage.getItem('currentUserId');
    if (!userId) throw new Error('No se encontró el userId en localStorage');
    if (!file || file.size === 0) throw new Error('El archivo está vacío o no fue seleccionado');
    if (file.size > 5 * 1024 * 1024) throw new Error('El archivo es demasiado grande. Máximo 5MB.');
    if (!['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp', 'application/pdf'].includes(file.type)) {
      throw new Error('Tipo de archivo inválido. Solo se permiten imágenes o PDF.');
    }
    const fileExtension = file.name.split('.').pop() || 'jpg';
    const uniqueFileName = `paymentproof-${userId}-${Date.now()}.${fileExtension}`;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('user_id', userId);
    formData.append('file_name', uniqueFileName);
    // Subir comprobante
    await axios.post(
      `${API_URL}/storage/payment-proofs`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' }, timeout: 60000 }
    );
    // Obtener la URL del comprobante
    const urlResponse = await axios.get(
      `${API_URL}/storage/payment-proofs/${userId}/${uniqueFileName}`
    );
    if (urlResponse.data && urlResponse.data.url) {
      return urlResponse.data.url;
    }
    throw new Error('No se pudo obtener la URL del comprobante');
  },

  /**
   * Crea una membresía en el backend
   * @param type Tipo de membresía ('BASIC' | 'STANDARD' | 'PREMIUM')
   * @param paymentProofUrl URL del comprobante subido
   * @returns Objeto de membresía creada
   */
  createMembership: async (type: 'BASIC' | 'STANDARD' | 'PREMIUM', paymentProofUrl: string) => {
    const userId = localStorage.getItem('currentUserId');
    if (!userId) throw new Error('No se encontró el userId en localStorage');
    const body = {
      user_id: userId,
      type,
      status: 'pending',
      payment_proof: paymentProofUrl,
    };
    const response = await axios.post(`${API_URL}/memberships`, body);
    return response.data;
  },

  /**
   * Consulta la membresía activa del usuario actual
   */
  getMyMembership: async () => {
    const userId = localStorage.getItem('currentUserId');
    if (!userId) throw new Error('No se encontró el userId en localStorage');
    const response = await axios.get(`${API_URL}/memberships/user/${userId}`);
    return response.data;
  }
};
