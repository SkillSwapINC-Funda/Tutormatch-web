import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  CheckCircle,
  ChevronLeft,
  Clock,
  FileText,
  RefreshCw,
  Users,
  XCircle,
} from 'lucide-react';
import MembershipStats from '../components/MembershipStats';
import MembershipTable from '../components/MembershipTable';
import MembershipMobileCards from '../components/MembershipMobileCards';
import MembershipModal from '../components/MembershipModal';

const API_URL = import.meta.env.VITE_TUTORMATCH_BACKEND_URL;

export default function AdminDashboardPage() {
  const [memberships, setMemberships] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalImage, setModalImage] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'active' | 'rejected'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  const navigate = useNavigate();


  // Referencia para comparar la data anterior
  const prevMembershipsRef = useRef<any[]>([]);

  useEffect(() => {
    const currentUserRole = localStorage.getItem('currentUserRole');
    if (currentUserRole !== 'admin') {
      navigate('/admin/dashboard');
      return;
    }
    fetchMemberships();
  }, []);

  // Polling automático para actualizar la data si hay cambios
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const response = await axios.get(`${API_URL}/memberships`);
        const newMemberships = response.data;
        // Solo actualiza si hay cambios en la cantidad o en los ids
        const prevMemberships = prevMembershipsRef.current;
        const prevIds = prevMemberships.map((m: any) => m.id).join(',');
        const newIds = newMemberships.map((m: any) => m.id).join(',');
        if (prevIds !== newIds || prevMemberships.length !== newMemberships.length) {
          setMemberships(newMemberships);
          prevMembershipsRef.current = newMemberships;
        }
      } catch { }
    }, 5000); // cada 5 segundos
    return () => clearInterval(interval);
  }, []);

  const fetchMemberships = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_URL}/memberships`);
      setMemberships(response.data);
    } catch (err: any) {
      setError('Error al cargar membresías');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await axios.patch(`${API_URL}/memberships/${id}/status`, { status: 'active' });
      fetchMemberships();
    } catch {
      alert('Error al aprobar membresía');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await axios.patch(`${API_URL}/memberships/${id}/status`, { status: 'rejected' });
      fetchMemberships();
    } catch {
      alert('Error al rechazar membresía');
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium gap-1";

    switch (status) {
      case 'pending':
        return `${baseClasses} bg-amber-900/30 text-amber-200 border border-amber-700`;
      case 'active':
        return `${baseClasses} bg-emerald-900/30 text-emerald-200 border border-emerald-700`;
      case 'rejected':
        return `${baseClasses} bg-red-900/30 text-red-200 border border-red-700`;
      default:
        return `${baseClasses} bg-gray-700/30 text-gray-300 border border-gray-600`;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'active': return 'Aprobada';
      case 'rejected': return 'Rechazada';
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-3 h-3" />;
      case 'active': return <CheckCircle className="w-3 h-3" />;
      case 'rejected': return <XCircle className="w-3 h-3" />;
      default: return <FileText className="w-3 h-3" />;
    }
  };

  const filteredMemberships = [...memberships]
    .filter((m) => statusFilter === 'all' ? true : m.status === statusFilter)
    .sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });

  // Cálculos de paginación
  const totalItems = filteredMemberships.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedMemberships = filteredMemberships.slice(startIndex, endIndex);

  // Reset página cuando cambia el filtro
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter]);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const generatePageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#a91d3a] to-[#4a0c2e] py-4 sm:py-8 px-2 sm:px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-start gap-3 sm:gap-4">
              <button
                className="flex-shrink-0 inline-flex items-center justify-center w-10 h-10 sm:w-auto sm:h-auto sm:px-4 sm:py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-white font-medium border border-white/20 transition-colors"
                onClick={() => navigate('/dashboard')}
              >
                <ChevronLeft className="w-5 h-5" />
                <span className="hidden sm:inline ml-2">Volver</span>
              </button>
              <div className="min-w-0 flex-1">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-1 sm:mb-2 leading-tight">
                  Panel de Membresías
                </h1>
                <p className="text-red-100 text-sm sm:text-base lg:text-lg">
                  Gestiona las solicitudes de membresía de los usuarios
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-dark rounded-lg px-3 py-2 sm:px-4 border border-white/20">
                <span className="text-xs sm:text-sm font-medium text-red-100">Total:</span>
                <span className="ml-2 text-lg sm:text-xl font-bold text-white">{memberships.length}</span>
              </div>
              {/* Botón de refrescar manual */}
              <button
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-colors text-sm font-medium"
                onClick={fetchMemberships}
                title="Refrescar"
              >
                <RefreshCw className="w-5 h-5 animate-spin-slow" />
                <span className="hidden sm:inline">Refrescar</span>
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 sm:py-20">
            <div className="flex flex-col items-center space-y-4">
              <RefreshCw className="h-10 w-10 sm:h-12 sm:w-12 text-white animate-spin" />
              <p className="text-white font-medium text-sm sm:text-base">Cargando membresías...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-900/30 border border-red-700 rounded-xl p-4 sm:p-6 text-center backdrop-blur-sm">
            <AlertTriangle className="h-6 w-6 sm:h-8 sm:w-8 text-red-300 mx-auto mb-3" />
            <p className="text-red-200 font-medium mb-4 text-sm sm:text-base">{error}</p>
            <button
              onClick={fetchMemberships}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm sm:text-base"
            >
              <RefreshCw className="w-4 h-4" />
              Reintentar
            </button>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {/* Stats Cards */}
            <MembershipStats memberships={memberships} statusFilter={statusFilter} setStatusFilter={setStatusFilter as (filter: string) => void} />

            {/* Mobile Filters */}
            <div className="block lg:hidden">
              <div className="bg-dark rounded-xl p-4 border border-white/20">
                <h4 className="text-white font-medium mb-3 text-sm">Filtrar por estado:</h4>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: 'all', label: 'Todas', icon: <Users className="w-4 h-4" /> },
                    { key: 'pending', label: 'Pendientes', icon: <Clock className="w-4 h-4" /> },
                    { key: 'active', label: 'Aprobadas', icon: <CheckCircle className="w-4 h-4" /> },
                    { key: 'rejected', label: 'Rechazadas', icon: <XCircle className="w-4 h-4" /> }
                  ].map((filter) => (
                    <button
                      key={filter.key}
                      className={`inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${statusFilter === filter.key
                          ? 'bg-white text-gray-900 shadow-md'
                          : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
                        }`}
                      onClick={() => setStatusFilter(filter.key as any)}
                    >
                      {filter.icon}
                      <span className="hidden sm:inline">{filter.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Table Card - Desktop */}
            <MembershipTable
              paginatedMemberships={paginatedMemberships}
              getStatusBadge={getStatusBadge}
              getStatusIcon={getStatusIcon}
              getStatusText={getStatusText}
              handleApprove={handleApprove}
              handleReject={handleReject}
              setModalImage={setModalImage}
              setModalOpen={setModalOpen}
              sortOrder={sortOrder}
              setSortOrder={setSortOrder}
              startIndex={startIndex}
              endIndex={endIndex}
              totalItems={totalItems}
              totalPages={totalPages}
              currentPage={currentPage}
              goToPage={goToPage}
              generatePageNumbers={generatePageNumbers}
            />

            {/* Mobile Cards */}
            <MembershipMobileCards
              filteredMemberships={filteredMemberships}
              getStatusBadge={getStatusBadge}
              getStatusIcon={getStatusIcon}
              getStatusText={getStatusText}
              handleApprove={handleApprove}
              handleReject={handleReject}
              setModalImage={setModalImage}
              setModalOpen={setModalOpen}
            />
          </div>
        )}

        {/* Modal */}
        <MembershipModal modalOpen={modalOpen} modalImage={modalImage} setModalOpen={setModalOpen} />
      </div>
    </div>
  );
}