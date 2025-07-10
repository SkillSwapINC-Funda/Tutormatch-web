import { useAuth } from '../hooks/useAuth';

export default function NavbarAuth() {
  const { user, signOut } = useAuth();

  return (
    <header className="bg-dark border-b border-dark-border">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center">
            <div className="h-8 w-8 flex items-center justify-center rounded">
              <img src="/assets/imgs/TutorMatch.webp" alt="Logo" className="h-6 w-6" />
            </div>
            <span className="ml-2 text-white font-semibold text-lg">TutorMatch</span>
        </div>


        <div>
          {user ? (
            <button
              onClick={async () => {
                const { success } = await signOut();
                if (success) {
                  window.location.href = '/';
                }
              }}
              className="text-sm px-4 py-2 rounded-md bg-dark-light text-light hover:bg-dark-lighter"
            >
              Cerrar Sesión
            </button>
          ) : (
            <div className="flex gap-2">
              <a
                href="/"
                className="text-sm px-4 py-2 rounded-md bg-dark-light text-light hover:bg-dark-lighter"
              >
                Iniciar Sesión
              </a>
              <a
                href="/register"
                className="text-sm px-4 py-2 rounded-md bg-primary text-light hover:bg-primary-hover"
              >
                Registrarse
              </a>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}