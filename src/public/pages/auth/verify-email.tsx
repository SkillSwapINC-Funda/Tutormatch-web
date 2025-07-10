import { useState, useEffect } from "react";
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { MailIcon, CheckCircle } from "lucide-react";
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from "../../../lib/supabase/client";
import NavbarAuth from "../../components/NavbarAuth";
import { Toast } from 'primereact/toast';
import { useRef } from 'react';
import { useAuth } from "../../hooks/useAuth";
import axios from 'axios';

const API_URL = import.meta.env.VITE_TUTORMATCH_BACKEND_URL;
interface PendingRegistration {
  email: string;
  userData: {
    password: string;
    firstName: string;
    lastName: string;
    role: string;
    gender: string;
    semesterNumber: number;
    academicYear: string;
    bio: string;
    phone: string;
    status: string;
    avatar: string;
    [key: string]: any;
  };
}

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [registering, setRegistering] = useState(true);
  const toast = useRef<any>(null);
  const { signUp, verifyEmail } = useAuth();
  
  useEffect(() => {
    const emailParam = searchParams.get('email');
    const verifiedParam = searchParams.get('verified');
    
    // Verificar también si venimos del flujo de autenticación de Supabase
    // A veces Supabase agrega sus propios parámetros como 'type=signup'
    const hasAuthFlow = searchParams.has('type');
    const hasToken = searchParams.has('token'); // Para nuevo flujo de API
    
    // Si encontramos parámetros de autenticación, probablemente viene de confirmación
    if (emailParam) {
      setEmail(emailParam);
      
      // Si el parámetro verified es 'true' o venimos del flujo de autenticación o tenemos token
      if (verifiedParam === 'true' || hasAuthFlow || hasToken) {
        // Almacenar esta información para no perderla en recargas
        localStorage.setItem('email_verified', emailParam);
        
        setIsVerified(true);
        toast.current.show({
          severity: 'success',
          summary: 'Correo verificado',
          detail: '¡Tu correo electrónico ha sido verificado con éxito!',
          life: 3000
        });
        
        // Ya no estamos en proceso de registro
        setRegistering(false);
        setRegistrationComplete(true);
        
        // Si tenemos token de confirmación, lo procesamos
        if (hasToken) {
          processVerificationToken(searchParams.get('token') || '');
        }
      } else {
        // Verificar si este correo ya fue verificado anteriormente
        const verifiedEmail = localStorage.getItem('email_verified');
        if (verifiedEmail === emailParam) {
          setIsVerified(true);
          setRegistering(false);
          setRegistrationComplete(true);
        } else {
          // Continuar con el flujo normal de registro pendiente
          const pendingRegistrationStr = localStorage.getItem('pendingRegistration');
          if (pendingRegistrationStr) {
            try {
              const pendingRegistration = JSON.parse(pendingRegistrationStr);
              if (pendingRegistration.email === emailParam && !registrationComplete) {
                completeRegistration(pendingRegistration);
              }
            } catch (error) {
              console.error("Error al procesar el registro pendiente:", error);
              setRegistering(false);
            }
          } else {
            setRegistering(false);
          }
        }
      }
    } else {
      setRegistering(false);
    }
  }, [searchParams]);

  const processVerificationToken = async (token: string) => {
    try {
      // Realizar petición a la API para confirmar el token
      await axios.post(`${API_URL}/auth/verify-email`, { token });
      
      // Opcionalmente, podemos hacer algo adicional aquí después de la verificación exitosa
    } catch (error) {
      console.error("Error al procesar el token de verificación:", error);
      // No mostramos error al usuario ya que ya hemos marcado el correo como verificado
    }
  };

  const completeRegistration = async (pendingRegistration: PendingRegistration) => {
    setLoading(true);
    
    try {
      const { email, userData } = pendingRegistration;
    
      if (!userData.password) {
        throw new Error('Falta la contraseña en los datos de registro');
      }
      
      const { success, message } = await signUp(email, userData.password, userData);
      
      if (success) {
        setRegistrationComplete(true);
        localStorage.removeItem('pendingRegistration');
        
        toast.current.show({
          severity: 'success',
          summary: 'Registro enviado',
          detail: 'Se ha enviado un correo de verificación a tu dirección de correo.',
          life: 3000
        });
      } else {
        toast.current.show({
          severity: 'error',
          summary: 'Error de registro',
          detail: message,
          life: 3000
        });
        setTimeout(() => navigate('/register'), 3000);
      }
    } catch (error: any) {
      toast.current.show({
        severity: 'error',
        summary: 'Error de registro',
        detail: error.message || 'Ha ocurrido un error al completar el registro.',
        life: 3000
      });
    } finally {
      setLoading(false);
      setRegistering(false);
    }
  };
  
  const handleVerificationComplete = async () => {
    if (!email) {
      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo determinar el correo a verificar',
        life: 3000
      });
      return;
    }
  
    setChecking(true);
    
    try {
      // Verificar primero si el correo ya está marcado como verificado en localStorage
      const verifiedEmail = localStorage.getItem('email_verified');
      if (verifiedEmail === email) {
        toast.current.show({
          severity: 'success',
          summary: 'Verificación exitosa',
          detail: 'Tu correo electrónico ya está verificado. Redirigiendo...',
          life: 2000
        });
        
        setTimeout(() => {
          navigate('/register/success');
        }, 2000);
        return;
      }
  
      // Usamos la función de verificación de email de useAuth
      const { success, message, isVerified } = await verifyEmail(email);
      
      if (success && isVerified) {
        localStorage.setItem('email_verified', email);
        
        toast.current.show({
          severity: 'success',
          summary: 'Verificación exitosa',
          detail: 'Tu correo electrónico ha sido verificado. Redirigiendo...',
          life: 2000
        });
        
        setTimeout(() => {
          navigate('/register/success');
        }, 2000);
      } else if (success && !isVerified) {
        toast.current.show({
          severity: 'warn',
          summary: 'Correo no verificado',
          detail: 'Por favor, verifica tu correo antes de continuar.',
          life: 3000
        });
      } else {
        toast.current.show({
          severity: 'error',
          summary: 'Error',
          detail: message || 'Error al verificar el correo',
          life: 3000
        });
      }
    } catch (error: any) {
      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: error.message || 'Error al verificar el correo',
        life: 3000
      });
    } finally {
      setChecking(false);
    }
  };
  
  // Función para reenviar correo de verificación
  const resendVerificationEmail = async () => {
    if (!email) {
      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo determinar el correo para reenviar la verificación',
        life: 3000
      });
      return;
    }

    setLoading(true);
    
    try {
      // Intentamos usar la API primero para reenviar el correo
      try {
        await axios.post(`${API_URL}/auth/resend-verification`, { 
          email,
          redirectUrl: `${window.location.origin}/verify-email?email=${encodeURIComponent(email)}&verified=true`
        });
        
        toast.current.show({
          severity: 'success',
          summary: 'Correo enviado',
          detail: 'Se ha reenviado el correo de verificación',
          life: 3000
        });
        return;
      } catch (apiError) {
        console.error("Error al reenviar desde API, usando Supabase como fallback:", apiError);
      }
      
      // Fallback a Supabase si la API falla
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/verify-email?email=${encodeURIComponent(email)}&verified=true`
        }
      });
      
      if (error) {
        throw error;
      }
      
      toast.current.show({
        severity: 'success',
        summary: 'Correo enviado',
        detail: 'Se ha reenviado el correo de verificación',
        life: 3000
      });
    } catch (error: any) {
      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: error.message || 'Error al reenviar correo de verificación',
        life: 3000
      });
    } finally {
      setLoading(false);
    }
  };

  const cardHeader = (
    <div className="text-center py-4">
      <div className="flex justify-center mb-4">
        {isVerified ? (
          <CheckCircle className="h-16 w-16 text-green-500" />
        ) : (
          <MailIcon className="h-16 w-16 text-primary" />
        )}
      </div>
      <h2 className="text-2xl font-bold text-light">
        {isVerified ? "¡Correo Verificado!" : "Verifica tu correo"}
      </h2>
    </div>
  );

  const cardFooter = (
    <div className="flex flex-col space-y-3 items-center py-4">
      {isVerified ? (
        <Button
          label="Ir a la página de éxito"
          onClick={() => navigate('/register/success')}
          className="bg-primary text-light hover:bg-primary-hover w-full"
          icon="pi pi-check-circle"
        />
      ) : (
        <>
          <Button
            label={checking ? "Verificando..." : "He verificado mi correo"}
            onClick={handleVerificationComplete}
            className="bg-primary text-light hover:bg-primary-hover w-full"
            disabled={checking || loading || registering}
            icon={checking ? "pi pi-spin pi-spinner" : "pi pi-check"}
          />
          <Button
            label={loading ? "Enviando..." : "Reenviar correo de verificación"}
            onClick={resendVerificationEmail}
            className="bg-dark-light text-light hover:bg-dark border border-dark-border w-full"
            disabled={checking || loading || registering}
            icon={loading ? "pi pi-spin pi-spinner" : "pi pi-envelope"}
          />
        </>
      )}
      <Button
        label="Volver al inicio"
        onClick={() => navigate('/')}
        className="bg-transparent text-light hover:bg-dark-light w-full"
        disabled={checking || loading}
      />
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-dark">
      <Toast ref={toast} />
      <NavbarAuth />
      <main className="flex-1 bg-gradient-to-br from-secondary to-dark-light flex items-center justify-center p-6">
        <Card 
          header={cardHeader} 
          footer={cardFooter}
          className="w-full max-w-md shadow-xl bg-dark-card border border-dark-border text-light rounded-xl"
        >
          <div className="text-center p-4">
            {registering ? (
              <div className="flex flex-col items-center justify-center py-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                <p className="text-light">Completando el registro...</p>
              </div>
            ) : (
              <>
                {isVerified ? (
                  <p className="mb-4 text-green-400">
                    ¡Tu correo electrónico <span className="font-bold">{email}</span> ha sido verificado correctamente! Puedes continuar para acceder a la plataforma.
                  </p>
                ) : (
                  <>
                    <p className="mb-4 text-light-gray">
                      {registrationComplete ? 'Hemos enviado un correo de verificación a:' : 'Se enviará un correo de verificación a:'}
                      <span className="block font-bold mt-2 text-light">
                        {email || "tu dirección de correo"}
                      </span>
                    </p>
                    <p className="mb-4 text-light-gray">
                      Por favor, revisa tu bandeja de entrada y haz clic en el enlace de verificación para activar tu cuenta.
                    </p>
                    <p className="text-sm text-light-gray">
                      Si no encuentras el correo, revisa tu carpeta de spam o solicita un nuevo correo de verificación.
                    </p>
                  </>
                )}
              </>
            )}
          </div>
        </Card>
      </main>
    </div>
  );
}