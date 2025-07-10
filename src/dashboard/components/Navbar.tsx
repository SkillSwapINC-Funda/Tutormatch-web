import { useRef, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Globe, ChevronDown, Loader, Menu, X } from 'lucide-react';
import CreateTutoringModal from './CreateTutoringModal';
import { User as UserType } from '../../user/types/User';
import { UserService } from '../../user/services/UserService';
import { AuthService } from '../../public/services/authService';
import { useAuth } from '../../public/hooks/useAuth';
import LogoutModal from '../../user/components/LogOutProfileModal';

const Navbar = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isLogOutModalVisible, setLogOutModalVisible] = useState(false);
  const [logoutAccount, setLogoutAccount] = useState(false);
  const dropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const navigate = useNavigate();
  const toast = useRef<any>(null);

  const { signOut, user: authUser } = useAuth();

  // Obtener los datos del usuario actual
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        setLoading(true);

        // Primero intentamos obtener el usuario del hook useAuth
        if (authUser) {
          setCurrentUser(authUser);
          setError(null);
          setLoading(false);
          return;
        }

        // Verificar si hay una sesión activa
        if (!AuthService.hasActiveSession()) {
          setError('Sesión no encontrada');
          setLoading(false);
          return;
        }

        // Obtener el ID del usuario actual
        const currentUserId = AuthService.getCurrentUserId();

        // Obtener el perfil completo desde AuthService
        const userProfile = await AuthService.getCurrentUserProfile();
        if (userProfile) {
          setCurrentUser(userProfile);
          setError(null);
        } else {
          // Como último recurso, intentar obtener desde el UserService
          try {
            const userData = await UserService.getUserById(currentUserId!);
            setCurrentUser(userData);
            setError(null);
          } catch (serviceError) {
            console.error('Error al obtener usuario desde UserService:', serviceError);
            setError('Error al cargar los datos del usuario');
          }
        }
      } catch (err) {
        console.error('Error al cargar los datos del usuario:', err);
        setError('Error al cargar los datos del usuario');
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, [authUser]);

  const handleOpenModal = () => {
    setModalVisible(true);
    setMobileMenuOpen(false);
  };

  const handleHideModal = () => {
    setModalVisible(false);
  };


  const handleSaveTutoring = (tutoring: any) => {
    console.log('Tutoring saved:', tutoring);
    // Aquí irían las llamadas a la API para guardar la tutoría
    setModalVisible(false);
  };

  const toggleProfileDropdown = () => {
    setProfileDropdownOpen(!profileDropdownOpen);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleLogout = async () => {

    setLogoutAccount(true);
    try {
      const { success } = await signOut();
      if (success) {
        navigate('/login');
      }
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Error al cerrar sesión',
        life: 3000
      });
    } finally {
      setLogoutAccount(false);
      setLogOutModalVisible(false);
    }
  };

  // Verificar si el usuario es un tutor o admin
  const isTutor = currentUser?.role === 'tutor';
  const isAdmin = localStorage.getItem('currentUserRole') === 'admin';

  // Cerrar el dropdown cuando se hace clic fuera de él
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !(dropdownRef.current as any).contains(event.target)) {
        setProfileDropdownOpen(false);
      }

      if (mobileMenuRef.current && !(mobileMenuRef.current as any).contains(event.target) &&
        !((event.target as HTMLElement).closest('.mobile-menu-button'))) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownRef, mobileMenuRef]);



  const isValidAvatarUrl = (url: string | undefined): boolean => {
    return !!url && (url.startsWith('http://') || url.startsWith('https://'));
  };

  if (loading) {
    return (
      <nav className="bg-dark-card border-b border-dark-border">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/dashboard" className="flex-shrink-0 flex items-center">
                <div className="h-8 w-8 flex items-center justify-center rounded">
                  <img src="/assets/imgs/TutorMatch.webp" alt="Logo" className="h-6 w-6" />
                </div>
                <span className="ml-2 text-white font-semibold text-lg">TutorMatch</span>
              </Link>
            </div>

            {/* Indicador de carga */}
            <div className="flex items-center">
              <Loader className="animate-spin text-primary h-5 w-5" />
              <span className="ml-2 text-light-gray">Cargando...</span>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  if (error || !currentUser) {
    return (
      <nav className="bg-dark-card border-b border-dark-border">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/dashboard" className="flex-shrink-0 flex items-center">
                <div className="h-8 w-8 flex items-center justify-center rounded">
                  <img src="/assets/imgs/TutorMatch.webp" alt="Logo" className="h-6 w-6" />
                </div>
                <span className="ml-2 text-white font-semibold text-lg">TutorMatch</span>
              </Link>
            </div>

            {/* Error o botón de inicio de sesión */}
            {error ? (
              <div className="text-red-500">{error}</div>
            ) : (
              <Link to="/login" className="px-4 py-2 rounded bg-primary hover:bg-primary-hover text-white font-medium">
                Iniciar Sesión
              </Link>
            )}
          </div>
        </div>
      </nav>
    );
  }

  const avatarInitial = currentUser.firstName?.charAt(0) || 'U';

  return (
    <>
      <nav className="bg-dark-card border-b border-dark-border">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/dashboard" className="flex-shrink-0 flex items-center">
                <div className="h-8 w-8 flex items-center justify-center rounded">
                  <img src="/assets/imgs/TutorMatch.webp" alt="Logo" className="h-6 w-6" />
                </div>
                <span className="ml-2 text-white font-semibold text-lg">TutorMatch</span>
              </Link>
            </div>

            {/* Botones a la derecha - visible en desktop */}
            <div className="hidden md:flex items-center space-x-4">
              {/* Solo mostrar botón de "Añadir Tutoría" si el usuario es un tutor */}
              {isTutor && (
                <button
                  className="px-4 py-2 rounded bg-primary hover:bg-primary-hover text-white font-medium"
                  onClick={handleOpenModal}
                >
                  Añadir Tutoría
                </button>
              )}
              {/* Solo mostrar botón de "Moderar" si el usuario es admin */}
              {isAdmin && (
                <button
                  className="px-4 py-2 rounded bg-primary hover:bg-primary-hover text-white font-medium"
                  onClick={() => navigate('/admin/dashboard')}
                >
                  Moderar
                </button>
              )}
              <button className="text-white rounded-full p-1 hover:bg-dark-light">
                <Globe className="h-6 w-6" />
              </button>
              <div className="relative" ref={dropdownRef}>
                <button
                  className="flex items-center space-x-1 text-white rounded-full hover:bg-dark-light p-1"
                  onClick={toggleProfileDropdown}
                >
                  {currentUser.avatar ? (
                    <img
                      src={currentUser.avatar}
                      alt="Avatar"
                      className="h-8 w-8 rounded-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                        console.error('Error al cargar avatar:', currentUser.avatar);
                      }}
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-red-600 flex items-center justify-center">
                      <span className="text-white">{avatarInitial}</span>
                    </div>
                  )}
                  <ChevronDown className="h-4 w-4" />
                </button>

                {/* Dropdown de perfil */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-dark-card border border-dark-border rounded-lg shadow-lg z-10">
                    <div className="p-4">
                      <div className="flex items-center mb-3">
                        {currentUser.avatar ? (
                          <img
                            src={currentUser.avatar}
                            alt="Avatar"
                            className="h-12 w-12 rounded-full object-cover mr-3"
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-full bg-red-600 flex items-center justify-center mr-3">
                            <span className="text-white text-xl">{avatarInitial}</span>
                          </div>
                        )}
                        <div>
                          <h3 className="text-white font-medium">{currentUser.firstName} {currentUser.lastName}</h3>
                          <p className="text-light-gray text-sm">{currentUser.email}</p>
                        </div>
                      </div>

                      <div className="border-t border-dark-border pt-3 mb-3">
                        <div className="flex justify-between items-center text-sm text-light-gray mb-1">
                          <span>{currentUser.semesterNumber}° Semestre <br /> {currentUser.academicYear}</span>
                        </div>
                        <div className="text-sm text-red-600">
                          <span>{currentUser.role === 'tutor' ? 'Tutor' : 'Estudiante'}</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Link to="/profile" className="block w-full text-center px-3 py-2 text-white hover:bg-dark-light hover:text-red-500 rounded">
                          Ver perfil completo
                        </Link>
                        <button
                          className="block w-full text-center px-3 py-2 text-red-500 hover:bg-dark-light hover:text-red-500 rounded"
                          onClick={() => setLogOutModalVisible(true)}
                        >
                          Cerrar sesión
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Botón de menú hamburguesa - visible solo en móvil */}
            <div className="flex md:hidden">
              <button
                aria-label="Abrir menú"
                className="mobile-menu-button p-2 rounded-md text-white hover:bg-dark-light"
                onClick={toggleMobileMenu}
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Menú móvil */}
        {mobileMenuOpen && (
          <div
            ref={mobileMenuRef}
            className="md:hidden bg-dark-card border-t border-dark-border z-20"
          >
            <div className="px-2 pt-2 pb-3 space-y-1">

              {/* Botones y opciones */}
              <div className="p-2">
                {/* Solo mostrar botón de "Añadir Tutoría" en móvil si el usuario es un tutor */}
                {isTutor && (
                  <button
                    className="w-full px-4 py-2 rounded bg-primary hover:bg-primary-hover text-white font-medium mb-2"
                    onClick={handleOpenModal}
                  >
                    Añadir Tutoría
                  </button>
                )}

                <div className="mt-3 pt-3 border-t border-dark-border">
                  <div className="flex items-center mb-2">
                    {isValidAvatarUrl(currentUser.avatar) ? (
                      <img
                        src={currentUser.avatar}
                        alt="Avatar"
                        className="h-8 w-8 rounded-full object-cover"
                        onError={(e) => {
                          // Fallback si hay error al cargar la imagen
                          console.warn('Error al cargar avatar, mostrando inicial');
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-red-600 flex items-center justify-center">
                        <span className="text-white">{avatarInitial}</span>
                      </div>
                    )}
                    <div>
                      <h3 className="text-white font-medium">{currentUser.firstName} {currentUser.lastName}</h3>
                      <p className="text-light-gray text-xs">{currentUser.email}</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-sm text-light-gray mt-2 mb-2">
                    <span>{currentUser.semesterNumber}° Semestre - {currentUser.academicYear}</span>
                    <span className="text-red-600">{currentUser.role === 'tutor' ? 'Tutor' : 'Estudiante'}</span>
                  </div>

                  <div className="space-y-1 mt-2">
                    <Link to="/profile" className="block w-full text-left px-3 py-2 text-white hover:bg-dark-light hover:text-red-500 rounded">
                      Ver perfil completo
                    </Link>
                    <button
                      className="block w-full text-left px-3 py-2 text-red-500 hover:bg-dark-light hover:text-red-500 rounded"
                      onClick={() => setLogOutModalVisible(true)}
                    >
                      Cerrar sesión
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Modal para crear tutoría - solo se renderizará si el usuario es tutor */}
      {isTutor && (
        <CreateTutoringModal
          visible={modalVisible}
          onHide={handleHideModal}
          onSave={handleSaveTutoring}
          currentUser={currentUser}
        />
      )}

      {/* Modal de confirmación para cerrar sesión */}
      <LogoutModal
        visible={isLogOutModalVisible}
        onHide={() => setLogOutModalVisible(false)}
        onConfirm={handleLogout}
        loading={logoutAccount}
      />
    </>
  );
};

export default Navbar;