import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { CheckCircle } from "lucide-react";
import NavbarAuth from '../../components/NavbarAuth';
import { useNavigate } from 'react-router-dom';

export default function RegisterSuccessPage() {
  const navigate = useNavigate();
  
  const goToLogin = () => {
    navigate('/login');
  };

  const cardHeader = (
    <div className="text-center py-4">
      <div className="flex justify-center mb-4">
        <CheckCircle className="h-16 w-16 text-green-500" />
      </div>
      <h2 className="text-2xl font-bold text-light">¡Registro Completado!</h2>
    </div>
  );

  const cardFooter = (
    <div className="flex justify-center py-4">
      <Button
        label="Iniciar Sesión"
        onClick={goToLogin}
        className="bg-primary text-light hover:bg-primary-hover"
      />
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-dark">
      <NavbarAuth />
      <main className="flex-1 bg-gradient-to-br from-secondary to-dark-light flex items-center justify-center p-6">
        <Card 
          header={cardHeader} 
          footer={cardFooter}
          className="w-full max-w-md shadow-xl bg-dark-card border border-dark-border text-light rounded-xl"
        >
          <div className="text-center p-4">
            <p className="mb-4 text-light-gray">
              ¡Felicidades! Tu cuenta ha sido verificada y activada correctamente. Ahora puedes iniciar sesión y comenzar a utilizar todos los servicios de la plataforma.
            </p>
            <p className="text-sm text-light-gray">
              Si tienes algún problema para iniciar sesión, ponte en contacto con soporte.
            </p>
          </div>
        </Card>
      </main>
    </div>
  );
}