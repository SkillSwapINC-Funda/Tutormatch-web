import React, { useState, useRef, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from 'primereact/button';
import { Image } from 'primereact/image';
import { Toast } from 'primereact/toast';
import { User } from '../types/User';
import { UserService } from '../services/UserService';
import { ProgressSpinner } from 'primereact/progressspinner';
import { useAvatar } from '../hooks/avatarContext';
import axios from 'axios';

const API_URL = import.meta.env.VITE_TUTORMATCH_BACKEND_URL;;

interface EditProfileModalProps {
  visible: boolean;
  onHide: () => void;
  user: User;
  onSave: (user: User) => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ visible, onHide, user, onSave }) => {
  const [formData, setFormData] = useState<User>(user);
  const [profileImage, setProfileImage] = useState<string | undefined>(user.avatar);
  const [uploadingImage, setUploadingImage] = useState<boolean>(false);
  const toast = useRef<Toast>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { updateAvatarUrl } = useAvatar();

  useEffect(() => {
    if (visible) {
      setFormData(user);
      setProfileImage(user.avatar);
    }
  }, [user, visible]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      // Solo permitir dígitos numéricos (0-9)
      const numericValue = value.replace(/[^0-9]/g, '');

      // Validación específica para teléfonos peruanos que deben empezar con 9
      if (numericValue.length > 0 && numericValue[0] !== '9') {
        // Si no empieza con 9, forzar que empiece con 9
        setFormData({ ...formData, [name]: '9' + numericValue.substring(numericValue.length > 1 ? 1 : 0) });
      } else {
        setFormData({ ...formData, [name]: numericValue });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSave = () => {
    onSave({ ...formData, avatar: profileImage });
    onHide();
    toast.current?.show({ severity: 'success', summary: 'Éxito', detail: 'Perfil actualizado correctamente', life: 3000 });
    window.location.reload();
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;

    if (!files || files.length === 0) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Aviso',
        detail: 'No se seleccionó ninguna imagen',
        life: 3000
      });
      return;
    }

    const file = files[0];
    console.log('Archivo seleccionado:', file.name, 'Tamaño:', file.size, 'Tipo:', file.type);

    try {
      setUploadingImage(true);

      // Validaciones básicas
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('El archivo es demasiado grande. Máximo 5MB.');
      }

      if (!['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'].includes(file.type)) {
        throw new Error('Tipo de archivo inválido. Solo PNG, JPEG, GIF o WebP.');
      }

      // Previsualización inmediata antes de la carga
      const reader = new FileReader();
      reader.onload = (e: any) => {
        setProfileImage(e.target.result);
      };
      reader.readAsDataURL(file);

      // Mostrar toast de carga iniciada
      toast.current?.show({
        severity: 'info',
        summary: 'Subiendo',
        detail: 'Subiendo imagen al servidor...',
        life: 3000
      });

      // Subir archivo usando el servicio mejorado
      console.log('Enviando archivo al servicio...');
      const uploadedUrl = await UserService.uploadAvatar(formData.id, file);
      console.log('URL recibida:', uploadedUrl);

      // Actualizar con la URL real del servidor
      setProfileImage(uploadedUrl);

      setFormData(prevFormData => ({
        ...prevFormData,
        avatar: uploadedUrl
      }));

      updateAvatarUrl(uploadedUrl);

      toast.current?.show({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Imagen subida correctamente',
        life: 3000
      });
    } catch (error: any) {
      console.error('Error detallado al subir imagen:', error);

      // Limpiar la previsualización si hay error
      setProfileImage(user.avatar);

      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: error.message || 'Error al subir la imagen',
        life: 5000
      });
    } finally {
      setUploadingImage(false);
    }


  };

  const handleRemoveImage = async () => {
    // Si no hay imagen, no hay nada que eliminar
    if (!profileImage) {
      return;
    }

    try {
      setUploadingImage(true);

      // Extraer el nombre del archivo del avatar actual
      let avatarFileName = null;
      try {
        const avatarUrl = new URL(profileImage);
        const pathParts = avatarUrl.pathname.split('/');
        // El nombre del archivo suele ser el último segmento de la ruta
        avatarFileName = pathParts[pathParts.length - 1];
      } catch (e) {
        console.warn('No se pudo obtener el nombre del archivo del avatar:', e);
        throw new Error('No se pudo identificar el archivo de avatar para eliminar');
      }

      // Mostrar toast de carga
      toast.current?.show({
        severity: 'info',
        summary: 'Eliminando',
        detail: 'Eliminando foto de perfil...',
        life: 3000
      });

      // Eliminar el avatar del storage
      const deleteResponse = await axios.delete(
        `${API_URL}/storage/avatars/${formData.id}/${avatarFileName}`
      );

      console.log('Respuesta de eliminación:', deleteResponse.data);

      if (deleteResponse.data && deleteResponse.data.success) {
        // Limpiar la imagen de perfil
        setProfileImage(undefined);

        // Actualizar el formData
        setFormData(prevFormData => ({
          ...prevFormData,
          avatar: undefined
        }));

        // Actualizar el avatar en el contexto
        updateAvatarUrl(null);

        // Limpiar el input de archivo
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }

        // Mostrar toast de éxito
        toast.current?.show({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Foto de perfil eliminada correctamente',
          life: 3000
        });
      } else {
        throw new Error('No se pudo eliminar la foto de perfil');
      }
    } catch (error: any) {
      console.error('Error al eliminar avatar:', error);

      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: error.message || 'Error al eliminar la foto de perfil',
        life: 5000
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const headerElement = (
    <div className="w-full flex justify-between items-center text-white">
      <h2 className="text-xl font-semibold">Editar Perfil</h2>
      <button
        onClick={onHide}
        className="text-white bg-transparent hover:text-gray-400"
      >
        ✕
      </button>
    </div>
  );

  return (
    <>
      <Toast ref={toast} />
      <Dialog
        visible={visible}
        onHide={onHide}
        style={{ width: '95%', maxWidth: '600px' }}
        modal
        header={headerElement}
        footer={false}
        className="border-none shadow-xl"
        draggable={false}
        resizable={false}
        closable={false}
        contentClassName="bg-[#1f1f1f] text-white p-6"
      >
        <div className="space-y-6">
          {/* Foto de perfil */}
          <div>
            <h3 className="text-lg font-medium mb-4">Foto de Perfil</h3>
            <div className="flex items-center gap-4">
              <div className="relative w-24 h-24 rounded-full overflow-hidden border border-gray-300 flex items-center justify-center bg-primary">
                {uploadingImage ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <ProgressSpinner style={{ width: '50px', height: '50px' }} strokeWidth="4" fill="#1f1f1f" animationDuration=".5s" />
                  </div>
                ) : profileImage ? (
                  <Image
                    src={profileImage}
                    alt="Foto de perfil"
                    width="100"
                    preview
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white text-4xl font-bold">
                    {formData.firstName?.charAt(0) || formData.lastName?.charAt(0) || 'U'}
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="profile-image-upload"
                  className={`block text-center text-sm text-white py-2 px-4 rounded bg-primary font-semibold cursor-pointer hover:bg-primary-hover transition-all ${uploadingImage ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {uploadingImage ? 'Subiendo...' : 'Cambiar foto'}
                </label>
                <input
                  ref={fileInputRef}
                  id="profile-image-upload"
                  type="file"
                  accept="image/png, image/jpeg, image/jpg"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={uploadingImage}
                />
                {profileImage && (
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="text-sm text-red-500 hover:text-red-400 transition-colors"
                    disabled={uploadingImage}
                  >
                    Eliminar foto
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Nombre */}
          <div>
            <label htmlFor="firstName" className="text-light block mb-2">Nombre</label>
            <InputText
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              className="w-full bg-dark-light text-light border border-dark-border px-3 py-2 rounded-md"
            />
          </div>

          {/* Apellido */}
          <div>
            <label htmlFor="lastName" className="text-light block mb-2">Apellido</label>
            <InputText
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              className="w-full bg-dark-light text-light border border-dark-border px-3 py-2 rounded-md"
            />
          </div>

          {/* Año académico */}

          <div>
            <label htmlFor="academicYear" className="text-light block mb-2">Año Académico</label>
            <InputText
              id="academicYear"
              name="academicYear"
              value={formData.academicYear}
              onChange={handleInputChange}
              className="w-full bg-dark-light text-light border border-dark-border px-3 py-2 rounded-md"
            />
          </div>

          {/* Teléfono */}
          <div>
            <label htmlFor="phone" className="text-light block mb-2">
              Teléfono
              <span className="text-xs text-gray-400 ml-2">(Solo números, formato peruano)</span>
            </label>
            <InputText
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full bg-dark-light text-light border border-dark-border px-3 py-2 rounded-md"
              placeholder="Ejemplo: 999999999"
              maxLength={9}
              keyfilter="int" // Filtro de PrimeReact para permitir solo enteros
              tooltip="Debe empezar con 9 y tener 9 dígitos sin espacios ni caracteres especiales"
              tooltipOptions={{ position: 'top', showDelay: 200 }}
            />
            <small className="text-gray-400 block mt-1">
              Debe empezar con 9 y contener 9 dígitos sin espacios ni caracteres especiales.
            </small>
          </div>

          {/* Biografía */}
          <div>
            <label htmlFor="bio" className="text-light block mb-2">Biografía</label>
            <InputTextarea
              id="bio"
              name="bio"
              rows={4}
              value={formData.bio}
              onChange={handleInputChange}
              className="w-full bg-dark-light text-light border border-dark-border px-3 py-2 rounded-md"
            />
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              label="Cancelar"
              icon="pi pi-times"
              className="p-button-text text-light-gray hover:text-white"
              onClick={onHide}
              disabled={uploadingImage}
            />
            <Button
              label="Guardar"
              icon="pi pi-check"
              className="p-button-primary bg-primary hover:bg-primary-hover text-white"
              onClick={handleSave}
              disabled={uploadingImage}
            />
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default EditProfileModal;