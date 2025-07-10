import { useState } from "react";
import { InputText } from 'primereact/inputtext';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { useRef } from 'react';
import { useAuth } from "../../hooks/useAuth";
import NavbarAuth from "../../components/NavbarAuth";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const toast = useRef<any>(null);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { success, message } = await resetPassword(email);
      
      if (success) {
        setEmailSent(true);
        toast.current.show({
          severity: 'success',
          summary: 'Correo enviado',
          detail: message,
          life: 5000
        });
      } else {
        toast.current.show({
          severity: 'error',
          summary: 'Error',
          detail: message,
          life: 3000
        });
      }
    } catch (error) {
      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Ha ocurrido un error inesperado',
        life: 3000
      });
    } finally {
      setLoading(false);
    }
  };

  const cardHeader = (
    <div className="text-center pt-4 pb-2">
      <h2 className="text-2xl font-bold text-light">Recuperar Contraseña</h2>
      <p className="text-light-gray mt-1">
        Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña
      </p>
    </div>
  );

  const cardFooter = (
    <div className="flex justify-center py-3">
      <p className="text-sm text-center text-light">
        <a href="/" className="text-primary hover:text-primary-hover font-medium">
          Volver a Iniciar Sesión
        </a>
      </p>
    </div>
  );

  return (
    <div className="auth-page min-h-screen flex flex-col bg-dark">
      <Toast ref={toast} />
      <NavbarAuth />
      
      <main className="flex-1 bg-gradient-to-br from-secondary to-dark-light flex items-center justify-center p-6">
        <Card 
          header={cardHeader} 
          footer={cardFooter}
          className="w-full max-w-md shadow-xl rounded-lg bg-dark-card border border-dark-border text-light"
        >
          <div className="p-4">
            {emailSent ? (
              <div className="text-center py-4">
                <div className="text-green-500 text-4xl mb-4">
                  <i className="pi pi-check-circle"></i>
                </div>
                <h3 className="text-xl font-medium mb-2">¡Correo enviado!</h3>
                <p className="text-light-gray mb-4">
                  Hemos enviado un correo a <span className="font-medium">{email}</span> con instrucciones para restablecer tu contraseña.
                </p>
                <p className="text-sm text-light-gray">
                  Si no encuentras el correo, revisa la carpeta de spam.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-light font-medium">Correo electrónico</label>
                  <InputText 
                    id="email" 
                    type="email" 
                    placeholder="U20XXXXXXX@upc.edu.pe" 
                    required 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-dark-light text-light border border-dark-border" 
                  />
                </div>
                
                <div className="pt-2">
                  <Button 
                    label={loading ? "Enviando..." : "Enviar Enlace"}
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-primary text-light hover:bg-primary-hover py-2" 
                    icon={loading ? "pi pi-spin pi-spinner" : ""}
                  />
                </div>
              </form>
            )}
          </div>
        </Card>
      </main>
    </div>
  );
}