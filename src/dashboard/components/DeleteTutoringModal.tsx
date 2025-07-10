import React, { useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { ProgressSpinner } from 'primereact/progressspinner';
import { TutoringSession } from '../../tutoring/types/Tutoring';

interface DeleteTutoringModalProps {
    visible: boolean;
    onHide: () => void;
    onDelete: () => Promise<void>;
    tutoring: TutoringSession | null;
}

const DeleteTutoringModal: React.FC<DeleteTutoringModalProps> = ({
    visible,
    onHide,
    onDelete,
    tutoring
}) => {
    const [isDeleting, setIsDeleting] = useState<boolean>(false);

    const handleDeleteConfirm = async () => {
        if (!tutoring) return;

        setIsDeleting(true);
        try {
            await onDelete();
            // El manejo del éxito ocurre en el componente padre
        } catch (error) {
            console.error('Error al eliminar tutoría:', error);
            // El manejo del error ocurre en el componente padre
        } finally {
            setIsDeleting(false);
        }
    };

    const headerElement = (
        <div className="w-full flex justify-between items-center text-white">
            <h2 className="text-xl font-semibold">Eliminar Tutoría</h2>
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
                    <h2 className="text-xl font-bold text-white">¿Eliminar esta tutoría?</h2>
                </div>

                {tutoring && (
                    <div className="bg-dark p-3 rounded mb-4 border border-dark-border">
                        <p className="text-white font-medium">{tutoring.title}</p>
                    </div>
                )}

                <p className="text-light-gray mb-4">
                    Esta acción eliminará permanentemente la tutoría, incluyendo:
                </p>

                <div className="grid grid-cols-2 gap-2 mb-5">
                    <div className="flex items-center">
                        <i className="pi pi-calendar text-light-gray mr-2"></i>
                        <span className="text-light-gray">Horarios disponibles</span>
                    </div>
                    <div className="flex items-center">
                        <i className="pi pi-star text-light-gray mr-2"></i>
                        <span className="text-light-gray">Reseñas asociadas</span>
                    </div>
                    <div className="flex items-center">
                        <i className="pi pi-book text-light-gray mr-2"></i>
                        <span className="text-light-gray">Materiales de estudio</span>
                    </div>
                    <div className="flex items-center">
                        <i className="pi pi-image text-light-gray mr-2"></i>
                        <span className="text-light-gray">Imagen de la tutoría</span>
                    </div>
                </div>

                <div className="bg-dark p-3 rounded border border-primary border-opacity-30 mb-2">
                    <div className="flex items-center">
                        <i className="pi pi-info-circle text-primary mr-2"></i>
                        <p className="text-light-gray text-sm">Esta acción no se puede deshacer.</p>
                    </div>
                </div>

                <div className="flex justify-end bg-[#1e1f1e]">
                    <Button
                        label={isDeleting ? "Eliminando..." : "Eliminar"}
                        icon={isDeleting ? null : "pi pi-trash"}
                        onClick={handleDeleteConfirm}
                        className="bg-primary hover:bg-primary-hover text-white border-none transition-colors duration-200 shadow-md"
                        disabled={isDeleting}
                        style={{ fontWeight: 500 }}
                    >
                        {isDeleting && <ProgressSpinner style={{ width: '20px', height: '20px' }} strokeWidth="4" className="mr-2" />}
                    </Button>
                </div>
            </div>
        </Dialog>
    );
};

export default DeleteTutoringModal;