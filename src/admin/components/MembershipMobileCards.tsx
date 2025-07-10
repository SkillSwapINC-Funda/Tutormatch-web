import React from 'react';
import { FileText, Eye, X, Check } from 'lucide-react';

interface Props {
  filteredMemberships: any[];
  getStatusBadge: (status: string) => string;
  getStatusIcon: (status: string) => React.ReactNode;
  getStatusText: (status: string) => string;
  handleApprove: (id: string) => void;
  handleReject: (id: string) => void;
  setModalImage: (url: string) => void;
  setModalOpen: (open: boolean) => void;
}

export default function MembershipMobileCards({
  filteredMemberships,
  getStatusBadge,
  getStatusIcon,
  getStatusText,
  handleApprove,
  handleReject,
  setModalImage,
  setModalOpen
}: Props) {
  if (filteredMemberships.length === 0) {
    return (
      <div className="block lg:hidden">
        <div className="bg-dark rounded-xl p-6 text-center border border-white/20">
          <FileText className="w-12 h-12 text-red-300 mx-auto mb-3" />
          <p className="text-red-200 font-medium mb-2">No hay membresías para mostrar</p>
          <p className="text-sm text-red-300">
            Las nuevas solicitudes aparecerán aquí
          </p>
        </div>
      </div>
    );
  }
  return (
    <div className="block lg:hidden space-y-4">
      {filteredMemberships.map((m) => (
        <div key={m.id} className="bg-dark rounded-xl p-4 border border-white/20">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div>
                <div className="text-xs text-red-200">ID: {m.userId.slice(0, 8)}...</div>
              </div>
            </div>
            <div className="text-xs text-red-200 text-right">
              {m.createdAt ? new Date(m.createdAt).toLocaleString('es-ES', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              }) : '-'}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className="text-xs text-red-200 font-medium">Tipo</label>
              <div className="mt-1">
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-900/30 text-blue-200 border border-blue-700">
                  <FileText className="w-3 h-3" />
                  {m.type}
                </span>
              </div>
            </div>
            <div>
              <label className="text-xs text-red-200 font-medium">Estado</label>
              <div className="mt-1">
                <span className={getStatusBadge(m.status)}>
                  {getStatusIcon(m.status)}
                  {getStatusText(m.status)}
                </span>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <label className="text-xs text-red-200 font-medium">Comprobante</label>
            <div className="mt-2">
              {m.paymentProof ? (
                <button
                  className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 transition-colors border border-indigo-500"
                  onClick={() => {
                    setModalImage(m.paymentProof);
                    setModalOpen(true);
                  }}
                >
                  <Eye className="w-4 h-4" />
                  Ver comprobante
                </button>
              ) : (
                <span className="w-full inline-flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-sm font-medium bg-gray-700/30 text-gray-300 border border-gray-600">
                  <X className="w-4 h-4" />
                  No adjunto
                </span>
              )}
            </div>
          </div>

          {m.status === 'pending' && (
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 transition-colors border border-emerald-500"
                onClick={() => handleApprove(m.id)}
              >
                <Check className="w-4 h-4" />
                Aprobar
              </button>
              <button
                className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 transition-colors border border-red-500"
                onClick={() => handleReject(m.id)}
              >
                <X className="w-4 h-4" />
                Rechazar
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
