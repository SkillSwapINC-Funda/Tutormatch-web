import React, { useState, useEffect } from 'react';
import { User as UserType } from '../../../user/types/User';
import Navbar from '../../../dashboard/components/Navbar';
import Footer from '../../components/Footer';
import EditProfileModal from '../../../user/components/EditProfileModal';
import DeleteAccountModal from '../../../user/components/DeleteProfileModal';
import { Loader, LogOut, Pencil, Phone, Trash2, User } from 'lucide-react';
import { UserService } from '../../../user/services/UserService';
import { Toast } from 'primereact/toast';
import { useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { AuthService } from '../../services/authService';
import LogoutModal from '../../../user/components/LogOutProfileModal';

const ProfilePage: React.FC = () => {
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [isDeleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [isLogOutModalVisible, setLogOutModalVisible] = useState(false);
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const [logoutAccount, setLogoutAccount] = useState(false);
  const toast = useRef<any>(null);
  const navigate = useNavigate();
  const { signOut, user: authUser } = useAuth();
  const { userId } = useParams<{ userId: string }>();

  // Obtener los datos del usuario actual
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);

        // Si hay un userId en la URL, estamos viendo el perfil de otro usuario
        if (userId) {
          // Verificar si el usuario que estamos viendo es el usuario actual
          const currentUserId = AuthService.getCurrentUserId();
          setIsCurrentUser(userId === currentUserId);

          // Obtener los datos del usuario por ID
          const userData = await UserService.getUserById(userId);
          setUser(userData);
          return;
        }

        // Si no hay userId, estamos viendo nuestro propio perfil
        setIsCurrentUser(true);

        // Primero intentamos obtener el usuario del hook useAuth
        if (authUser) {
          setUser(authUser);
          setLoading(false);
          return;
        }

        // Si no está en el hook, intentamos obtenerlo desde AuthService
        const currentUserId = AuthService.getCurrentUserId();
        if (!currentUserId) {
          // Si no hay ID de usuario, redirigir al login
          toast.current?.show({
            severity: 'error',
            summary: 'Error',
            detail: 'Sesión no encontrada. Por favor inicia sesión.',
            life: 3000
          });
          navigate('/login');
          return;
        }

        // Obtener el perfil completo desde AuthService
        const userProfile = await AuthService.getCurrentUserProfile();
        if (userProfile) {
          setUser(userProfile);
        } else {
          // Como último recurso, intentar obtener desde el UserService
          const userData = await UserService.getUserById(currentUserId);
          setUser(userData);
        }
      } catch (error: any) {
        console.error('Error al obtener datos del usuario:', error);
        toast.current?.show({
          severity: 'error',
          summary: 'Error',
          detail: error.response?.data?.message || 'Error al cargar los datos del perfil',
          life: 3000
        });
        // Si falla la obtención de datos, redirigir al login
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [authUser, navigate, userId]);

  const handleSaveProfile = async (updatedUser: UserType) => {
    try {
      if (!user) {
        throw new Error('No hay usuario para actualizar');
      }

      // Actualizar el perfil del usuario
      await UserService.updateProfile(updatedUser);
      setUser(updatedUser);

      toast.current?.show({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Perfil actualizado correctamente',
        life: 3000
      });
    } catch (error: any) {
      console.error('Error al actualizar perfil:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: error.response?.data?.message || 'Error al actualizar perfil',
        life: 3000
      });
    }
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

  const handleDeleteAccount = async () => {
    if (!user) return;

    setDeletingAccount(true);
    try {
      // Eliminar la cuenta del usuario
      await UserService.deleteAccount(user.id);

      // Cerrar sesión después de eliminar la cuenta
      await signOut();

      toast.current?.show({
        severity: 'success',
        summary: 'Cuenta eliminada',
        detail: 'Tu cuenta ha sido eliminada correctamente',
        life: 3000
      });

      // Redirigir al inicio después de un breve retraso
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (error: any) {
      console.error('Error al eliminar cuenta:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: error.response?.data?.message || 'Error al eliminar la cuenta',
        life: 3000
      });
    } finally {
      setDeletingAccount(false);
      setDeleteModalVisible(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-[#1e1e1e] text-white">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader className="animate-spin text-primary h-10 w-10 mb-4" />
          <div className="text-white ml-3">Cargando datos del perfil...</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col min-h-screen bg-[#1e1e1e] text-white">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-xl">No se encontró información del usuario</div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <>
      <Toast ref={toast} />
      <div className="flex flex-col min-h-screen bg-[#1e1e1e] text-white">
        <Navbar />
        {/* Contenido principal */}
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="bg-[#2c2c2c] p-6 rounded-lg shadow-lg w-full max-w-4xl relative">
            {/* Botón de editar - solo visible para el usuario actual */}
            {isCurrentUser && (
              <button
                className="absolute top-4 right-4 px-4 py-2 bg-[#404040] text-white rounded-lg border border-[#555555] hover:bg-[#505050] hover:border-[#666666] transition-all text-sm flex items-center gap-2"
                onClick={() => setEditModalVisible(true)}
              >
                <Pencil />
              </button>
            )}

            {/* Encabezado del perfil */}
            <div className="flex flex-col sm:flex-row items-center gap-6 mb-6">
              <div className="w-24 h-24 md:w-32 md:h-32 bg-primary rounded-full flex items-center justify-center mb-4 md:mb-0 md:mr-6 overflow-hidden">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={`${user.firstName} ${user.lastName}`}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <span className="text-white text-4xl font-bold">
                    {user.firstName?.charAt(0) || user.lastName?.charAt(0) || 'U'}
                  </span>
                )}
              </div>
              <div className="text-center sm:text-left">
                <h1 className="text-3xl font-bold">{user.firstName} {user.lastName}</h1>
                <p className="text-gray-400">{user.email}</p>
                <p className="text-sm text-gray-500">Miembro desde {user.createdAt.toLocaleDateString('es-ES')}</p>
                <p className="text-sm text-red-600">{user.role === 'tutor' ? 'Tutor' : 'Estudiante'} • {user.semesterNumber}° Semestre</p>
                <p className='text-sm text-gray-500'>{user.academicYear}</p>
              </div>
            </div>

            {/* Información adicional */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
                <span>
                  <User />
                </span>
                Acerca de mí
              </h2>
              <p className="text-gray-300 text-sm">{user.bio || 'Sin biografía disponible.'}</p>
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
                <span>
                  <Phone />
                </span>
                Contacto
              </h2>
              <p className="text-gray-300 text-sm">
                {user.phone ? (
                  <a
                    href={`https://wa.me/51${user.phone.replace(/\s/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"                  >
                    +51 {user.phone.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3')}
                  </a>
                ) : (
                  'No hay número de teléfono disponible.'
                )}
              </p>
            </div>

            {/* Opciones de perfil - solo visibles para el usuario actual */}
            {isCurrentUser && (
              <div>
                <div className="flex justify-between">
                  <button
                    className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all text-sm flex items-center gap-2"
                    onClick={() => setLogOutModalVisible(true)}
                  >
                    <LogOut /> Cerrar sesión
                  </button>

                  <button
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500 transition-all text-sm flex items-center gap-2"
                    onClick={() => setDeleteModalVisible(true)}
                  >
                    <Trash2 />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <Footer />

        {/* Modales - solo se renderizan para el usuario actual */}
        {isCurrentUser && (
          <>
            <EditProfileModal
              visible={isEditModalVisible}
              onHide={() => setEditModalVisible(false)}
              user={user}
              onSave={handleSaveProfile}
            />

            <DeleteAccountModal
              visible={isDeleteModalVisible}
              onHide={() => setDeleteModalVisible(false)}
              onConfirm={handleDeleteAccount}
              loading={deletingAccount}
            />

            <LogoutModal
              visible={isLogOutModalVisible}
              onHide={() => setLogOutModalVisible(false)}
              onConfirm={handleLogout}
              loading={logoutAccount}
            />
          </>
        )}
      </div>
    </>
  );
};

export default ProfilePage;