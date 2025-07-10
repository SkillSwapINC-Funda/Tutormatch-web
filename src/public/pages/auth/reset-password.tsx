import { useState, useEffect } from 'react';
import { InputText } from 'primereact/inputtext';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import NavbarAuth from "../../components/NavbarAuth";
import { EyeIcon, EyeOffIcon, LockIcon } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const toast = useRef<any>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Initialize Supabase client
  const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY
  );

  useEffect(() => {
    // Check if the URL has the password reset hash
    const hashParams = new URLSearchParams(location.hash.replace('#', ''));
    const type = hashParams.get('type');
    
    // If the URL doesn't have the right parameters, redirect to login
    if (type !== 'recovery') {
      navigate('/login');
    }
  }, [location, navigate]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validate passwords
    if (password !== confirmPassword) {
      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Las contraseñas no coinciden',
        life: 3000
      });
      return;
    }
    
    if (password.length < 6) {
      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: 'La contraseña debe tener al menos 6 caracteres',
        life: 3000
      });
      return;
    }
    
    setLoading(true);
    
    try {
      // Use the current URL hash to update the password
      // Supabase automatically extracts the token from the URL hash
      const { error } = await supabase.auth.updateUser({
        password: password
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      toast.current.show({
        severity: 'success',
        summary: 'Contraseña actualizada',
        detail: 'Tu contraseña ha sido actualizada exitosamente',
        life: 3000
      });
      
      // Redirect to login after a short delay
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      
    } catch (error: any) {
      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: error.message || 'No se pudo actualizar la contraseña',
        life: 3000
      });
    } finally {
      setLoading(false);
    }
  };

  const cardHeader = (
    <div className="text-center pt-4 pb-2">
      <div className="flex justify-center mb-4">
        <LockIcon className="h-16 w-16 text-primary" />
      </div>
      <h2 className="text-2xl font-bold text-light">Restablecer contraseña</h2>
      <p className="text-light-gray mt-1">
        Crea una nueva contraseña para tu cuenta
      </p>
    </div>
  );

  const cardFooter = (
    <div className="flex justify-center py-3">
      <p className="text-sm text-center text-light">
        <a href="/login" className="text-primary hover:text-primary-hover font-medium">
          Volver al inicio de sesión
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
          className="w-full max-w-md shadow-xl bg-dark-card border border-dark-border text-light rounded-xl"
        >
          <div className="p-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="password" className="text-light">Nueva contraseña</label>
                <div className="relative">
                  <InputText
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-dark-light text-light border border-dark-border px-3 py-3 rounded-md"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-light-gray"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-light">Confirmar nueva contraseña</label>
                <div className="relative">
                  <InputText
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-dark-light text-light border border-dark-border px-3 py-3 rounded-md"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-light-gray"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  label={loading ? "Actualizando..." : "Restablecer contraseña"}
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary text-light hover:bg-primary-hover py-2"
                  icon={loading ? "pi pi-spin pi-spinner" : "pi pi-lock"}
                />
              </div>
            </form>
          </div>
        </Card>
      </main>
    </div>
  );
}