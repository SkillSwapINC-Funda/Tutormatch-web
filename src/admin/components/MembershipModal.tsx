import { FileImage, X, AlertTriangle } from 'lucide-react';

interface Props {
  modalOpen: boolean;
  modalImage: string | null;
  setModalOpen: (open: boolean) => void;
}

export default function MembershipModal({ modalOpen, modalImage, setModalOpen }: Props) {
  if (!modalOpen) return null;
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-black opacity-75"></div>
        </div>
        <div className="relative bg-gray-900 rounded-xl text-left overflow-hidden shadow-xl transform transition-all w-full max-w-lg border border-gray-700">
          <div className="bg-gray-900 px-4 sm:px-6 pt-4 sm:pt-5 pb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base sm:text-lg leading-6 font-semibold text-white flex items-center gap-2">
                <FileImage className="w-4 h-4 sm:w-5 sm:h-5" />
                Comprobante de Pago
              </h3>
              <button
                className="rounded-md text-gray-400 hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 p-1"
                onClick={() => setModalOpen(false)}
              >
                <X className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
            </div>
            <div className="flex justify-center">
              {modalImage ? (
                <img
                  src={modalImage}
                  alt="Comprobante de pago"
                  className="max-h-64 sm:max-h-96 max-w-full rounded-lg border border-gray-600 shadow-lg object-contain"
                />
              ) : (
                <div className="flex flex-col items-center py-8 text-gray-400">
                  <AlertTriangle className="w-12 h-12 sm:w-16 sm:h-16 mb-4" />
                  <p className="text-center text-sm sm:text-base">No se pudo cargar la imagen</p>
                </div>
              )}
            </div>
          </div>
          <div className="bg-gray-800 px-4 sm:px-6 py-3 border-t border-gray-700">
            <button
              type="button"
              className="w-full inline-flex justify-center items-center gap-2 rounded-lg border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-sm sm:text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              onClick={() => setModalOpen(false)}
            >
              <X className="w-4 h-4" />
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
