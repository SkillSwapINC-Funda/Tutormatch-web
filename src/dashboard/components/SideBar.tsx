import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Code, 
  Layers, 
  Database, 
  Server, 
  Monitor, 
  Smartphone, 
  Globe, 
  CheckSquare,
  ChevronRight,
  HelpCircle,
  X,
  LogOut
} from 'lucide-react';
import { SemesterService } from '../services/SemesterService';
import { useAuth } from '../../public/hooks/useAuth';

// Iconos disponibles para asignar a los semestres
const iconOptions = [
  <Code />, 
  <Layers />, 
  <Database />, 
  <Server />, 
  <Monitor />, 
  <Smartphone />, 
  <Globe />, 
  <CheckSquare />
];

// Interfaz para semestres ya formateados
interface FormattedSemester {
  icon: React.ReactNode;
  semester: string;
  path: string;
}

interface SidebarProps {
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [loading, setLoading] = useState(true);
  const [semesters, setSemesters] = useState<FormattedSemester[]>([]);
  const location = useLocation();
  const sidebarRef = useRef<HTMLElement>(null);

  // Cargar semestres desde la API
  useEffect(() => {
    const loadSemesters = async () => {
      try {
        setLoading(true);
        const data = await SemesterService.getSemesters();
        
        if (Array.isArray(data)) {
          // Mapear los datos de la API al formato que espera el componente
          const formattedSemesters = data.map((sem, index) => {
            // Extraer el número del semestre del nombre, si existe
            const match = sem.name.match(/(\d+)/);
            const semNumber = match ? parseInt(match[1]) - 1 : index;
            
            // Seleccionar el icono adecuado, haciendo un ciclo si hay más semestres que iconos
            const iconIndex = semNumber % iconOptions.length;
            
            return {
              icon: iconOptions[iconIndex],
              semester: sem.name,
              path: `/semester/${sem.id}`
            };
          });
          
          // Ordenar por número de semestre si se puede extraer
          const sortedSemesters = formattedSemesters.sort((a, b) => {
            const numA = parseInt(a.semester.match(/\d+/)?.[0] || '0');
            const numB = parseInt(b.semester.match(/\d+/)?.[0] || '0');
            return numA - numB;
          });
          
          setSemesters(sortedSemesters);
        }
      } catch (error) {
        console.error('Error al cargar semestres:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSemesters();
  }, []);

  // Detectar si estamos en móvil o escritorio
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      
      // Si cambiamos a escritorio, cerrar el sidebar móvil
      if (!mobile) {
        setIsOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Cerrar el sidebar cuando cambia la ruta
  useEffect(() => {
    if (isMobile) {
      setIsOpen(false);
    }
  }, [location.pathname, isMobile]);

  // Cerrar el sidebar al hacer clic fuera de él (solo en móvil)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMobile && isOpen && sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobile, isOpen]);

  // Cerrar el sidebar al hacer clic en un enlace (solo en móvil)
  const handleLinkClick = () => {
    if (isMobile) {
      setIsOpen(false);
    }
  };

  const handleLogout = () => {
    // Aquí se manejaría el logout
    navigate('/login');
  };

  return (
    <>
      {/* Botón de flecha para móvil - visible solo en móvil */}
      {isMobile && !isOpen && (
        <button 
          aria-label="Abrir menú"
          className="md:hidden fixed top-20 left-0 z-50 bg-primary rounded-r-md p-2 py-4 text-white shadow-lg"
          onClick={() => setIsOpen(true)}
        >
          <ChevronRight size={24} />
        </button>
      )}
      
      {/* Overlay para cuando el sidebar está abierto en móvil */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar para móvil - estilo basado en la imagen proporcionada */}
      {isMobile && (
        <aside 
          ref={sidebarRef}
          className={`
            fixed left-0 top-0 h-full z-40 
            ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
            w-72 bg-[#2c2c2c] transition-transform duration-300 ease-in-out overflow-y-auto
          `}
        >
          {/* Cabecera del sidebar móvil */}
          <div className="flex items-center justify-between p-4 border-b border-[#3a3a3a]">
            <div className="flex items-center">
              <div className="h-8 w-8 flex items-center justify-center rounded">
                <img src="/assets/imgs/TutorMatch.webp" alt="Logo" className="h-6 w-6" />
              </div>
              <span className="ml-2 text-white font-semibold text-lg">TutorMatch</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white">
              <X size={24} />
            </button>
          </div>

          {/* Botón Añadir Tutoría */}
          {user?.role === 'tutor' && (
            <div className="px-4 mb-2">
              <button className="w-full bg-red-600 text-white py-3 rounded-md font-medium">
                Añadir Tutoría
              </button>
            </div>
          )}

          {/* Información del usuario */}
          {user && (
            <div className="p-4 border-b border-[#3a3a3a]">
              <div className="flex items-center">
                {user.avatar ? (
                  <img src={user.avatar} alt="Avatar" className="w-10 h-10 rounded-full mr-3" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center mr-3">
                    <span className="text-white font-medium">{user.firstName?.charAt(0) || 'U'}</span>
                  </div>
                )}
                <div>
                  <div className="text-white font-medium">
                    {user.firstName} {user.lastName}
                  </div>
                  <div className="text-gray-400 text-sm">
                    {user.email}
                  </div>
                </div>
              </div>

              <div className="mt-3 flex justify-between items-center">
                <div className="text-sm text-gray-400">
                  {user.role === 'tutor' ? 'Tutor' : 'Estudiante'} • {user.academicYear || '4º Semestre'}
                </div>
                <Link to="/profile" className="text-red-500 text-sm" onClick={handleLinkClick}>
                  Ver perfil completo
                </Link>
              </div>
            </div>
          )}

          {/* Listado de semestres */}
          <div className="p-4">
            <h3 className="text-white font-medium mb-3">Ingeniería de Software</h3>
            <nav className="space-y-1">
              {loading ? (
                <div className="flex justify-center p-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : semesters.length > 0 ? (
                semesters.map((item, index) => (
                  <Link
                    key={index}
                    to={item.path}
                    className="flex items-center p-2 rounded-md text-gray-300 hover:bg-[#3a3a3a] hover:text-white transition-colors"
                    onClick={handleLinkClick}
                  >
                    <div className="mr-3 text-red-500">{item.icon}</div>
                    <div className="font-medium">{item.semester}</div>
                  </Link>
                ))
              ) : (
                <div className="text-center py-2 text-gray-400">
                  No hay semestres disponibles
                </div>
              )}
            </nav>
          </div>

          {/* Footer con soporte y logout */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[#3a3a3a] bg-[#2c2c2c]">
            <div className="flex flex-col space-y-2">
              <Link
                to="/support"
                className="flex items-center p-2 rounded-md text-gray-300 hover:bg-[#3a3a3a] hover:text-white transition-colors"
                onClick={handleLinkClick}
              >
                <HelpCircle className="mr-3 text-red-500" size={18} />
                <span className="font-medium">Soporte / Ayuda</span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center p-2 rounded-md text-red-500 hover:bg-[#3a3a3a] transition-colors"
              >
                <LogOut className="mr-3" size={18} />
                <span className="font-medium">Cerrar sesión</span>
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* Sidebar para desktop - se mantiene igual */}
      {!isMobile && (
        <aside 
          className={`
            relative w-64 bg-dark-card border-r border-dark-border
            ${className || ''}
          `}
        >
          <div className="p-4 flex flex-col h-full">
            <h2 className="text-lg font-semibold text-white mb-4">Ingeniería de Software</h2>
            
            <nav className="space-y-2 flex-grow">
              {loading ? (
                <div className="flex justify-center p-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : semesters.length > 0 ? (
                semesters.map((item, index) => (
                  <Link
                    key={index}
                    to={item.path}
                    className="flex items-center p-3 rounded-md text-light-gray hover:bg-dark-light hover:text-white transition-colors"
                  >
                    <div className="mr-3 text-primary">{item.icon}</div>
                    <div>
                      <div className="font-medium">{item.semester} Semester</div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="text-center py-2 text-gray-400">
                  No hay semestres disponibles
                </div>
              )}
            </nav>
            
            <div className="mt-auto pt-4 border-t border-dark-border">
              <Link
                to="/support"
                className="flex items-center p-3 rounded-md text-light-gray hover:bg-dark-light hover:text-white transition-colors"
              >
                <div className="mr-3 text-primary">
                  <HelpCircle size={18} />
                </div>
                <div className="font-medium">Soporte / Ayuda</div>
              </Link>
            </div>
          </div>
        </aside>
      )}
    </>
  );
};

export default Sidebar;