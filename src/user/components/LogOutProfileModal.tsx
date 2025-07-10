import React from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';

interface LogoutModalProps {
  visible: boolean;
  onHide: () => void;
  onConfirm: () => void;
  loading: boolean;
}

const LogoutModal: React.FC<LogoutModalProps> = ({ visible, onHide, onConfirm, loading }) => {
  return (
    <Dialog
      header={false}
      footer={false}
      draggable={false}
      resizable={false}
      closable={false}
      visible={visible}
      style={{ width: '450px', borderRadius: '8px', overflow: 'hidden' }}
      modal
      onHide={onHide}
      contentClassName="p-0"
      headerClassName="bg-dark px-4 py-3 border-b border-dark-border"
      className="bg-dark-card shadow-xl"
      breakpoints={{ '960px': '80vw', '640px': '90vw' }}
    >
      <div className="flex flex-col p-5 bg-[#1e1f1e]">
        <div className="flex items-center mb-5">
          <div className="bg-blue-500 bg-opacity-10 p-3 rounded-full mr-4">
            <i className="pi pi-sign-out text-blue-400 text-2xl"></i>
          </div>
          <h2 className="text-xl font-bold text-white">¿Deseas cerrar tu sesión?</h2>
        </div>

        <p className="text-light-gray mb-4">
          Estás a punto de cerrar tu sesión actual. Tendrás que volver a iniciar sesión para acceder a tu cuenta.
        </p>

        <div className="bg-dark p-3 rounded border border-blue-500 border-opacity-30 mb-4">
          <div className="flex items-center">
            <i className="pi pi-info-circle text-blue-400 mr-2"></i>
            <p className="text-light-gray text-sm">Por seguridad, cierra siempre tu sesión en dispositivos compartidos.</p>
          </div>
        </div>

        <div className="flex justify-end bg-[#1e1f1e] gap-2">
            
          <Button
            label={loading ? "Cerrando..." : "Sí"}
            icon={loading ? null : "pi pi-check"}
            onClick={onConfirm}
            className="bg-blue-600 hover:bg-blue-700 text-white border-none transition-colors duration-200 shadow-md"
            loading={loading}
            loadingIcon="pi pi-spinner pi-spin"
            style={{ fontWeight: 500 }}
          />
          <Button
            label="No"
            icon="pi pi-times"
            onClick={onHide}
            className="p-button-text hover:bg-dark-light text-light-gray"
            disabled={loading}
          />
        </div>
      </div>
    </Dialog>
  );
};

export default LogoutModal;