import React from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';

interface DeleteAccountModalProps {
  visible: boolean;
  onHide: () => void;
  onConfirm: () => void;
  loading: boolean;
}

const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({ visible, onHide, onConfirm, loading }) => {
  const headerElement = (
    <div className="w-full flex justify-between items-center text-white">
      <h2 className="text-xl font-semibold">Eliminar Cuenta</h2>
      <button
        onClick={onHide}
        className="text-white bg-transparent hover:text-gray-400"
      >
        ✕
      </button>
    </div>
  );
  return (
    <Dialog
      header={headerElement}
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
          <div className="bg-red-500 bg-opacity-10 p-3 rounded-full mr-4">
            <i className="pi pi-exclamation-triangle text-primary text-2xl"></i>
          </div>
          <h2 className="text-xl font-bold text-white">¿Eliminar tu cuenta?</h2>
        </div>

        <p className="text-light-gray mb-4">
          Estás a punto de eliminar tu cuenta permanentemente. Esta acción no se puede deshacer y toda tu información será eliminada definitivamente.
        </p>

        <div className="grid grid-cols-2 gap-2 mb-5">
          <div className="flex items-center">
            <i className="pi pi-user text-light-gray mr-2"></i>
            <span className="text-light-gray">Perfil completo</span>
          </div>
          <div className="flex items-center">
            <i className="pi pi-book text-light-gray mr-2"></i>
            <span className="text-light-gray">Todas tus tutorías</span>
          </div>
          <div className="flex items-center">
            <i className="pi pi-history text-light-gray mr-2"></i>
            <span className="text-light-gray">Historial de actividad</span>
          </div>
          <div className="flex items-center">
            <i className="pi pi-id-card text-light-gray mr-2"></i>
            <span className="text-light-gray">Datos personales</span>
          </div>
        </div>

        <div className="bg-dark p-3 rounded border border-primary border-opacity-30 mb-4">
          <div className="flex items-center">
            <i className="pi pi-info-circle text-primary mr-2"></i>
            <p className="text-light-gray text-sm">Esta acción es permanente y no se puede deshacer.</p>
          </div>
        </div>

        <p className="text-light-gray mb-4">
          Si estás seguro de que deseas continuar, haz clic en "Eliminar mi cuenta".
        </p>

        <div className="flex justify-end bg-[#1e1f1e]">
          <Button
            label={loading ? "Eliminando..." : "Eliminar"}
            icon={loading ? null : "pi pi-trash"}
            onClick={onConfirm}
            className="bg-primary hover:bg-primary-hover text-white border-none transition-colors duration-200 shadow-md"
            loading={loading}
            loadingIcon="pi pi-spinner pi-spin"
            style={{ fontWeight: 500 }}
          />
        </div>
      </div>
    </Dialog>
  );
};

export default DeleteAccountModal;