import { User, FileText, Filter, FileImage, X, Eye, Check, Calendar, ChevronUp, ChevronDown } from 'lucide-react';

interface Props {
  paginatedMemberships: any[];
  getStatusBadge: (status: string) => string;
  getStatusIcon: (status: string) => React.ReactNode;
  getStatusText: (status: string) => string;
  handleApprove: (id: string) => void;
  handleReject: (id: string) => void;
  setModalImage: (url: string) => void;
  setModalOpen: (open: boolean) => void;
  sortOrder: 'asc' | 'desc';
  setSortOrder: (order: 'asc' | 'desc') => void;
  startIndex: number;
  endIndex: number;
  totalItems: number;
  totalPages: number;
  currentPage: number;
  goToPage: (page: number) => void;
  generatePageNumbers: () => (number | string)[];
}

export default function MembershipTable({
  paginatedMemberships,
  getStatusBadge,
  getStatusIcon,
  getStatusText,
  handleApprove,
  handleReject,
  setModalImage,
  setModalOpen,
  sortOrder,
  setSortOrder
}: Props) {
  return (
    <div className="hidden lg:block bg-dark rounded-xl border border-white/20 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-white/20">
          <thead className="bg-gray-800">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-red-100 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Usuario
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-red-100 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Tipo
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-red-100 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Estado
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-red-100 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <FileImage className="w-4 h-4" />
                  Comprobante
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-red-100 uppercase tracking-wider">
                Acciones
              </th>
              <th 
                className="px-6 py-4 text-left text-xs font-medium text-red-100 uppercase tracking-wider cursor-pointer hover:bg-gray-700 transition-colors select-none"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Fecha</span>
                  {sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="bg-dark divide-y divide-white/10">
            {paginatedMemberships.map((m) => (
              <tr key={m.id} className="hover:bg-gray-800 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center border border-white/30">
                    </div>
                    <div className="ml-4">
                      <div className="text-sm text-red-200">ID: {m.userId.slice(0, 8)}...</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-blue-900/30 text-blue-200 border border-blue-700">
                    <FileText className="w-3 h-3" />
                    {m.type}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={getStatusBadge(m.status)}>
                    {getStatusIcon(m.status)}
                    {getStatusText(m.status)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {m.paymentProof ? (
                    <button
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors border border-indigo-500"
                      onClick={() => {
                        setModalImage(m.paymentProof);
                        setModalOpen(true);
                      }}
                    >
                      <Eye className="w-4 h-4" />
                      Ver comprobante
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-gray-700/30 text-gray-300 border border-gray-600">
                      <X className="w-4 h-4" />
                      No adjunto
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {m.status === 'pending' ? (
                    <div className="flex space-x-2">
                      <button
                        className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors border border-emerald-500"
                        onClick={() => handleApprove(m.id)}
                      >
                        <Check className="w-4 h-4" />
                        Aprobar
                      </button>
                      <button
                        className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors border border-red-500"
                        onClick={() => handleReject(m.id)}
                      >
                        <X className="w-4 h-4" />
                        Rechazar
                      </button>
                    </div>
                  ) : (
                    <span className={getStatusBadge(m.status)}>
                      {getStatusIcon(m.status)}
                      {getStatusText(m.status)}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-red-200">
                  {m.createdAt ? new Date(m.createdAt).toLocaleString('es-ES', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  }) : '-'}
                </td>
              </tr>
            ))}
            {paginatedMemberships.length === 0 && (
              <tr className="hidden lg:table-row">
                <td colSpan={6} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center space-y-3">
                    <FileText className="w-12 h-12 text-red-300" />
                    <p className="text-red-200 font-medium">No hay membresías para mostrar</p>
                    <p className="text-sm text-red-300">Las nuevas solicitudes aparecerán aquí</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
