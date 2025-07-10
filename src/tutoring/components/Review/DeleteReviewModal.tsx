import React from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { TutoringReview } from '../../types/Tutoring';

interface DeleteReviewModalProps {
  visible: boolean;
  onHide: () => void;
  onConfirm: () => void;
  review: TutoringReview | null;
  loading?: boolean;
}

const DeleteReviewModal: React.FC<DeleteReviewModalProps> = ({
  visible,
  onHide,
  onConfirm,
  review,
  loading = false
}) => {
  if (!review) return null;

  const headerElement = (
    <div className="w-full flex justify-between items-center text-white">
      <h2 className="text-xl font-semibold">Eliminar Reseña</h2>
      <button
        onClick={onHide}
        className="text-white bg-transparent hover:text-gray-400"
        disabled={loading}
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
      headerClassName="bg-[#252525] px-4 py-3 border-b border-[#4a4a4a]"
      className="bg-[#252525] shadow-xl"
      breakpoints={{ '960px': '80vw', '640px': '90vw' }}
    >
      <div className="flex flex-col p-5 bg-[#252525]">
        <div className="flex items-center mb-5">
          <div className="bg-red-500 bg-opacity-10 p-3 rounded-full mr-4">
            <i className="pi pi-exclamation-triangle text-red-500 text-2xl"></i>
          </div>
          <h3 className="text-xl font-bold text-white">¿Eliminar tu reseña?</h3>
        </div>

        <p className="text-gray-300 mb-4">
          Estás a punto de eliminar tu reseña permanentemente. Esta acción no se puede deshacer.
        </p>

        {/* Previsualización de la reseña */}
        <div className="bg-[#1e1e1e] p-4 rounded-lg border border-[#4a4a4a] mb-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex text-[#f05c5c]">
              {[...Array(5)].map((_, i) => (
                <span key={i} className={i < review.rating ? 'text-[#f05c5c]' : 'text-gray-600'}>
                  ★
                </span>
              ))}
            </div>
            <span className="text-sm text-gray-400">{review.rating}/5</span>
          </div>
          <p className="text-gray-300 text-sm italic">
            "{review.comment || 'Sin comentarios'}"
          </p>
        </div>

        <div className="bg-[#1e1e1e] p-3 rounded border border-red-500 border-opacity-30 mb-4">
          <div className="flex items-center">
            <i className="pi pi-info-circle text-red-500 mr-2"></i>
            <p className="text-gray-300 text-sm">Esta acción es permanente y no se puede deshacer.</p>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button
            label="Cancelar"
            icon="pi pi-times"
            onClick={onHide}
            className="p-button-text"
            disabled={loading}
          />
          <Button
            label={loading ? "Eliminando..." : "Eliminar Reseña"}
            icon={loading ? undefined : "pi pi-trash"}
            onClick={onConfirm}
            className="bg-red-600 border-red-600 hover:bg-red-700 hover:border-red-700 text-white"
            loading={loading}
            loadingIcon="pi pi-spinner pi-spin"
          />
        </div>
      </div>
    </Dialog>
  );
};

export default DeleteReviewModal;
