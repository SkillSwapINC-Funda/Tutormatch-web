import { supabase } from "../../lib/supabase/client";
import { User } from "../../user/types/User";
import axios from 'axios';

const API_URL = import.meta.env.VITE_TUTORMATCH_BACKEND_URL;
export class AuthService {
    /**
     * Guarda el ID del usuario actual en el almacenamiento local
     */
    static setCurrentUser(userId: string): void {
        localStorage.setItem('currentUserId', userId);
    }

    /**
     * Guarda el rol del usuario actual en el almacenamiento local
     */
    static setCurrentUserRole(role: string): void {
        localStorage.setItem('currentUserRole', role);
    }

    /**
     * Obtiene el rol del usuario actual desde el almacenamiento local
     */
    static getCurrentUserRole(): string | null {
        return localStorage.getItem('currentUserRole');
    }
  
    /**
     * Obtiene el ID del usuario actual desde el almacenamiento local
     */
    static getCurrentUserId(): string | null {
        return localStorage.getItem('currentUserId');
    }
  
    /**
     * Elimina el ID del usuario actual del almacenamiento local
     */
    static clearCurrentUser(): void {
        localStorage.removeItem('currentUserId');
        localStorage.removeItem('pendingRegistration');
        localStorage.removeItem('auth_token');
    }
  
    /**
     * Obtiene el perfil completo del usuario actual
     */
    static async getCurrentUserProfile(): Promise<User | null> {
        const userId = this.getCurrentUserId();
        if (!userId) return null;
        
        try {
            // Primero intentamos obtener el perfil desde la API
            const token = localStorage.getItem('auth_token');
            if (token) {
                try {
                    const response = await axios.get(`${API_URL}/profiles`, {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    });
                    
                    if (response.data) {
                        return new User({
                            id: response.data.id,
                            email: response.data.email,
                            firstName: response.data.firstName,
                            lastName: response.data.lastName,
                            role: response.data.role,
                            avatar: response.data.avatar,
                            status: response.data.status,
                            semesterNumber: response.data.semesterNumber,
                            academicYear: response.data.academicYear,
                            bio: response.data.bio,
                            tutorId: response.data.tutorId,
                            phone: response.data.phone,
                            createdAt: new Date(response.data.createdAt),
                            updatedAt: new Date(response.data.updatedAt)
                        });
                    }
                } catch (error) {
                    console.error('Error al obtener perfil desde API:', error);
                    // Si falla, caemos back al método de Supabase
                }
            }
            
            // Si no hay token o falló la petición, usamos Supabase como fallback
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();
                
            if (error || !data) return null;
            
            return new User({
                id: data.id,
                email: data.email,
                firstName: data.first_name,
                lastName: data.last_name,
                role: data.role,
                avatar: data.avatar,
                status: data.status,
                semesterNumber: data.semester_number,
                academicYear: data.academic_year,
                bio: data.bio,
                tutorId: data.tutor_id,
                phone: data.phone,
                createdAt: new Date(data.created_at),
                updatedAt: new Date(data.updated_at)
            });
        } catch (error) {
            console.error('Error al obtener el perfil del usuario:', error);
            return null;
        }
    }
  
    /**
     * Actualiza el perfil del usuario
     */
    static async updateProfile(userId: string, profileData: Partial<User>): Promise<{success: boolean, message: string}> {
        try {
            const token = localStorage.getItem('auth_token');
            if (token) {
                try {
                    // Intentar actualizar usando la API
                    await axios.put(`${API_URL}/profile`, profileData, {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    });
                    
                    return {
                        success: true,
                        message: 'Perfil actualizado correctamente'
                    };
                } catch (error: any) {
                    if (error.response?.status === 401) {
                        localStorage.removeItem('auth_token');
                    }
                    throw error;
                }
            }
            
            const dbProfileData = {
                first_name: profileData.firstName,
                last_name: profileData.lastName,
                avatar: profileData.avatar,
                semester_number: profileData.semesterNumber,
                academic_year: profileData.academicYear,
                bio: profileData.bio,
                phone: profileData.phone,
                tutor_id: profileData.tutorId,
                updated_at: new Date().toISOString()
            };
            
            const { error } = await supabase
                .from('profiles')
                .update(dbProfileData)
                .eq('id', userId);
                
            if (error) {
                return {
                    success: false,
                    message: error.message || 'Error al actualizar el perfil'
                };
            }
            
            return {
                success: true,
                message: 'Perfil actualizado correctamente'
            };
        } catch (error: any) {
            return {
                success: false,
                message: error.message || 'Error inesperado al actualizar el perfil'
            };
        }
    }

    /**
     * Comprueba si un correo electrónico ha sido verificado
     */
    static async isEmailVerified(email: string): Promise<boolean> {
        try {
            const { data, error } = await supabase.auth.admin.listUsers();
            
            if (error || !data) return false;
            
            const user = data.users.find(u => u.email === email);
            return !!user && user.email_confirmed_at !== null;
        } catch (error) {
            console.error('Error al verificar estado del correo:', error);
            return false;
        }
    }

    /**
     * Obtiene el token JWT almacenado
     */
    static getAuthToken(): string | null {
        return localStorage.getItem('auth_token');
    }

        // Añadir este nuevo método para verificar si hay una sesión activa
    /**
     * Verifica si hay una sesión activa comprobando token y userId
     */
    static setUserSession(userId: string, token: string): void {
        localStorage.setItem('currentUserId', userId);
        localStorage.setItem('auth_token', token);
      }
      
      /**
       * Verifica si hay una sesión activa comprobando token y userId
       */
      static hasActiveSession(): boolean {
        const token = localStorage.getItem('auth_token');
        const userId = localStorage.getItem('currentUserId');
        return !!(token && userId);
      }
}