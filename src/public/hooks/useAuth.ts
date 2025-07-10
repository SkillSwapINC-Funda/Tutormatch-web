import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase/client';
import { User, UserRole, UserStatus} from '../../user/types/User';
import { Session } from '@supabase/supabase-js';
import { AuthService } from '../services/authService';
import axios from 'axios';

const API_URL = import.meta.env.VITE_TUTORMATCH_BACKEND_URL;

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(localStorage.getItem('auth_token'));

  // Configurar axios para incluir el token en las solicitudes
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  useEffect(() => {
    // Mantener la escucha de cambios de autenticación con Supabase para mantener compatibilidad
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_, currentSession) => {
        if (currentSession) {
          setSession(currentSession);
          // Almacenamos el token para futuras solicitudes
          localStorage.setItem('auth_token', currentSession.access_token);
          setToken(currentSession.access_token);
          fetchUserProfile(currentSession.user.id);
        } else {
          setSession(null);
          setUser(null);
          localStorage.removeItem('auth_token');
          setToken(null);
        }
        setLoading(false);
      }
    );

    // En el useEffect de verificación de sesión
    const checkCurrentSession = async () => {
      // Si tenemos un token guardado, validamos la sesión
      if (token) {
        try {
          const { data: { session: currentSession } } = await supabase.auth.getSession();
          if (currentSession && currentSession.user) {
            setSession(currentSession);
            
            // Asegurarse de que el ID del usuario esté guardado en localStorage
            if (currentSession.user.id) {
              AuthService.setCurrentUser(currentSession.user.id);
            }
            
            fetchUserProfile(currentSession.user.id);
          } else {
            // Si no hay sesión válida, limpiamos el token y el ID
            localStorage.removeItem('auth_token');
            AuthService.clearCurrentUser();
            setToken(null);
            setUser(null);
          }
        } catch (error) {
          console.error('Error al verificar sesión:', error);
          localStorage.removeItem('auth_token');
          AuthService.clearCurrentUser();
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    checkCurrentSession();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error al obtener el perfil:', error);
        return;
      }

      if (data) {
        
        const userProfile = new User({
          id: userId,
          email: data.email,
          firstName: data.first_name,
          lastName: data.last_name,
          role: data.role as UserRole,
          avatar: data.avatar,
          status: data.status as UserStatus,
          semesterNumber: data.semester_number,
          academicYear: data.academic_year || '',
          bio: data.bio || '',
          phone: data.phone,
          tutorId: data.tutor_id || '',
          createdAt: new Date(data.created_at),
          updatedAt: new Date(data.updated_at),
        });

        setUser(userProfile);
        AuthService.setCurrentUser(userId);
      }
    } catch (error) {
      
    }
  };

  const signIn = async (email: string, password: string): Promise<{success: boolean, message: string}> => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password
      });

      if (response.data && response.data.session) {
        // Guardar el token JWT
        const token = response.data.session.access_token;
        localStorage.setItem('auth_token', token);
        setToken(token);

        // Guardar el ID del usuario en localStorage
        let userId = null;
        if (response.data.user && response.data.user.id) {
          userId = response.data.user.id;
          AuthService.setCurrentUser(userId);
        }

        // Actualizar la sesión de Supabase para mantener compatibilidad
        await supabase.auth.setSession({
          access_token: token,
          refresh_token: response.data.session.refresh_token
        });

        // Obtener el perfil del usuario desde la tabla profiles para obtener el rol correcto
        if (userId) {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', userId)
            .single();
          if (!error && profile && profile.role) {
            AuthService.setCurrentUserRole(profile.role);
          }
          fetchUserProfile(userId);
        }

        return {
          success: true,
          message: 'Inicio de sesión exitoso'
        };
      }

      return {
        success: false,
        message: 'Error al iniciar sesión. Respuesta inválida del servidor.'
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Error inesperado al iniciar sesión'
      };
    }
  };

  const signUp = async (email: string, password: string, userData: any): Promise<{success: boolean, message: string}> => {
    try {
      const registerData = {
        email,
        password,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone,
        gender: userData.gender,
        semesterNumber: Number(userData.semesterNumber),
        role: userData.role
      };

      console.log('Enviando datos de registro (ajustados):', JSON.stringify(registerData));

      try {
        const response = await axios.post(`${API_URL}/auth/register`, registerData);

        if (response.data) {
          let userId = null;
          if (response.data.user && response.data.session) {
            const token = response.data.session.access_token;
            localStorage.setItem('auth_token', token);
            setToken(token);

            if (response.data.user.id) {
              userId = response.data.user.id;
              AuthService.setCurrentUser(userId);
            }
          }
          // Guardar el rol del usuario desde la tabla profiles
          if (userId) {
            // Esperar a que el perfil esté creado (puede requerir un pequeño delay o reintento en producción)
            const { data: profile, error } = await supabase
              .from('profiles')
              .select('role')
              .eq('id', userId)
              .single();
            if (!error && profile && profile.role) {
              AuthService.setCurrentUserRole(profile.role);
            }
          }
          return {
            success: true,
            message: 'Registro exitoso. Por favor verifica tu correo electrónico.'
          };
        }

        return {
          success: true,
          message: 'Registro enviado correctamente. Por favor verifica tu correo electrónico.'
        };
      } catch (apiError: any) {
        console.log('Respuesta de error completa:', apiError.response);
        throw apiError;
      }
    } catch (error: any) {
      console.error('Error detallado:', error.response?.data);

      if (error.response?.status === 400) {
        const errorMessage = error.response.data.message;
        if (Array.isArray(errorMessage)) {
          return {
            success: false,
            message: errorMessage.join('. ')
          };
        }
        return {
          success: false,
          message: errorMessage || 'Datos de registro inválidos'
        };
      }

      return {
        success: false,
        message: error.response?.data?.message || 'Error inesperado al registrar usuario'
      };
    }
  };

  // Usar el endpoint API de logout en lugar de Supabase directamente
    const signOut = async (): Promise<{success: boolean, message: string}> => {
    try {
      if (!token) {
        return {
          success: false,
          message: 'No hay sesión activa'
        };
      }
  
      try {
        // Intentar llamar al endpoint de logout del backend
        await axios.post(`${API_URL}/auth/logout`);
      } catch (logoutError) {
        // Si falla el endpoint de logout, continuamos con el proceso de cierre de sesión local
        console.warn('Error al comunicarse con el endpoint de logout:', logoutError);
      }

      await supabase.auth.signOut();
      localStorage.clear();
      setToken(null);
      setUser(null);
      setSession(null);
      
      return {
        success: true,
        message: 'Sesión cerrada exitosamente'
      };
    } catch (error: any) {
      console.error('Error durante el cierre de sesión:', error);
      
      try {
        localStorage.clear();
        setToken(null);
        setUser(null);
        setSession(null);
      } catch (clearError) {
        console.error('Error al limpiar localStorage:', clearError);
      }
      
      return {
        success: true,
        message: 'Se ha cerrado la sesión localmente'
      };
    }
  };

  const verifyEmail = async (email: string): Promise<{success: boolean, message: string, isVerified: boolean}> => {
    try {
      const { error } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .single();

      if (error) {
        return {
          success: false,
          isVerified: false,
          message: 'No se pudo verificar el estado del correo electrónico'
        };
      }

      const { data: authData } = await supabase.auth.admin.listUsers();
      const user = authData.users.find(u => u.email === email);

      if (!user) {
        return {
          success: false,
          isVerified: false,
          message: 'Usuario no encontrado'
        };
      }

      return {
        success: true,
        isVerified: user.email_confirmed_at !== null,
        message: user.email_confirmed_at !== null ? 
          'Correo electrónico verificado' : 
          'Correo electrónico aún no verificado'
      };
    } catch (error: any) {
      return {
        success: false,
        isVerified: false,
        message: error.message || 'Error al verificar el correo electrónico'
      };
    }
  };

  const resetPassword = async (email: string): Promise<{success: boolean, message: string}> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) {
        return {
          success: false,
          message: error.message || 'Error al solicitar cambio de contraseña'
        };
      }
      
      return {
        success: true,
        message: 'Se ha enviado un correo para restablecer la contraseña'
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Error inesperado al solicitar cambio de contraseña'
      };
    }
  };

  return {
    user,
    session,
    loading,
    token,
    signIn,
    signUp,
    signOut,
    verifyEmail,
    resetPassword
  };
}